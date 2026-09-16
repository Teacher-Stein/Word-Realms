// ---------------------------------------------------------------------------
// CONTENT CHECKER — terminal version.
//
// Validates a realm's question bank before a class ever sees it. The RULES
// themselves live in tools/content-rules.js, shared with the browser page at
// tools/check-content.html, so a teacher with no Node installed runs exactly
// the same checks. This file is only the terminal wrapper around them.
//
// Run:  node tools/tests/check_content.js
// ---------------------------------------------------------------------------
const fs = require("fs"), vm = require("vm");
const D = __dirname + "/../../";
vm.runInThisContext(fs.readFileSync(D + "js/config.js", "utf8"));
vm.runInThisContext(fs.readFileSync(D + "js/content.js", "utf8"));

// REALMS IN THEIR OWN FILES. v6.6 added registerRealm() so a new unit could
// live in js/realm3.js instead of being pasted into content.js - and then both
// content checkers went on reading content.js alone, so any realm that took the
// advice was never checked by the tool the docs tell you to use. A teacher
// following START-HERE.md to the letter would have got "All clear" on a bank
// the checker had not looked at.
//
// Loaded in numeric order, because a realm file may refer to an earlier realm's
// cast when it is borrowing art.
fs.readdirSync(D + "js")
  .filter(f => /^realm\d+\.js$/.test(f))
  .sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))
  .forEach(f => {
    try {
      vm.runInThisContext(fs.readFileSync(D + "js/" + f, "utf8"));
    } catch (e) {
      console.log(`   !! js/${f} could not be read: ${e.message}`);
      console.log("      That is a typing mistake - a missing comma, quote or");
      console.log("      bracket. This realm will not load in the game either.");
      process.exit(1);
    }
  });

vm.runInThisContext(fs.readFileSync(D + "tools/content-rules.js", "utf8"));

const { problems, notes } = checkContent(REALMS, CONFIG);

notes.forEach(n => console.log(n));
problems.forEach(p => console.log("   !! " + p));
console.log(`\nProblems: ${problems.length}`);
console.log("RESULT:", problems.length ? "FAIL" : "PASS");
process.exit(problems.length ? 1 : 0);
