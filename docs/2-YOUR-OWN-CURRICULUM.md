# Putting your own curriculum in

This is the long guide and the important one. Read it before you write anything.

The short version: **you write questions, and nothing else.** The dungeon, the
combat, the map, the music, the art, the teaching report and the balance are all
done and shared. A new unit is a question bank and about half a day of typing.

---

## 1. What you are actually making

One **realm** = one unit of your syllabus. The class walks a branching map,
fights things, and every action asks a question from that unit's bank.

A realm needs:

| | How many | What it is |
|---|---|---|
| Curriculum keys | ~32 | the individual things you want reviewed |
| Labels | one per key | what a teacher reads in the report |
| Ordinary questions | 6+ per key, ~200 | recognition and vocabulary |
| Elite questions | 1+ per key, ~40 | production — using the language |
| Art | none | borrow Realm 1's; see section 8 |

That is the whole job. **Six questions per key is not fussiness** — at three per
key, four classes in one day see nearly the same questions, because the game
works through untested keys first. Six is what fixes it.

---

## 2. The five rules that must not be broken

These came out of real lessons going wrong. A change that breaks one of them is
wrong even if it makes the game better in every other way.

**1 — Nothing may reduce the number of questions asked in a LESSON.** Review
volume is the entire point, and the unit that matters is the forty-five minutes
— not the run. A class that wipes starts again and keeps answering until the
bell, so a shorter run is followed by more runs and the total holds steady. That
was measured, not assumed.

So a mechanic *may* make a fight shorter; the RISKY stake does. What it may not
do is stop the questions coming. The safety net is that the boss's health is
built from the curriculum items the class did not reach, so racing through the
map makes the finale longer — the questions move, they are not lost.

**2 — Nothing may hide or remove the CORRECT answer.** Removing a *wrong*
option is fine and several things do it. Punishing a student who knew the answer
is backwards for a review game.

**3 — Real failure is wanted.** Runs are meant to be losable, about one in
two. A victory that cannot be lost is worth nothing, and classes ask to play
again after a defeat more than after a win. Do not quietly make it easier.

**4 — Do not reproduce your textbook.** Every question here was written from
scratch to test the same curriculum item without copying anyone's wording. Do
the same. If you use an AI, tell it this explicitly and check what comes back —
it is the instruction they are least reliable about.

**5 — Your passphrase is yours.** Never put it in a file, a message, or a
conversation with an AI. Nothing needs it except you.

---

## 3. Curriculum keys

A **key** is one thing you want reviewed: one word, one grammar point, one
skill. `"photosynthesis"`, `"past_simple_irregular"`, `"treaty_of_versailles"`.

The game tracks which keys a class has been tested on during a run, and the boss
draws from the ones they have not met yet. So the keys are how the game knows it
has covered your unit.

**Aim for about 32.** Fewer and the boss runs out of things to ask; many more
and a class never sees them all in one run.

### Every key needs a label — do not skip this

Keys are slugs, typed fast while writing questions. Three weeks later, in a
staff room, `g2-form` means nothing to anybody — and the teaching report is only
worth having if you can read a row and know what to reteach.

```js
const REALM3_LABELS = {
  "past_simple_irregular": { label: "past simple — irregular verbs",
                             group: "The past tense" },
  "photosynthesis":        { label: "photosynthesis",
                             group: "How plants feed" },
};
```

`label` is what the report prints. **`group` is what makes it useful**: one weak
row is noise, but five weak rows that are all past tense is Monday's lesson. Put
four to eight keys in each group.

`tools/check-content.html` fails if a key has questions but no label.

---

## 4. The shape of a question

There are four formats. Use the plain one for most things and the others for
variety — about one question in seven here is a non-plain format, which is
enough that the screen changes shape without the class having to learn four sets
of rules.

### Plain — three options

```js
{ cover:"camouflage", tier:2, type:"vocab", open:true,
  clue:"Complete it: 'The moth's ___ makes it look like a dead leaf.'",
  answer:"camouflage", choices:["camouflage","stripe","prey"] }
```

