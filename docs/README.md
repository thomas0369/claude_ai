# Documentation Directory

This directory contains all documentation for Thomas's Claude Code Infrastructure, organized systematically for easy navigation.

## Directory Structure

```
docs/
├── guides/              # User-facing guides and tutorials
├── tech-stack/          # Technology stack analysis and comparisons
├── infrastructure/      # Infrastructure plans and implementation details
└── reports/             # Audit reports and verification documents
```

## Guides

User-facing documentation for getting started and using the infrastructure:

1. **[Quick Start Guide](guides/01-quick-start.md)** - Fast onboarding guide
2. **[Setup Optimizations](guides/02-setup-optimizations.md)** - thomas-setup v2.0 improvements
3. **[Setup Safety](guides/03-setup-safety.md)** - Safety features & guardrails
4. **[Deployment Guide](guides/04-deployment.md)** - Vercel and BSV on-chain deployment
5. **[PM2 Setup](guides/05-pm2-setup.md)** - PM2 process management
6. **[PWA Integration](guides/06-pwa-integration.md)** - Progressive Web App integration
7. **[Optimization Guide](guides/07-optimization.md)** - Performance optimization strategies

## Tech Stack

Analysis and comparison documents for technology choices:

1. **[BSV Analysis](tech-stack/01-bsv-analysis.md)** - BSV blockchain integration guide
2. **[UI & State Alternatives](tech-stack/02-ui-state-alternatives.md)** - Mantine vs DaisyUI, Jotai vs Nanostores
3. **[PWA Solutions 2025](tech-stack/03-pwa-solutions-2025.md)** - PWA solution comparison

## Infrastructure

Internal infrastructure plans and implementation details:

1. **[Dev-Docs Worktree Plan](infrastructure/01-dev-docs-worktree-plan.md)** - Worktree integration planning
2. **[Worktree Enhancement](infrastructure/02-worktree-enhancement.md)** - Worktree system improvements

## Reports

Audit reports and verification documents (historical):

1. **[Infrastructure Audit](reports/01-infrastructure-audit.md)** - Complete audit of 94 infrastructure files
2. **[Registration Verification](reports/02-registration-verification.md)** - Component registration verification
3. **[Registration & Consolidation](reports/03-registration-consolidation.md)** - Project consolidation analysis
4. **[Consolidation Complete](reports/04-consolidation-complete.md)** - Infrastructure optimization summary

## Navigation

- **Main README**: [../README.md](../README.md) - Project overview and features
- **Skills Documentation**: [../skills/README.md](../skills/README.md) - Skills system overview
- **Agents Documentation**: [../agents/README.md](../agents/README.md) - Agents system overview
- **Commands**: See individual files in `../commands/`

## Documentation Standards

### File Naming Convention

All documentation files follow this naming pattern:
```
{category}/{number}-{descriptive-name}.md
```

Examples:
- `guides/01-quick-start.md`
- `tech-stack/01-bsv-analysis.md`
- `reports/01-infrastructure-audit.md`

### Numbering System

Files are numbered to indicate:
1. Reading order for sequential content
2. Importance/priority for reference material
3. Chronological order for reports

### Categories

- **guides/**: User-facing, actionable documentation
- **tech-stack/**: Technical analysis and decision documents
- **infrastructure/**: Internal implementation plans
- **reports/**: Historical audit and verification reports

## Contributing

When adding new documentation:

1. Choose the appropriate category
2. Use the next available number
3. Use kebab-case for file names
4. Update this README with the new entry
5. Update the main README if it's a major guide

## Last Updated

2025-11-10
