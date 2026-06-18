import fs from "node:fs";

const file = "./assets/js/class-focus-weeks.js";
const source = fs.readFileSync(file, "utf8");

const match = source.match(/window\.SENSEI_SANDY_CLASS_FOCUS_WEEKS\s*=\s*(\[[\s\S]*\]);?/);

if (!match) {
  console.error("Could not find SENSEI_SANDY_CLASS_FOCUS_WEEKS array.");
  process.exit(1);
}

// Simple parser for the specific JS array format
const weeks = Function(`return ${match[1]}`)();

const ids = new Set();

for (const week of weeks) {
  if (!week.id || !week.startDate || !week.endDate || !week.label) {
    console.error("Missing required week field:", week);
    process.exit(1);
  }

  if (ids.has(week.id)) {
    console.error("Duplicate week id:", week.id);
    process.exit(1);
  }

  ids.add(week.id);

  if (week.startDate > week.endDate) {
    console.error("Week has startDate after endDate:", week.id);
    process.exit(1);
  }
}

console.log(`Validated ${weeks.length} class focus week(s).`);
