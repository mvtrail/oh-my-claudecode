// src/team/git-worktree.ts

/**
 * Git worktree manager for team worker isolation.
 *
 * Native team worktrees live under the leader repo so worker checkouts stay
 * isolated while all coordination state remains rooted at repo/.omc/state:
 *   {repoRoot}/.omc/team/{team}/worktrees/{worker}
 * Branch naming: omc-team/{teamName}/{workerName}
 */

import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { atomicWriteJson, ensureDirWithMode, validateResolvedPath } from './fs-utils.js';
import { sanitizeName } from './tmux-session.js';
import { withFileLockSync } from '../lib/file-lock.js';

export interface WorktreeInfo {
  path: string;
  branch: string;
  workerName: string;
  teamName: string;
  createdAt: string;
  repoRoot?: string;
  created?: boolean;
  reused?: boolean;
  detached?: boolean;
}

export interface CleanupWorktreeResult {
  removed: WorktreeInfo[];
  preserved: Array<{ info: WorktreeInfo; reason: string }>;
}

/** Get canonical native team worktree path for a worker. */
export function getWorkerWorktreePath(repoRoot: string, teamName: string, workerName: string): string {
  return join(repoRoot, '.omc', 'team', sanitizeName(teamName), 'worktrees', sanitizeName(workerName));
}

/** Backward-compatible legacy path used by the dormant first pass. */
function getLegacyWorktreePath(repoRoot: string, teamName: string, workerName: string): string {
  return join(repoRoot, '.omc', 'worktrees', sanitizeName(teamName), sanitizeName(workerName));
}

/** Get branch name for a worker. */
function getBranchName(teamName: string, workerName: string): string {
  return `omc-team/${sanitizeName(teamName)}/${sanitizeName(workerName)}`;
}

function gitOutput(repoRoot: string, args: string[], cwd = repoRoot): string {
  return execFileSync('git', args, { cwd, encoding: 'utf-8', stdio: 'pipe' });
}

function getRegisteredWorktreeBranch(repoRoot: string, wtPath: string): string | undefined {
  try {
    const output = gitOutput(repoRoot, ['worktree', 'list', '--porcelain']);
    const resolvedWtPath = resolve(wtPath);
    let currentPath: string | undefined;
    for (const line of output.split('\n')) {
      if (line.startsWith('worktree ')) {
        currentPath = resolve(line.slice('worktree '.length).trim());
        continue;
      }
      if (currentPath === resolvedWtPath && line.startsWith('branch ')) {
        return line.slice('branch '.length).trim().replace(/^refs\/heads\//, '');
      }
    }
  } catch {
    // Best-effort check only.
  }
  return undefined;
}

function isRegisteredWorktreePath(repoRoot: string, wtPath: string): boolean {
  return getRegisteredWorktreeBranch(repoRoot, wtPath) !== undefined;
}

function isWorktreeDirty(wtPath: string): boolean {
  try {
    return gitOutput(wtPath, ['status', '--porcelain'], wtPath).trim() !== '';
  } catch {
    return existsSync(wtPath);
  }
}

/** Get worktree metadata path. */
function getMetadataPath(repoRoot: string, teamName: string): string {
  return join(repoRoot, '.omc', 'state', 'team', sanitizeName(teamName), 'worktrees.json');
}

function getLegacyMetadataPath(repoRoot: string, teamName: string): string {
  return join(repoRoot, '.omc', 'state', 'team-bridge', sanitizeName(teamName), 'worktrees.json');
}

/** Read worktree metadata, including legacy metadata for cleanup compatibility. */
function readMetadata(repoRoot: string, teamName: string): WorktreeInfo[] {
  const paths = [getMetadataPath(repoRoot, teamName), getLegacyMetadataPath(repoRoot, teamName)];
  const byWorker = new Map<string, WorktreeInfo>();
  for (const metaPath of paths) {
    if (!existsSync(metaPath)) continue;
    try {
      const entries = JSON.parse(readFileSync(metaPath, 'utf-8')) as WorktreeInfo[];
      for (const entry of entries) byWorker.set(entry.workerName, entry);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`[omc] warning: worktrees.json parse error: ${msg}\n`);
    }
  }
  return [...byWorker.values()];
}

/** Write native worktree metadata. */
function writeMetadata(repoRoot: string, teamName: string, entries: WorktreeInfo[]): void {
  const metaPath = getMetadataPath(repoRoot, teamName);
  validateResolvedPath(metaPath, repoRoot);
  ensureDirWithMode(join(repoRoot, '.omc', 'state', 'team', sanitizeName(teamName)));
  atomicWriteJson(metaPath, entries);
}

function assertLeaderRepoClean(repoRoot: string): void {
  const status = gitOutput(repoRoot, ['status', '--porcelain']).trim();
  if (status !== '') {
    const err = new Error('leader_worktree_dirty: refusing to provision team worktrees from a dirty leader repository');
    err.name = 'leader_worktree_dirty';
    throw err;
  }
}

function buildInfo(teamName: string, workerName: string, repoRoot: string, created: boolean, reused: boolean): WorktreeInfo {
  return {
    path: getWorkerWorktreePath(repoRoot, teamName, workerName),
    branch: getBranchName(teamName, workerName),
    workerName,
    teamName,
    createdAt: new Date().toISOString(),
    repoRoot,
    created,
    reused,
    detached: false,
  };
}

