import fs from "node:fs";

// One authority file; the alias lets templates use a plain identifier.
export default JSON.parse(fs.readFileSync(new URL("./free-intro.json", import.meta.url), "utf8"));