| Field | What it does |
|---|---|
| `cover` | the curriculum key this tests |
| `tier` | 1–2 for ordinary, 4 for elite. Higher tiers cost more when wrong. |
| `type` | a word shown on screen: `vocab`, `grammar`, `reason`, `fix it`… invent your own, it is only a label |
| `open` | **read the warning below** |
| `clue` | the question, exactly as the class reads it |
| `answer` | the correct option, spelled identically to its entry in `choices` |
| `choices` | three options, including the answer |

### ⚠ The `open` flag — the one that matters

`open: true` means **a student could say this answer out loud with nothing on
the screen**. The game uses it to offer a blind call for triple reward.

- `open: true` → *"Complete it: 'The storm ___ the roof.'"*
- `open: false` → *"Which sentence is correct?"*

Get it wrong in the `true` direction and you offer a class a question that
becomes unanswerable the moment the options vanish. That was a real bug here, in
19 questions out of 47, and it is invisible until it happens in a lesson. The
checker catches the common shape of it and cannot catch all of them — so think
about each one.

**The three other formats are always `open: false`.** There is nothing sayable
about a half-built sentence.

### Spot the error

The class reads a sentence and taps the one word that is wrong. The closest this
game gets to asking a child to produce language.

```js
{ cover:"g1-negative", tier:3, type:"fix it", format:"error", open:false,
  clue:"One word is wrong. Tap the mistake.",
  sentence:"We aren't go to travel in this storm.", answer:"go", fix:"going" }
```

**Two rules.** The wrong word must appear in the sentence spelled *exactly* as
in `answer`, and it must appear **only once** — otherwise there are two right
taps and only one counts. The checker enforces both.

### Put it in order

Tap the fragments into place. Excellent for anything that is really a word-order
problem: tenses, questions, tags, comparatives.

```js
{ cover:"g1-statement", tier:3, type:"order", format:"order", open:false,
  clue:"Put the sentence in the right order.",
  parts:["I", "am going to", "check", "the shelter"] }
```

Write `parts` in the **correct** order — the game shuffles them. Three to five
pieces. The class can take back the last piece once, so a misclick on a
classroom TV does not cost a heart.

### Odd one out

```js
{ cover:"classification", tier:2, type:"odd one out", format:"odd", open:false,
  clue:"Three of these are insects. Tap the one that is not.",
  answer:"a spider", choices:["an ant","a bee","a beetle","a spider"] }
```

**Four options**, not three.

> A fifth format, matching pairs, was built and cut. Three pairs need six rows
> of text, and on a classroom projector that squeezed the arena until the
> monster was a thumbnail. If you are tempted to add a format, that is the
> constraint to remember: the question panel and the picture share one screen.

---

## 5. Two banks per realm

**Ordinary questions** are what monsters ask: recognition, vocabulary,
completing a sentence. Tiers 1–2.

**Elite questions** are what elites and the boss ask. These should make a
student **use** the language rather than recognise it. Tier 4. An elite should
feel different the moment it appears.

```js
{ cover:"as_as_equal", tier:4, type:"apply", open:true,
  clue:"Compare your two hands in one sentence using 'as … as'.",
  answer:"as big as", choices:["as big as","bigger than","the biggest"] }
```

**Write at least one elite question per key.** Where a key has none, the boss
falls back to the easy version and the finale is quietly easier than it should
be. The checker warns about this.

---

## 6. How the writing actually goes

Two hundred questions is a lot of typing and exactly the sort of work an AI
assistant does well — *if* the job is broken up properly and somebody checks
what comes back.

**Teacher:** this section is mostly for your assistant, but read it anyway. It
tells you what a good batch looks like and what to be suspicious of, which is
the part only you can judge.

**Assistant:** you need the teacher's subject, year group, first-or-second
language, class size and the unit they want, before anything else. Those change
every question you will write.

### The order to do it in

**Step 1 — agree the keys first, before any questions.**

