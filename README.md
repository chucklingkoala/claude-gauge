# Claude Gauge – Stream Deck Plugin

Monitor your Claude (Anthropic) usage limits directly on your Elgato Stream Deck. See your 7-day rolling usage and 5-hour session usage as live progress bars, percentages, and countdown timers — without leaving your workflow.

![Windows](https://img.shields.io/badge/platform-Windows-blue)
![Stream Deck 6.9+](https://img.shields.io/badge/Stream%20Deck-6.9%2B-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Three display modes** — Combined (both limits on one key), dedicated 7-Day, and dedicated 5-Hour
- **Live progress bars** with color-coded thresholds (green → orange → red)
- **Countdown timers** showing when each usage window resets
- **Zero setup** — automatically reads credentials from Claude Desktop (no API keys needed)
- **Auto-refresh** on a configurable interval (5–30 min, default 15 min)
- **Manual refresh** — press any key to fetch latest data instantly
- **Rate-limit resilient** — automatic 10-minute backoff on HTTP 429
- **Silent token refresh** — picks up renewed tokens from Claude Desktop automatically

## Requirements

- Windows 10+
- Stream Deck Software 6.9+
- [Claude Desktop] or [Claude Code] installed and signed in (Pro, Max, or Team)

## Installation

```bash
git clone https://github.com/chucklingkoala/claude-gauge.git
cd claude-gauge
npm install
npm run build
npm run link
```

Restart the Stream Deck software. Find **Claude Gauge** in the action panel and drag a key onto your layout.

## Usage

| Key Type | What It Shows |
|----------|--------------|
| **Combined** | Both 7-day and 5-hour bars stacked on one key |
| **7-Day** | Large percentage + progress bar + reset countdown |
| **5-Hour** | Same layout for the current session window |

**Color coding:**
- 🟩 Green: < 70% used
- 🟧 Orange: 70–89% used
- 🟥 Red: 90%+ used

**Press any Claude Gauge key** to force an immediate refresh.

## Configuration

Click a Claude Gauge key in the Stream Deck app to open settings:

- **Refresh interval** — 5, 10, 15 (default), or 30 minutes

The interval is shared across all Claude Gauge keys.

## How It Works

1. Reads OAuth credentials from `~/.claude/.credentials.json` (created by Claude Desktop)
2. Calls Anthropic's usage endpoint to get utilization percentages and reset timestamps
3. Renders dynamic SVG images directly onto your Stream Deck keys
4. Tokens are held in memory only — never written to disk by the plugin

## Project Structure

```
src/
├── plugin.ts                  # Entry point
├── actions/                   # Stream Deck action handlers
│   ├── combined-display.ts
│   ├── seven-day-display.ts
│   └── five-hour-display.ts
├── services/
│   ├── credential-reader.ts   # Reads Claude Desktop credentials
│   ├── usage-fetcher.ts       # HTTP client (swappable interface)
│   ├── token-refresher.ts     # Token lifecycle management
│   └── refresh-manager.ts     # Central orchestrator
├── rendering/
│   └── svg-renderer.ts        # Dynamic key image generation
└── types/                     # TypeScript type definitions
```

## Development

```bash
npm run build      # Build the plugin
npm run watch      # Rebuild on file changes
npm run link       # Symlink plugin into Stream Deck
npm run restart    # Restart the plugin process
```

## Disclaimer

This plugin is **not affiliated with or endorsed by Anthropic or Elgato**. It uses an undocumented usage endpoint that may change without notice. Use at your own discretion.

## License

MIT
