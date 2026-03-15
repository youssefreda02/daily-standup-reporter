const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

// === VPS CONFIG ===
// Scans all git repos under ~/projects/
const PROJECTS_DIR = path.join(require('os').homedir(), 'projects');
const OUTPUT_DIR = path.join(__dirname, 'logs');
const GIT_AUTHOR = 'Youssef';

// Auto-discover repos: any directory under ~/projects/ with a .git folder
function discoverRepos() {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs.readdirSync(PROJECTS_DIR)
    .map(name => {
      const repoPath = path.join(PROJECTS_DIR, name);
      if (fs.existsSync(path.join(repoPath, '.git'))) {
        return { name, path: repoPath };
      }
      return null;
    })
    .filter(Boolean);
}

// Pull latest from all repos
async function pullAll(repos) {
  for (const repo of repos) {
    try {
      const git = simpleGit(repo.path);
      await git.pull();
    } catch (err) {
      // Ignore pull errors (offline, auth, etc)
    }
  }
}

// Get commits for a repo in a date range
async function getGitActivity(repo, since, until) {
  const git = simpleGit(repo.path);
  try {
    const log = await git.log([
      '--since=' + since,
      '--until=' + until,
      '--author=' + GIT_AUTHOR,
      '--all',
    ]);

    if (!log.all.length) return null;

    const commits = log.all.map(c => ({
      message: c.message.split('\n')[0],
      date: c.date,
      hash: c.hash.substring(0, 7),
    }));

    return { repo: repo.name, commits, filesChanged: commits.length };
  } catch (err) {
    return null;
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const dateArg = args.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
  const targetDate = dayjs(dateArg || undefined);
  const since = targetDate.startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const until = targetDate.add(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const dateStr = targetDate.format('YYYY-MM-DD');

  const repos = discoverRepos();
  if (!repos.length) {
    console.log(`No git repos found in ${PROJECTS_DIR}`);
    return;
  }

  console.log(`Scanning ${repos.length} repos for ${dateStr}...`);

  // Pull latest first
  await pullAll(repos);

  // Gather activity
  const activities = [];
  for (const repo of repos) {
    const activity = await getGitActivity(repo, since, until);
    if (activity) activities.push(activity);
  }

  // Generate report
  const totalCommits = activities.reduce((sum, a) => sum + a.commits.length, 0);

  let report = `# Daily Standup — ${dateStr}\n\n`;

  if (totalCommits === 0) {
    report += `No git activity recorded for ${dateStr}.\n`;
  } else {
    report += `**${totalCommits} commits** across **${activities.length} repos**\n\n`;

    for (const activity of activities) {
      report += `## ${activity.repo}\n`;
      for (const commit of activity.commits) {
        report += `- ${commit.message} (\`${commit.hash}\`)\n`;
      }
      report += '\n';
    }
  }

  // Save log
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const filepath = path.join(OUTPUT_DIR, `${dateStr}.md`);
  fs.writeFileSync(filepath, report, 'utf8');

  // Print report (lobster reads this and sends to user via Telegram/Slack)
  console.log(report);
  console.log(`Log saved: ${filepath}`);
}

module.exports = { main };

if (require.main === module) {
  main().catch(console.error);
}
