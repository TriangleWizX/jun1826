import fs from "node:fs";

// Keep appointment facts attached to the general first-visit contract.
export default {
  introVisit: JSON.parse(fs.readFileSync(new URL("../_data/free-intro.json", import.meta.url), "utf8")),
};
