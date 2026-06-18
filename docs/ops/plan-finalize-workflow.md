# Plan Finalize Workflow (Local Checkpoint)

Use this workflow right after a plan is complete to create a local rollback checkpoint commit.

## Command

```bash
npm run plan:finalize -- "short-plan-name"
```

Optional emergency mode (skip quick checks):

```bash
npm run plan:finalize -- --no-checks "short-plan-name"
```

## What It Does

1. Verifies `git` is available and you are on a branch (not detached `HEAD`).
2. Runs quick checks by default:
   - `npm run qa:repo:clean`
   - `npm run qa:nav`
3. Stages tracked-file changes only with `git add -u`.
4. Creates a checkpoint commit with format:
   - `checkpoint(plan): <short-plan-name> [YYYY-MM-DD HH:mm America/New_York]`
5. Prints the created commit hash and rollback hints.

## What It Includes vs Excludes

Includes:
- Modified/deleted tracked files.

Excludes:
- Untracked files (by design).
- Database snapshots/migrations/state handling.
- Secrets handling or CI/remote automation.

## Rollback

After creating a checkpoint, restore options are:

- Inspect checkpoint state without moving your branch:
  - `git checkout <hash>`
- Move your current branch back to a checkpoint (destructive to newer work):
  - `git reset --hard <hash>`

Use `git log --oneline` to find a prior checkpoint hash.
