"""Shared walking helpers for the browser suites.

WHY THIS EXISTS, written down because the lesson cost most of a build:

v6.5 added one room type (the Chorus) and three question formats. Every browser
suite in this folder keeps its own hand-rolled walker, and each of those walkers
knew exactly one way to answer a question - click a `.choice` - and exactly the
set of rooms that existed when it was written. So one feature broke six suites,
in six different and confusing ways:

  test_playthrough   answered 0 questions and still reported PASS
  test_curriculum    stalled, and its log looked like dropped answers
  test_brace         reported Brace disabled in 8 scenarios out of 8
  test_announce      "never reached a fight"
  shot_realm2        photographed 1 sprite instead of 8
  (test_perks and test_resolution survived only because they stop at the
   first fight, before either feature can get in the way)

Not one of those failures was in the code under test. Every one of them looked
like a real regression for several minutes.

So: the two things that change whenever the game grows a new way to ask a
question or a new room to walk into now live HERE, once. A new format needs
teaching to answer_any(); a new room needs teaching to clear_rooms(). Suites
that use these get it for free.

Suites still carrying their own copy: test_playthrough, test_curriculum,
test_brace, test_announce. They work, and they were left alone rather than
rewritten at the end of a long build - but they should move over the next time
one of them is touched.
"""


def visible(page, selector):
    try:
        el = page.query_selector(selector)
        return bool(el and el.is_visible())
    except Exception:
        return False


def drain_popups(page, limit=12):
    """Dismiss stacked popup cards. Any one of them blocks every click under it."""
    for _ in range(limit):
        if page.query_selector('#popup-layer.open'):
            try:
                page.click('#popup-continue', timeout=900)
                page.wait_for_timeout(260)
                continue
            except Exception:
                break
        break


def clear_rooms(page, level='good'):
    """Handle any room that is not a fight and needs a press to move past.

    Returns True if it did something, so a caller can `continue`. A walker that
    meets a room it does not recognise parks in it for the rest of its budget,
    and every question after that goes unmeasured while the suite still reports
    success - which is worse than failing.
    """
    if visible(page, '#cho-judge'):
        try:
            page.click(f'#cho-judge .pixel-btn[data-level="{level}"]', timeout=1000)
            page.wait_for_timeout(340)
        except Exception:
            pass
        return True
    if visible(page, '#cho-next'):
        try:
            page.click('#cho-next', timeout=1000)
            page.wait_for_timeout(380)
        except Exception:
            pass
        return True
    return False


def answer_any(page, side='enc', want_right=True):
    """Answer whatever question is on screen, in whatever format, once.

    Returns True if a question was actually answered. `want_right` asks for a
    correct or a deliberately wrong answer where the format allows the choice.

    Every format renders inside `#{side}-choices` - see the note in
    renderQuestion about why that is load-bearing - so this only ever has to
    look in one place.
    """
    return page.evaluate("""([side, right]) => {
      const el = document.getElementById(side + '-choices');
      if (!el || !el.offsetParent) return false;
      const run = STATE.run;
      if (!run) return false;
      const m = side === 'boss' ? run.boss : run.encounter;
      const q = m && m.currentQ;
      const bare = w => w.replace(/[.,!?;:'"]+$/g, '');

      // ---- spot the error ----
      const words = [...el.querySelectorAll('.err-word:not(.locked):not(.ruled-out)')];
      if (words.length) {
        if (!q) { words[0].click(); return true; }
        const hit = right ? words.find(w => bare(w.textContent) === q.answer)
                          : words.find(w => bare(w.textContent) !== q.answer);
        (hit || words[0]).click();
        return true;
      }

      // ---- put it in order ----
      const pool = [...el.querySelectorAll('.order-pool .order-chip')];
      if (pool.length) {
        const order = (q && q.parts)
          ? (right ? q.parts : q.parts.slice().reverse())
          : pool.map(c => c.textContent);
        let moved = false;
        order.forEach(t => {
          const c = [...el.querySelectorAll('.order-pool .order-chip')]
            .find(x => x.textContent === t);
          if (c) { c.click(); moved = true; }
        });
        return moved;
      }

      // ---- three or four options ----
      // Also covers the treasure and event rooms, which put a question on the
      // encounter screen without a live encounter to read the answer from.
      const opts = [...el.querySelectorAll('.choice:not(.locked):not(.removed)')]
        .filter(c => c.offsetParent);
      if (!opts.length) return false;
      const want = q ? q.answer : null;
      let hit = null;
      if (want) {
        hit = right ? opts.find(c => c.textContent.trim() === want)
                    : opts.find(c => c.textContent.trim() !== want);
      }
      (hit || opts[0]).click();
      return true;
    }""", [side, bool(want_right)])