> Here is my syllabus for Unit 3. Turn it into about 32 curriculum keys for
> Word Realms, with a label and a group for each, following the handover kit.
> Show me the list and stop. Do not write questions yet.

Read that list properly. It is ten minutes that saves rewriting two hundred
questions filed under the wrong headings.

**Step 2 — questions, ten keys at a time.**

> Write the ordinary questions for these ten keys: [list]. Six per key.
> Follow the schema and the `open` rule exactly. About one in seven should use
> the error, order or odd formats. Everything original — do not reproduce any
> textbook's wording.

**Ten keys at a time, not two hundred questions at once.** Long batches drift:
the format slips, the reading level wanders, and by question 150 it has quietly
forgotten the `open` rule. A bad batch then costs you one batch instead of the
lot.

**Step 3 — the elite bank**, same way, once the ordinary bank is checked.

**Step 4 — paste it in and check it.** Into `js/realm3.js`, then open
`tools/check-content.html`.

### What to watch for in what comes back

**Teacher: this is your job, and nobody else can do it.** Assistants are
reliably good at the schema and reliably weak at four things:

- **`open` on questions that cannot be said aloud.** The most common fault.
- **Reading level drifting upward.** By the third batch the vocabulary is often
  a year too old. Say the age group again in every prompt.
- **Distractors that are also correct.** "a spot" and "spot" are the same answer
  to a child saying it out loud.
- **Textbook wording creeping in.** Especially if you pasted the textbook page.
  Ask for original phrasing every time, and spot-check against your book.

Also, plainly: **it will not know whether a question is right for your class.**
Read a dozen aloud before a lesson. That catches more than any checker.

---

## 7. Checking your work

**`tools/check-content.html` — double-click it.** No installing anything. It
reads your questions and names every problem it finds: an answer missing from
its own options, a key with no label, a duplicate question, a mistake word that
does not appear in its sentence, a thin key with only one question.

It also catches the single most common failure of all — a missing comma or
bracket that stops the file loading — and tells you so in plain language instead
of a blank screen.

**Then play a full run yourself before a class sees it.** Twenty minutes. There
is no substitute.

There is a much deeper test suite behind that — eighteen browser and terminal
suites — but it needs Python and Playwright installed. It is listed in
`CLAUDE.md` §7 for whoever is doing the building.

---

## 8. Art

**Borrow Realm 1's and move on.** The template does this already. A Grade 5
class does not mind fighting a Thunderclap Wyrm about the past tense — they mind
being bored.

Making a realm's own cast is 18 sprites and 3 backdrops, and it turns a
day-and-a-half job into a week. Do it later, once the questions have proved
themselves in lessons, or never. The game is complete without it.

If you do want your own eventually, three rules were learned the hard way:
monsters face **left**; monsters are realistic while guides are drawn in the
chunky hero style; and every backdrop must be **darker** than the heroes, which
is what makes small figures readable from the back of a room.

---

## 9. How long it actually takes

Measured on two realms:

| | |
|---|---|
| Planning 32 keys with an assistant | half an hour |
| ~200 ordinary questions, in batches | two to three hours |
| ~40 elite questions | an hour |
| Fixing what the checker finds | half an hour |
| Playing a run to sanity-check it | twenty minutes |

**About half a day for a unit**, reusing the art. The first one takes longer
because you are learning the shape.

---

## 10. What not to change

You can change anything — it is yours. But these have expensive consequences and
are worth understanding before you touch them:

- **`js/config.js`** is where all the tuning lives — hearts, monster health,
  rewards. Changing numbers here is safe and reversible. Changing the same
  things in the game's logic is neither.
- **Do not make fights shorter.** Rule 1. If you make monsters weaker, the class
  answers fewer questions.
- **Do not add a mode that hides the correct answer.** Rule 2.
- **Do not soften the difficulty because a class lost.** Rule 3. Losing is the
  feature.
- **The four question formats each render into the same container** for a reason
  the code explains. If you add a format, follow that pattern or the blind call
  will show the class the answer.