/**
 * Create or reuse a git worktree for a team worker.
 *
 * Existing clean compatible worktrees are reused. Dirty registered worktrees are
 * preserved and rejected with `worktree_dirty` instead of being force-removed.
 */
export function createWorkerWorktree(
  teamName: string,
  workerName: string,
  repoRoot: string,
  baseBranch?: string,
): WorktreeInfo {
  const wtPath = getWorkerWorktreePath(repoRoot, teamName, workerName);
  const legacyPath = getLegacyWorktreePath(repoRoot, teamName, workerName);
  const branch = getBranchName(teamName, workerName);

  validateResolvedPath(wtPath, repoRoot);
  assertLeaderRepoClean(repoRoot);

  try {
    execFileSync('git', ['worktree', 'prune'], { cwd: repoRoot, stdio: 'pipe' });
  } catch { /* ignore */ }

  if (existsSync(wtPath)) {
    const registeredBranch = getRegisteredWorktreeBranch(repoRoot, wtPath);
    if (registeredBranch) {
      if (registeredBranch !== branch) {
        const err = new Error(`worktree_mismatch: ${wtPath} is registered for ${registeredBranch}, expected ${branch}`);
        err.name = 'worktree_mismatch';
        throw err;
      }
      if (isWorktreeDirty(wtPath)) {
        const err = new Error(`worktree_dirty: preserving dirty worktree at ${wtPath}`);
        err.name = 'worktree_dirty';
        throw err;
      }
      const info = buildInfo(teamName, workerName, repoRoot, false, true);
      const metaLockPath = getMetadataPath(repoRoot, teamName) + '.lock';
      withFileLockSync(metaLockPath, () => {
        const updated = readMetadata(repoRoot, teamName).filter(e => e.workerName !== workerName);
        updated.push(info);
        writeMetadata(repoRoot, teamName, updated);
      });
      return info;
    }
    rmSync(wtPath, { recursive: true, force: true });
  }

  // Best-effort migration cleanup for stale legacy plain directories only. A
  // registered legacy worktree is left alone so legacy cleanup callers remain safe.
  if (existsSync(legacyPath) && !isRegisteredWorktreePath(repoRoot, legacyPath)) {
    rmSync(legacyPath, { recursive: true, force: true });
  }

  try {
    execFileSync('git', ['branch', '-D', branch], { cwd: repoRoot, stdio: 'pipe' });
  } catch { /* branch doesn't exist, fine */ }

  ensureDirWithMode(join(repoRoot, '.omc', 'team', sanitizeName(teamName), 'worktrees'));
  const args = ['worktree', 'add', '-b', branch, wtPath];
  if (baseBranch) args.push(baseBranch);
  execFileSync('git', args, { cwd: repoRoot, stdio: 'pipe' });

  const info = buildInfo(teamName, workerName, repoRoot, true, false);
  const metaLockPath = getMetadataPath(repoRoot, teamName) + '.lock';
  withFileLockSync(metaLockPath, () => {
    const updated = readMetadata(repoRoot, teamName).filter(e => e.workerName !== workerName);
    updated.push(info);
    writeMetadata(repoRoot, teamName, updated);
  });

  return info;
}

/** Remove a worker's clean worktree and branch; preserve dirty worktrees. */
export function removeWorkerWorktree(
  teamName: string,
  workerName: string,
  repoRoot: string,
): void {
  const wtPath = getWorkerWorktreePath(repoRoot, teamName, workerName);
  const branch = getBranchName(teamName, workerName);

  if (existsSync(wtPath) && isWorktreeDirty(wtPath)) {
    const err = new Error(`worktree_dirty: preserving dirty worktree at ${wtPath}`);
    err.name = 'worktree_dirty';
    throw err;
  }

  try {
    execFileSync('git', ['worktree', 'remove', wtPath], { cwd: repoRoot, stdio: 'pipe' });
  } catch { /* may not exist */ }

  try {
    execFileSync('git', ['worktree', 'prune'], { cwd: repoRoot, stdio: 'pipe' });
  } catch { /* ignore */ }

  try {
    execFileSync('git', ['branch', '-D', branch], { cwd: repoRoot, stdio: 'pipe' });
  } catch { /* branch may not exist */ }

  const metaLockPath = getMetadataPath(repoRoot, teamName) + '.lock';
  withFileLockSync(metaLockPath, () => {
    const updated = readMetadata(repoRoot, teamName).filter(e => e.workerName !== workerName);
    writeMetadata(repoRoot, teamName, updated);
  });
}

/** List all worktrees for a team. */
export function listTeamWorktrees(teamName: string, repoRoot: string): WorktreeInfo[] {
  return readMetadata(repoRoot, teamName);
}

/** Remove all clean worktrees for a team; preserve dirty worktrees. */
export function cleanupTeamWorktrees(teamName: string, repoRoot: string): CleanupWorktreeResult {
  const removed: WorktreeInfo[] = [];
  const preserved: Array<{ info: WorktreeInfo; reason: string }> = [];
  const entries = readMetadata(repoRoot, teamName);
  for (const entry of entries) {
    try {
      removeWorkerWorktree(teamName, entry.workerName, repoRoot);
      removed.push(entry);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      preserved.push({ info: entry, reason });
      process.stderr.write(`[omc] warning: preserving worktree for ${entry.workerName}: ${reason}\n`);
    }
  }
  return { removed, preserved };
}
