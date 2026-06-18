import { watch } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const cssFile = path.join(root, "assets", "css", "styles.css");
const playlistScript = path.join(root, "scripts", "fetch-playlist.mjs");
const playlistOverrides = path.join(root, "assets", "video-overrides.json");
const videosPlaylistJson = path.join(root, "assets", "data", "videos.playlist.json");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

const runScript = (scriptPath, label) => new Promise((resolve) => {
  const child = spawn(process.execPath, [scriptPath], { stdio: "inherit" });
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}`);
    }
    resolve();
  });
});

const runCommand = (command, args, label) => new Promise((resolve) => {
  const child = spawn(command, args, { stdio: "inherit" });
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}`);
    }
    resolve();
  });
});

const debounce = (fn, wait = 200) => {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, wait);
  };
};

const createRunner = (scriptPath, label) => {
  let running = false;
  let queued = false;

  const run = async () => {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    await runScript(scriptPath, label);
    running = false;
    if (queued) {
      queued = false;
      run();
    }
  };

  return debounce(run, 150);
};

const createCommandRunner = (command, args, label) => {
  let running = false;
  let queued = false;

  const run = async () => {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    await runCommand(command, args, label);
    running = false;
    if (queued) {
      queued = false;
      run();
    }
  };

  return debounce(run, 150);
};

const runMinify = createRunner(path.join(root, "tools", "minify-css.mjs"), "styles:min");
const runVideosJson = createCommandRunner(npmCmd, ["run", "videos:json"], "videos:json");
const runVideosBuild = createCommandRunner(npmCmd, ["run", "videos:build"], "videos:build");

const watchFile = (filePath, label, onChange) => {
  const dir = path.dirname(filePath);
  const target = path.basename(filePath);

  watch(dir, { persistent: true }, (event, filename) => {
    if (!filename || filename !== target) return;
    if (event === "change" || event === "rename") {
      console.log(`[watch] ${label} changed`);
      onChange();
    }
  });
};

console.log("Watching for saves...");
console.log(`- ${cssFile} -> styles:min`);
console.log(`- ${playlistScript} -> videos:json`);
console.log(`- ${playlistOverrides} -> videos:build`);
console.log(`- ${videosPlaylistJson} -> videos:build`);

watchFile(cssFile, "styles.css", runMinify);
watchFile(playlistScript, "fetch-playlist.mjs", runVideosJson);
watchFile(playlistOverrides, "video-overrides.json", runVideosBuild);
watchFile(videosPlaylistJson, "videos.playlist.json", runVideosBuild);
