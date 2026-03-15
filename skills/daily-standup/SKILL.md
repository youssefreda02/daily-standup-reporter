# Skill: Daily Standup Reporter

## When to use
When the user says any of:
- "write my standup"
- "daily log"
- "what did I do today"
- "generate standup"
- "standup report"
- "daily report"

## What it does
Scans all configured git repos for today's commits, generates a structured daily standup report, and saves it as a markdown log.

## How to use

### Quick standup (today)
```bash
cd ~/daily-standup-reporter && node standup.js
```

### Specific date
```bash
cd ~/daily-standup-reporter && node standup.js 2026-03-15
```

### Send to WhatsApp too
```bash
cd ~/daily-standup-reporter && node standup.js --whatsapp
```

## Adding repos
Edit `standup.js` CONFIG.repos array to add more repositories to scan.

## Output
- Logs saved to `logs/YYYY-MM-DD.md`
- Shows: commit count, files changed, commit messages per repo
- Can optionally send to WhatsApp

## Important
- Only run when the user asks — do NOT auto-generate
- The user controls when standups are created
- If the user asks to add something to the standup, edit the generated log file
