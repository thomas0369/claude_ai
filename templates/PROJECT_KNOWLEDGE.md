# Project Knowledge - [Project Name]

**Last Updated**: [Date]

## Project Overview

### Purpose
[What does this project do? What problem does it solve?]

### Key Features
- Feature 1: [Description]
- Feature 2: [Description]
- Feature 3: [Description]

### Tech Stack
[List the key technologies, frameworks, and libraries used]

## Architecture

### High-Level Architecture
```
[Diagram or description of system architecture]

Example:
Frontend (Preact) → API Layer → Backend Services → Database
                  ↓
              BSV Blockchain
```

### Key Components

#### Frontend
- **Location**: `src/`
- **Purpose**: [Description]
- **Key Files**:
  - `src/features/` - Feature-based organization
  - `src/components/` - Reusable UI components
  - `src/routes/` - Page routes

#### Backend/API
- **Location**: `server/` or `api/`
- **Purpose**: [Description]
- **Key Files**:
  - `server/routes/` - API endpoints
  - `server/services/` - Business logic
  - `server/models/` - Data models

#### Database
- **Type**: [PostgreSQL, MongoDB, etc.]
- **Location**: [Connection details, schemas location]
- **Key Tables/Collections**: [List main data structures]

#### Blockchain Integration
- **Chain**: BSV (Bitcoin SV)
- **Purpose**: [What blockchain features are used]
- **Key Operations**: [Minting, transfers, queries, etc.]

## Data Flow

### User Request Flow
```
1. User action in UI
2. Component calls API service (features/{feature}/api/)
3. API service makes HTTP request
4. Backend route handler receives request
5. Business logic in service layer
6. Database query/update
7. Response back through layers
8. UI updates with new data
```

### State Management
- **Global State**: Nanostores (`src/stores/`)
- **Server State**: TanStack Query (automatic caching)
- **Form State**: Preact Signals

## Integration Points

### External APIs
- **API Name**: [Description, auth method, docs link]
- **API Name**: [Description, auth method, docs link]

### Third-Party Services
- **Service Name**: [What it's used for]
- **Service Name**: [What it's used for]

### Blockchain
- **1Sat Ordinals**: [How ordinals are used]
- **BSV Transactions**: [Transaction patterns]

## Key Workflows

### Workflow 1: [Name]
**Purpose**: [What this workflow accomplishes]

**Steps**:
1. Step 1
2. Step 2
3. Step 3

**Files Involved**:
- `path/to/file.ts` - [Role in workflow]
- `path/to/another.ts` - [Role in workflow]

### Workflow 2: [Name]
[Similar structure]

## Configuration

### Environment Variables
```bash
# Required
VAR_NAME=value         # Description

# Optional
VAR_NAME=value         # Description
```

### Build Configuration
- **Vite Config**: `vite.config.ts` - [Key settings]
- **TypeScript Config**: `tsconfig.json` - [Key settings]
- **Test Config**: `vitest.config.ts` - [Key settings]

## Development Setup

### Prerequisites
- Node.js v18+
- npm or pnpm
- [Other requirements]

### Quick Start
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Run development server
npm run dev

# Run tests
npm test
```

### Important Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run all tests
npm run lint         # Run linter
```

## Testing Strategy

### Unit Tests
- **Framework**: Vitest
- **Location**: `*.test.ts` files
- **Coverage**: [Target percentage]

### Integration Tests
- **Framework**: Vitest
- **Focus**: [What's tested]

### E2E Tests
- **Framework**: Playwright
- **Location**: `e2e/` directory
- **Key Scenarios**: [List important test scenarios]

## Deployment

### Staging
- **URL**: [Staging URL]
- **Deploy**: [How to deploy to staging]

### Production
- **URL**: [Production URL]
- **Deploy**: [How to deploy to production]
- **Monitoring**: [Where to check logs, metrics]

## Performance Considerations

### Optimization Strategies
- Code splitting with lazy loading
- TanStack Query caching
- Minimal bundle size (Preact, DaisyUI)
- Image optimization

### Monitoring
- **Tool**: [Monitoring tool]
- **Key Metrics**: [What to watch]

## Security

### Authentication
- **Method**: [JWT, session, wallet-based, etc.]
- **Implementation**: [Where auth logic lives]

### Authorization
- **Method**: [How permissions are checked]
- **Implementation**: [Where auth logic lives]

### Data Protection
- [How sensitive data is protected]
- [Encryption methods]

## Known Limitations

- [Limitation 1 and why it exists]
- [Limitation 2 and why it exists]

## Future Enhancements

- [ ] Enhancement 1
- [ ] Enhancement 2
- [ ] Enhancement 3

## Resources

- **API Documentation**: [Link]
- **Design System**: [Link]
- **Dependencies**: [Link to package.json or important libs]

## Contact & Support

- **Team Lead**: [Name, contact]
- **Repository**: [Git repo URL]
- **Issue Tracker**: [Link]
