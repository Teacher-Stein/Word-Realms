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
vm.runInThisContext(fs.readFileSync(D + "tools/content-rules.js", "utf8"));

const { problems, notes } = checkContent(REALMS, CONFIG);

notes.forEach(n => console.log(n));
problems.forEach(p => console.log("   !! " + p));
console.log(`\nProblems: ${problems.length}`);
console.log("RESULT:", problems.length ? "FAIL" : "PASS");
process.exit(problems.length ? 1 : 0);
