# Putting it online (optional)

**You do not need this.** The folder works perfectly on its own — that is the
whole design. Copy it to each classroom computer and open `index.html`.

Do this only if you want **one link that every computer opens**, so you update
in one place instead of seven.

---

## What you gain and what it costs

**Gain:** one address. Update once, every classroom has the new version.
Nothing to copy to USB sticks.

**Cost:** the classroom needs internet, and you have to learn one new thing.
Also — and this catches everybody once — **browsers cache the old version**, so
"I uploaded it and nothing changed" is the normal first experience. See the
bottom of this page.

**What does not change:** your class data still lives in each classroom
browser, not online. Going online does not gather your seven classes' teaching
records into one place. Only the CSV export does that.

---

## The simple route — GitHub Pages by drag and drop

No command line at any point.

1. Make a free account at **github.com**.
2. Click **+** (top right) → **New repository**. Name it `word-realms`. Set it
   to **Public** — Pages needs that on a free account. Click **Create**.
3. On the new page click **uploading an existing file**.
4. Open this folder on your computer. Select **everything inside it** —
   `index.html`, `css`, `js`, `assets`, `tools`, `docs`, the `.md` files — and
   drag them in. **Not** the outer folder itself.
   > **GitHub only accepts about 100 files at a time and this is about 170.**
   > Do it in two or three goes: the code first, then the `assets` folder.
   > Commit each batch before starting the next.
5. Click **Commit changes** at the bottom.
6. Go to **Settings** → **Pages** (left menu). Under *Branch* choose `main` and
   `/ (root)`. Click **Save**.
7. Wait a minute or two, then reload that Settings page. It shows your address:
   `https://yourname.github.io/word-realms/`

Open it on a classroom computer and bookmark it.

---

## Updating it later

Same as above: **Add file → Upload files**, drag in whatever changed, commit.

If your assistant changed only questions, that is usually just `js/content.js`
or one realm file — a single small upload.

---

## The thing that will bite you

**Your browser will show you the old version.** You upload, reload, and nothing
has changed — or worse, half of it changes and the rest silently does not.

The game defends against this:

- The **title screen shows a version number**. After updating, check it is the
  one you expect.
- If it is not, press **Ctrl+F5** (Windows) or **Cmd+Shift+R** (Mac) to force a
  proper refresh.
- If a **red warning band** appears at the top, some files did not upload. Go
  back and re-upload `index.html` and the whole `js` folder.

This once cost an entire evening. The symptom was "the teacher menu does
nothing" and the cause was one cached file.

---

## Other places it will work

Anything that serves plain files: a school web server, a shared network drive
that classroom PCs can reach, Netlify, Cloudflare Pages.

Google Drive and OneDrive **will not** work as a website — they will let you
store the folder for handing round, but not run it from a link. Download the
folder and open it locally instead.

---

## If your school blocks GitHub

Plenty do. The folder-on-a-USB route works everywhere and needs no permission
from anybody, which is exactly why the game was built to run that way.
