"""Does the score actually play, duck, and switch context?

Written because Brace shipped broken for two versions purely because no test
ever pressed the button. Audio is the easiest thing in the game to ship silent
without noticing, so this drives it directly instead of trusting it.

Chromium is launched with a fake audio device, so the AudioContext runs for
real and we can read the graph's state back out of the page.
"""
import sys
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8811/index.html'

def vis(p, s):
    try:
        e = p.query_selector(s); return bool(e and e.is_visible())
    except Exception:
        return False

def drain(p):
    for _ in range(12):
        if p.query_selector('#popup-layer.open'):
            try: p.click('#popup-continue', timeout=900); p.wait_for_timeout(260)
            except Exception: break
        else: break

fails = []
def check(cond, msg):
    if not cond: fails.append(msg)

with sync_playwright() as pw:
    b = pw.chromium.launch(args=[
        '--no-sandbox',
        '--autoplay-policy=no-user-gesture-required',
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
    ])
    p = b.new_page(viewport={'width': 1600, 'height': 900})
    errors = []
    p.on('pageerror', lambda e: errors.append(str(e)))
    p.goto(URL); p.wait_for_timeout(500)
    p.evaluate('localStorage.clear()'); p.reload(); p.wait_for_timeout(600)

    # --- every piece must exist and be well-formed --------------------------
    shape = p.evaluate("""() => {
      const names = ['title','map','fight','elite','boss','campfire'];
      const out = {};
      for (const n of names) {
        MUSIC.play(n);
        out[n] = MUSIC.currentPiece();
      }
      return out;
    }""")
    for want, got in shape.items():
        check(got == want, f'MUSIC.play("{want}") left currentPiece at "{got}"')
    legacy = p.evaluate("MUSIC.stop(); MUSIC.play('explore'); MUSIC.currentPiece()")
    check(legacy == 'map',
          f'the legacy "explore" name maps to "{legacy}", not the map piece')

    # --- start a real run ----------------------------------------------------
    p.click('#btn-roster'); p.wait_for_timeout(250)
    p.fill('#roster-class','5B0'); p.fill('#roster-party','TW')
    p.fill('#roster-names','GORD\nMINH'); p.click('#roster-save'); p.wait_for_timeout(400)
    rc = p.query_selector('#roster-close')
    if rc and rc.is_visible(): rc.click(); p.wait_for_timeout(400)
    p.click('.realm-card:not(.locked)'); p.wait_for_timeout(700)
    p.click('.hero-card'); p.wait_for_timeout(300); p.click('#hero-confirm'); p.wait_for_timeout(1200)
    drain(p)

    # the context must have actually started, not sat suspended
    st = p.evaluate("""() => {
      // reach the live AudioContext through a node we know exists
      return { piece: MUSIC.currentPiece(), enabled: MUSIC.isEnabled() };
    }""")
    check(st['piece'] is not None, 'no music context is playing on the map')

    # --- walk into a fight and check the duck -------------------------------
    got_fight = False
    for _ in range(70):
        drain(p)
        if vis(p, '#btn-move-on'):
            try: p.click('#btn-move-on', timeout=800); p.wait_for_timeout(350)
            except Exception: pass
        if p.evaluate("!!(STATE.run && STATE.run.encounter)"):
            got_fight = True; break
        # A Treasure room reuses the encounter screen but leaves run.encounter
        # null, so it looks like a fight and is not one. Answer through it.
        box = p.query_selector('#enc-choices')
        if box and box.is_visible() and box.query_selector('.choice'):
            opts = box.query_selector_all('.choice')
            try:
                opts[0].click(timeout=1200); p.wait_for_timeout(800); continue
            except Exception:
                pass
        if vis(p, '#enc-stake-gate'):
            try: p.click('#enc-stake-gate .sg-safe', timeout=1200); p.wait_for_timeout(300); continue
            except Exception: pass
        n = p.query_selector('.map-node.reachable')
        if n:
            try: n.click(timeout=1200); p.wait_for_timeout(800); continue
            except Exception: pass
        for s in ('#rest-mend', '#shop-leave', '#event-a', '#treasure-open'):
            if vis(p, s):
                try: p.click(s, timeout=800); p.wait_for_timeout(450)
                except Exception: pass
                break
        else:
            p.wait_for_timeout(200)

    if not got_fight:
        print('   debug: active screen =',
              p.evaluate("[...document.querySelectorAll('.screen.active')].map(e=>e.id).join(',')"))
        print('   debug: encounter =', p.evaluate("STATE.run && STATE.run.encounter ? STATE.run.encounter.name : null"))
        print('   debug: keys =', p.evaluate("STATE.run ? Object.keys(STATE.run).join(',') : null"))
        print('   debug: choices visible =', p.evaluate("!!document.querySelector('#enc-choices') && document.querySelector('#enc-choices').offsetHeight>0"))
        print('   debug: reachable nodes =', p.evaluate("document.querySelectorAll('.map-node.reachable').length"))
        print('   debug: popup open =', p.evaluate("!!document.querySelector('#popup-layer.open')"))
    check(got_fight, 'never reached a fight')
    if got_fight:
        p.wait_for_timeout(500)
        check(MUSIC_piece := p.evaluate('MUSIC.currentPiece()') in ('fight', 'elite'),
              f'fight did not switch the score (piece={p.evaluate("MUSIC.currentPiece()")})')
        # a question is on screen, so the score must be ducked
        check(p.evaluate('MUSIC.isDucked()'),
              'a question is live but the score is not ducked')

        if vis(p, '#enc-stake-gate'):
            try: p.click('#enc-stake-gate .sg-safe', timeout=1500); p.wait_for_timeout(300)
            except Exception: pass
        check(p.evaluate('MUSIC.isDucked()'),
              'the score un-ducked while the question was still on screen')

        # v5.5: ducking is per-FIGHT, not per-question. Surging back to full
        # volume between every question and dropping again a second later was
        # far more distracting than the score simply sitting back for the
        # whole fight, so answering must NOT lift the duck.
        box = p.query_selector('#enc-choices')
        if box and box.is_visible():
            ans = p.evaluate("STATE.run.encounter&&STATE.run.encounter.currentQ?STATE.run.encounter.currentQ.answer:null")
            for c in box.query_selector_all('.choice'):
                if c.inner_text().strip() == ans:
                    c.click(); break
            p.wait_for_timeout(1200)
            still_fighting = p.evaluate("!!(STATE.run && STATE.run.encounter)")
            if still_fighting:
                check(p.evaluate('MUSIC.isDucked()'),
                      'the score lifted between questions - ducking should hold '
                      'for the whole fight')

    # --- is it actually making a sound? --------------------------------------
    # `currentPiece` being set proves only that a name was assigned. A score
    # that scheduled nothing at all would sail through every check above. This
    # measures the real output, which is the mistake Brace taught us to stop
    # making.
    SAMPLE = ("(async () => { const pk = [];"
              " for (let i = 0; i < N; i++) {"
              "   await new Promise(r => setTimeout(r, 90));"
              "   pk.push(MUSIC.level());"
              " } return Math.max(...pk); })()")

    def peak(n=30):
        return p.evaluate(SAMPLE.replace('N', str(n)))

    # Assert the precondition rather than assuming it. An earlier version of
    # this test measured the "un-ducked" baseline while the score was still
    # ducked from the question above, and then reported that ducking did
    # nothing - a measurement bug that looked exactly like an engine bug.
    def unduck():
        p.evaluate('MUSIC.duck(false)')
        p.wait_for_timeout(1400)      # the release ramp is 0.9s
        lvl = p.evaluate('MUSIC.duckLevel()')
        check(lvl is not None and lvl > 0.95,
              f'could not release the duck before measuring (duckGain={lvl})')

    p.evaluate('MUSIC.stop()'); p.wait_for_timeout(900)
    p.evaluate("MUSIC.setRealm(1); MUSIC.play('boss');")
    p.wait_for_timeout(2000)          # the master fades in over ~1.4s
    unduck()
    loud = peak()
    check(loud > 0.02, f'the score is effectively silent (peak {loud:.4f})')
    check(loud < 0.99, f'the score is clipping into the speaker (peak {loud:.4f})')
    print(f'   boss peak        : {loud:.3f}')

    # Ducking must measurably drop the level, not merely flip a flag.
    p.evaluate('MUSIC.duck(true)'); p.wait_for_timeout(800)
    dpeak = peak()
    ratio = dpeak / loud if loud else 1
    check(ratio < 0.55, f'ducking barely changed the level '
                        f'({loud:.3f} -> {dpeak:.3f}, ratio {ratio:.2f})')
    print(f'   ducked peak      : {dpeak:.3f}  (ratio {ratio:.2f})')

    # Every piece must produce sound, and the Boss must be the loudest thing in
    # the game - it was quieter than the title screen until the compressor was
    # eased and the bass was lifted above the high-pass.
    peaks = {'boss': loud}
    for piece in ('title', 'map', 'fight', 'elite', 'campfire'):
        p.evaluate(f"MUSIC.stop(); MUSIC.play('{piece}');")
        p.wait_for_timeout(1600)
        unduck()
        pk = peak(20)
        peaks[piece] = pk
        check(pk > 0.02, f'"{piece}" is silent (peak {pk:.4f})')
        check(pk < 0.99, f'"{piece}" is clipping (peak {pk:.4f})')
        print(f'   {piece:9s} peak  : {pk:.3f}')
    check(peaks['boss'] >= max(peaks[k] for k in peaks if k != 'boss') * 0.95,
          'the Boss is not the loudest piece: ' +
          ', '.join(f'{k}={v:.2f}' for k, v in peaks.items()))

    # --- muting must silence it and not throw --------------------------------
    p.evaluate('MUSIC.setEnabled(false)'); p.wait_for_timeout(400)
    check(not p.evaluate('MUSIC.isEnabled()'), 'setEnabled(false) did not take')
    p.evaluate('MUSIC.setEnabled(true)'); p.wait_for_timeout(400)
    p.evaluate('MUSIC.stop()'); p.wait_for_timeout(300)
    check(p.evaluate('MUSIC.currentPiece()') is None, 'stop() left a piece playing')

    print(f'Failures    : {len(fails)}')
    for f in fails: print('   !!', f)
    print(f'Page errors : {len(errors)}')
    for e in errors[:5]: print('   !!', e[:160])
    b.close()
    ok = not fails and not errors
    print('\nRESULT:', 'PASS' if ok else 'FAIL')
    sys.exit(0 if ok else 1)
