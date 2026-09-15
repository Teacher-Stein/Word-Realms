# Running it in class

Everything here is about using the game with the questions already in it. If you
want your own subject in it, read `2-YOUR-OWN-CURRICULUM.md` instead.

---

## Before the first lesson

**Set the roster.** Main menu → **Class Roster**. Class name, party name
(anything — the class enjoys choosing), then student names one per line.

The game rotates turns from a shuffled list, so everyone gets a go before
anyone gets a second. Whose turn it is shows on the board in large letters.

**Change the passphrase.** Open `tools/set-pin.html`. Every copy of this game
ships with the same public one, so until you change it your class can unlock
anything they like.

**Decide how long you have.** Teacher Menu → **Short realm** makes a nine-room
map instead of fifteen, which fits a single period. A full map is about
forty-five minutes with a talkative class.

**Leave the explanations on** for a new class. The game stops and explains each
mechanic the first time it appears, once, and then never again. It saves you
fifteen minutes of talking. Teacher Menu → *Reset explanations* brings them back
for your next class.

---

## The lesson itself

One student answers at a time. The rest of the class watches — which is the
weakness of the format, and why the Chorus exists.

**The map.** The class picks which room to walk into. Fights, campfires, shops,
events, and Chorus rooms. Let them argue about it; the argument is free review
time and they are usually reasoning about resources.

**A fight.** A question, three options. Right answers hurt the monster; wrong
answers cost hearts. The red bar above the monster says what it will do and how
many answers away it is — *from anybody*, not just the current student.

**SAFE or RISKY.** Before every question in a fight the class chooses. RISKY
strikes the monster twice as hard and pays double shards; a wrong RISKY answer
costs **four hearts**, or six against an elite or the boss. The button states
the exact number before they choose, in big red type — point at it. On questions
that can be said aloud RISKY goes further: the options vanish and the student
says the answer, for triple shards. You judge whether they got it.

Four hearts of eleven is meant to hurt. A class that gambles on everything will
lose runs, and a class that never gambles will grind out long, slow fights and
run out of lesson. Neither is wrong; knowing which questions you actually know
is the skill the choice is really testing.

**Brace.** When a blow is one answer away, the student can defend instead of
attacking. They still answer — bracing never skips a question — but a correct
answer blocks the hit instead of dealing damage.

**The Chorus.** Two or three rooms a run, plus once in every boss fight, the
question goes to *everyone*. Hands, fingers, mini whiteboards — whatever your
class already uses. Then you tap one of three buttons: **Nearly everyone**,
**About half**, **Only a few**. One tap scores it and shows the answer.

Nothing in a Chorus can cost a heart, so there is no reason for a shy class to
hold back.

**The Distracted button**, top right, always there. If a student is not paying
attention, press it: it costs the party a heart and says so on the board. It
never takes away the question — they still have to answer.

**Reroll**, next to the student's name, passes the turn to somebody else.

**Escape** pauses everything, including the music. The bell always goes
mid-boss.

---

## Losing

Runs are meant to be losable. From v6.7 the target is roughly **one in two**
ending badly with a typical class, up from one in three, and that is deliberate
— a victory that cannot be lost is not worth anything, and classes ask to play
again after a defeat more than after a win.

A wipe is not a wasted lesson, and this is the part worth believing: everything
the class answered is already in the teaching record, they bank Ember toward
permanent upgrades, and the questions are not lost either. A lesson asks about
the same number of questions whether the class wins once or loses twice — the
review simply happens across more, shorter runs.

**If it is too hard for a particular class**, that is a real thing to fix and
there is one number for it. Open `js/config.js`, find `START_HEARTS` near the
top, and raise it from 11 to 12 or 13. It is commented in the file, it is the
only dial you need, and nothing else has to change with it. Lower it to 9 or 10
for a class that has played before and is coasting.

---

## The teaching report — the part worth your time

Teacher Menu → **What to reteach**. Or the third tab on the Leaderboards screen.

Every question your class answers is filed against the curriculum item it
tested, kept **per class**, and built up across lessons. The report shows the
weakest areas first.

**Two things to understand before you plan a lesson from it.**

**One run is not enough.** A run asks about forty questions across thirty-two
curriculum items — roughly one attempt each. A single run's figures are noise.
Anything resting on fewer than four attempts is greyed out and marked *too few*.
Ignore those rows. After three or four runs with the same class it starts to
mean something.

**It is class-level on purpose.** With twenty-four children and forty questions,
each child answers under two. Per-child figures on a named curriculum item would
be empty for most of a term and misleading for the rest.

**Getting it out.** **Copy summary** puts a plain-text version on your clipboard
for pasting into a lesson plan. **Download CSV** saves it for Excel — and since
everything lives on the classroom computer, that CSV is the only way to get a
class's record onto your own machine.

**A Chorus counts as one attempt, like anything else** — but the report tracks
them separately too, because a whole-class check is better evidence than one
child's guess.

---

## The bits that surprise people

**The teacher menu is not a settings screen.** It unlocks realms for the class,
switches the Forge on and off, resets explanations, and holds the save file.
Realms stay locked until you unlock them, so a class cannot skip ahead into a
unit you have not taught.

**Ember and the Forge.** Losing a run banks Ember. Ember buys small permanent
upgrades for that realm. It is what makes a defeat feel like progress. You can
switch it off per class from the Teacher Menu.

**Team Up** lets a student bring in a classmate. It costs one extra question, so
it makes fights longer, not shorter. Three per run.

**The number of questions asked is the point of the whole project** — and what
is protected is the questions per *lesson*, not per run. A RISKY answer does
make a fight shorter, deliberately, and that turned out to cost nothing: a class
that wipes starts again and keeps answering until the bell, so the total over
forty-five minutes stays the same. What shorter fights change is where the
questions land. The boss's health is built from the curriculum items the class
did *not* meet on the way, so racing through the map simply makes the finale
longer and harder. Nothing gets skipped; it gets saved for the end.

---

## When something goes wrong mid-lesson

**A blank or half-drawn screen after an update.** The game notices and shows a
warning band. Press `Ctrl+F5` to force the browser to reload properly.

**The teacher menu will not open.** You are almost certainly typing the old
passphrase. `tools/set-pin.html` will set a new one.

**Everything looks tiny.** Do not zoom the browser — it makes it worse. The game
sizes itself to the window. Press `F11` for full screen instead.

**The class data has vanished.** Somebody cleared the browser, or the machine
was re-imaged. Teacher Menu → *Restore from file*, if you have a downloaded
save. This is why the download button is worth pressing at the end of term.
