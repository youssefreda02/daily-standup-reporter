# Skill: Daily Standup Reporter

## When to use
When the user says any of:
- "write my standup"
- "daily log" / "daily report"
- "what did I do today"
- "generate standup"
- "standup report"

## What it does
Scans all git repos under ~/projects/ for today's commits, generates a structured daily standup report, and sends it back to the user.

## How to run

### Step 1: Make sure repos are up to date
```bash
cd ~/projects && for d in */; do (cd "$d" && git pull 2>/dev/null); done
```

### Step 2: Generate standup
```bash
cd ~/projects/daily-standup-reporter && node standup-vps.js
```

### Step 3: For a specific date
```bash
cd ~/projects/daily-standup-reporter && node standup-vps.js 2026-03-15
```

## Adding more repos
Clone any of the user's repos into ~/projects/:
```bash
cd ~/projects && git clone https://github.com/youssefreda02/<repo-name>.git
```

Known repos:
- daily-standup-reporter (public)
- clinic-ai-solution (public)
- AIEC-agent-hub (private - needs auth)
- feshiu-web (private - needs auth)

## Auto-discovery
The script auto-discovers all git repos under ~/projects/ — no config needed. Just clone a repo there and it gets scanned.

## Important
- Only run when the user asks — do NOT auto-generate
- The user controls when standups are created
- Send the report text directly to the user in the chat
- If the user asks to add notes, edit the log file in ~/projects/daily-standup-reporter/logs/
