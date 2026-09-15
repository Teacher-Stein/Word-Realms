# Word Realms — start here

A review game for a whole class, played on one computer and shown on the board.
The class walks a dungeon; every room asks a question from your syllabus.

**You will not be programming anything.** You hand this folder to an AI
assistant, tell it what you teach, and it does the building. This page is how.

**You do not need to install anything. There is no account and no internet.**

---

## Step 1 — see what you've got (five minutes)

1. Unzip this folder somewhere sensible — Desktop or Documents.
2. Open it and **double-click `index.html`**.
3. Press **Play**, pick a hero, walk a few rooms.

Nothing you do can break it. Play for ten minutes so you know what you are
asking for later.

> **Nothing happens when you double-click?** Right-click `index.html` →
> *Open with* → Chrome, Edge or Firefox.

> **No sound?** Normal. Browsers block sound until you click something. It
> starts when you pick a hero.

---

## Step 2 — hand it to your assistant

Open Claude (or ChatGPT, or whichever you use). If you have **Claude Code**
installed, point it at this folder and it will find everything by itself.
Otherwise, upload or paste in the file `CLAUDE.md` from this folder.

Then send it this, with your own details filled in:

> I've been given a working classroom review game called Word Realms and I'd
> like to put my own subject into it. I'm not a programmer — I'll describe what
> I want and test it with my classes, and I'd like you to do the building.
>
> Please read `CLAUDE.md` in the project folder first. It's a handover written
> by the assistant who built it and it explains the rules, the structure and the
> things that have already been tried and rejected.
>
> I teach **[subject and year group]**, ages **[ages]**, from **[your textbook
> or scheme of work]**. Classes of about **[number]** students. The first unit I
> want is **[unit]**.
>
> Start by reading `CLAUDE.md`, playing a run so you've seen it, then tell me
> your plan before building anything.

That last sentence matters. This project has a habit of going better when the
assistant proposes first and builds second.

---

## Step 3 — before a class sees it

**Set your class up.** Main menu → **Class Roster**. Class name and student
names, one per line. The game then takes fair turns and shows whose turn it is.

**Change the passphrase.** The Teacher Menu is behind one, and every copy of
this game starts with the same public passphrase: `storm-tiger-lantern`. Your
class can read this file too.

Double-click `tools/set-pin.html` and follow it. Pick three or four unrelated
words.

> Never send your passphrase to anyone — including your AI assistant. Nothing
> needs it except you.

---

## What is in this folder

| | |
|---|---|
| `index.html` | **The game.** Double-click this. |
| `CLAUDE.md` | **The handover for your assistant.** The important one. |
| `docs/1-RUNNING-IT-IN-CLASS.md` | For you: rosters, the buttons, the report. |
| `docs/2-YOUR-OWN-CURRICULUM.md` | How questions are written. Your assistant follows this; you can read it. |
| `docs/3-PUTTING-IT-ONLINE.md` | Optional: a web link instead of a folder. |
| `tools/check-content.html` | **Checks your questions.** Double-click it. |
| `tools/set-pin.html` | Changes your passphrase. Double-click it. |
| `js/content.js` | Every question. Your assistant edits this. |
| `js/`, `css/`, `assets/`, `tools/tests/` | The game itself. Ignore. |

---

## The questions already in it

Two units of **Our World 5** — Grade 5 English, extreme weather and animal
camouflage. About 450 questions.

They are a **worked example, not a gift**. Unless you teach that exact book,
your assistant will replace them. But tell it to *read* some first: the shape of
a good question for this game is much easier to copy than to describe.

Everything was written from scratch, so no textbook is reproduced and you are
free to keep, change or share any of it.

---

## The one thing to check on every batch

When your assistant has written some questions, **double-click
`tools/check-content.html`**.

It reads the questions and tells you, in plain English, about mistakes that are
invisible until a child is standing at the board — an answer that isn't among
its own options, a question filed under a heading that doesn't exist, a
duplicate. It also catches the commonest failure of all: a missing comma that
stops the whole game loading.

It takes two seconds and needs nothing installed. If it reports a problem, paste
what it says back to your assistant and it will fix it.

**Then play one full run yourself before a class sees it.** Twenty minutes.
There is no substitute — a checker cannot tell you whether a question is *right*.

---

## About saving

Your roster, your class's progress and the teaching report are saved **in the
browser on that computer**, not in this folder.

- **Copying this folder does not copy your class data.**
- **Two copies on one computer share the same data** — same browser.
- **Clearing browser history erases it.** So does a re-imaged school PC.

Teacher Menu → **Download save** writes one small file you can keep. Worth
pressing at the end of term.

---

## If you get stuck

Almost everything can be solved by telling your assistant exactly what you see —
including pasting in whatever `tools/check-content.html` says, or a photo of the
screen. It has `CLAUDE.md` and knows how this is built.

---

*Built for Grade 5 English at Ngoi Sao Hanoi. Yours to take wherever you like.*
