---
name: agents-readme
type: documentation
description: Documentation about the agents system (not an actual agent)
---

# Agents

Specialized agents for complex, multi-step tasks.

---

## What Are Agents?

Agents are autonomous Claude instances that handle specific complex tasks. Unlike skills (which provide inline guidance), agents:
- Run as separate sub-tasks
- Work autonomously with minimal supervision
- Have specialized tool access
- Return comprehensive reports when complete

**Key advantage:** Agents are **standalone** - just copy the `.md` file and use immediately!

---

## Available Agents

**Total Agents: 46**

### build

#### `vite-expert`

Vite build optimization expert with deep knowledge of ESM-first development, HMR optimization, plugin ecosystem, production builds, library mode, and SSR configuration. Use PROACTIVELY for any Vite bundling issues including dev server performance, build optimization, plugin development, and modern ESM patterns. If a specialized expert is a better fit, I will recommend switching and stop.

**File:** `build-tools/build-tools-vite-expert.md`

#### `webpack-expert`

Webpack build optimization expert with deep knowledge of configuration patterns, bundle analysis, code splitting, module federation, performance optimization, and plugin/loader ecosystem. Use PROACTIVELY for any Webpack bundling issues including complex optimizations, build performance, custom plugins/loaders, and modern architecture patterns. If a specialized expert is a better fit, I will recommend switching and stop.

**File:** `build-tools/build-tools-webpack-expert.md`

---

### Database

#### `database-expert`

Use PROACTIVELY for database performance optimization, schema design issues, query performance problems, connection management, and transaction handling across PostgreSQL, MySQL, MongoDB, and SQLite with ORM integration

**File:** `database/database-expert.md`

#### `mongodb-expert`

Use PROACTIVELY for MongoDB-specific issues including document modeling, aggregation pipeline optimization, sharding strategies, replica set configuration, connection pool management, indexing strategies, and NoSQL performance patterns

**File:** `database/database-mongodb-expert.md`

#### `postgres-expert`

Use PROACTIVELY for PostgreSQL query optimization, JSONB operations, advanced indexing strategies, partitioning, connection management, and database administration with deep PostgreSQL-specific expertise

**File:** `database/database-postgres-expert.md`

#### `kafka-expert`

Expert in Apache Kafka distributed streaming platform handling consumer management, producer reliability, cluster operations, serialization, performance optimization, and development patterns. Use PROACTIVELY for Kafka performance issues, consumer lag problems, broker connectivity issues, or schema serialization errors. Detects project setup and adapts approach.

**File:** `kafka/kafka-expert.md`

---

### DevOps & Infrastructure

#### `cli-expert`

Expert in building npm package CLIs with Unix philosophy, automatic project root detection, argument parsing, interactive/non-interactive modes, and CLI library ecosystems. Use PROACTIVELY for CLI tool development, npm package creation, command-line interface design, and Unix-style tool implementation.

**File:** `cli-expert.md`

#### `devops-expert`

DevOps and Infrastructure expert with comprehensive knowledge of CI/CD pipelines, containerization, orchestration, infrastructure as code, monitoring, security, and performance optimization. Use PROACTIVELY for any DevOps, deployment, infrastructure, or operational issues. If a specialized expert is a better fit, I will recommend switching and stop.

**File:** `devops/devops-expert.md`

#### `docker-expert`

Docker containerization expert with deep knowledge of multi-stage builds, image optimization, container security, Docker Compose orchestration, and production deployment patterns. Use PROACTIVELY for Dockerfile optimization, container issues, image size problems, security hardening, networking, and orchestration challenges.

**File:** `infrastructure/infrastructure-docker-expert.md`

#### `github-actions-expert`

GitHub Actions CI/CD pipeline optimization, workflow automation, custom actions development, and security best practices for scalable software delivery

**File:** `infrastructure/infrastructure-github-actions-expert.md`

---

### Frameworks

#### `ai-sdk-expert`

Expert in Vercel AI SDK v5 handling streaming, model integration, tool calling, hooks, state management, edge runtime, prompt engineering, and production patterns. Use PROACTIVELY for any AI SDK implementation, streaming issues, provider integration, or AI application architecture. Detects project setup and adapts approach.

**File:** `ai-sdk-expert.md`

#### `nextjs-expert`

Next.js framework expert specializing in App Router, Server Components, performance optimization, and full-stack patterns. Use PROACTIVELY for Next.js routing issues, hydration errors, build problems, or deployment challenges.

**File:** `framework/framework-nextjs-expert.md`

#### `loopback-expert`

Expert in LoopBack 4 Node.js framework handling dependency injection, repository patterns, authentication, database integration, and deployment. Use PROACTIVELY for LoopBack dependency injection errors, database connection issues, authentication problems, or framework architecture questions. Detects project setup and adapts approach.

**File:** `loopback/loopback-expert.md`

#### `nestjs-expert`

Nest.js framework expert specializing in module architecture, dependency injection, middleware, guards, interceptors, testing with Jest/Supertest, TypeORM/Mongoose integration, and Passport.js authentication. Use PROACTIVELY for any Nest.js application issues including architecture decisions, testing strategies, performance optimization, or debugging complex dependency injection problems. If a specialized expert is a better fit, I will recommend switching and stop.

**File:** `nestjs-expert.md`

#### `nodejs-expert`

Node.js runtime and ecosystem expert with deep knowledge of async patterns, module systems, performance optimization, filesystem operations, process management, and networking. Use PROACTIVELY for any Node.js runtime issues including event loop debugging, memory leaks, promise handling, module resolution, stream processing, and HTTP server configuration.

**File:** `nodejs/nodejs-expert.md`

#### `react-expert`

React component patterns, hooks, and performance expert. Use PROACTIVELY for React component issues, hook errors, re-rendering problems, or state management challenges.

**File:** `react/react-expert.md`

#### `react-performance-expert`

React performance optimization specialist. Expert in DevTools Profiler, memoization, Core Web Vitals, bundle optimization, and virtualization. Use for performance bottlenecks, slow renders, large bundles, or memory issues.

**File:** `react/react-performance-expert.md`

#### `typescript-build-expert`

TypeScript Build Expert - Compiler configuration, build optimization, module resolution, and build tool integration specialist

**File:** `typescript/typescript-build-expert.md`

#### `typescript-expert`

>-

**File:** `typescript/typescript-expert.md`

#### `typescript-type-expert`

Advanced TypeScript type system specialist for complex generics, conditional types, template literals, type inference, performance optimization, and type-level programming. Use for intricate type system challenges, recursive types, brand types, utility type authoring, and type performance issues. Includes comprehensive coverage of 18 advanced type system error patterns.

**File:** `typescript/typescript-type-expert.md`

---

### Frontend Specialists

#### `accessibility-expert`

WCAG 2.1/2.2 compliance, WAI-ARIA implementation, screen reader optimization, keyboard navigation, and accessibility testing expert. Use PROACTIVELY for accessibility violations, ARIA errors, keyboard navigation issues, screen reader compatibility problems, or accessibility testing automation needs.

**File:** `frontend/frontend-accessibility-expert.md`

#### `css-styling-expert`

CSS architecture and styling expert with deep knowledge of modern CSS features, responsive design, CSS-in-JS optimization, performance, accessibility, and design systems. Use PROACTIVELY for CSS layout issues, styling architecture, responsive design problems, CSS-in-JS performance, theme implementation, cross-browser compatibility, and design system development. If a specialized expert is better fit, I will recommend switching and stop.

**File:** `frontend/frontend-css-styling-expert.md`

---

### General Purpose

#### `auth-route-debugger`

Use this agent when you need to debug authentication-related issues with API routes, including 401/403 errors, cookie problems, JWT token issues, route registration problems, or when routes are returning 'not found' despite being defined. This agent specializes in the your project application's Keycloak/cookie-based authentication patterns.\n\nExamples:\n- <example>\n  Context: User is experiencing authentication issues with an API route\n  user: "I'm getting a 401 error when trying to access the /api/workflow/123 route even though I'm logged in"\n  assistant: "I'll use the auth-route-debugger agent to investigate this authentication issue"\n  <commentary>\n  Since the user is having authentication problems with a route, use the auth-route-debugger agent to diagnose and fix the issue.\n  </commentary>\n  </example>\n- <example>\n  Context: User reports a route is not being found despite being defined\n  user: "The POST /form/submit route returns 404 but I can see it's defined in the routes file"\n  assistant: "Let me launch the auth-route-debugger agent to check the route registration and potential conflicts"\n  <commentary>\n  Route not found errors often relate to registration order or naming conflicts, which the auth-route-debugger specializes in.\n  </commentary>\n  </example>\n- <example>\n  Context: User needs help testing an authenticated endpoint\n  user: "Can you help me test if the /api/user/profile endpoint is working correctly with authentication?"\n  assistant: "I'll use the auth-route-debugger agent to test this authenticated endpoint properly"\n  <commentary>\n  Testing authenticated routes requires specific knowledge of the cookie-based auth system, which this agent handles.\n  </commentary>\n  </example>

**File:** `auth-route-debugger.md`

#### `auth-route-tester`

Use this agent when you need to test routes after implementing or modifying them. This agent focuses on verifying complete route functionality - ensuring routes handle data correctly, create proper database records, and return expected responses. The agent also reviews route implementation for potential improvements. Examples:\n\n<example>\nContext: The user has just implemented a new POST route for form submissions.\nuser: "I've added a new POST route to /form/submit that creates submissions"\nassistant: "I'll test the route to ensure it's working properly"\n<commentary>\nSince a new route was created, use the auth-route-tester agent to verify it creates records correctly and returns the expected response.\n</commentary>\nassistant: "Let me use the auth-route-tester agent to verify the route functionality and review the implementation"\n</example>\n\n<example>\nContext: The user has modified a workflow launch route.\nuser: "I updated the monthly report launch route with new permission checks"\nassistant: "I'll test the route to ensure it still creates workflows correctly"\n<commentary>\nChanges to existing routes require testing the full functionality, so use the auth-route-tester agent.\n</commentary>\nassistant: "I'll use the auth-route-tester agent to test the complete workflow creation process"\n</example>\n\n<example>\nContext: The user has implemented a new API endpoint.\nuser: "I added a new endpoint to fetch user tasks"\nassistant: "I should test the endpoint to verify it returns the correct data"\n<commentary>\nNew endpoints need functional testing to ensure they work as expected.\n</commentary>\nassistant: "Let me launch the auth-route-tester agent to verify the endpoint returns tasks properly"\n</example>

**File:** `auth-route-tester.md`

#### `auto-error-resolver`

Automatically fix TypeScript compilation errors

**File:** `auto-error-resolver.md`

#### `blockchain-bsv`

Bitcoin SV (BSV) blockchain expert focused on UTXO transactions, Bitcoin Script, SPV, Teranode scaling, overlay networks, on-chain data storage, and Metanet applications. Use PROACTIVELY for BSV development, transaction issues, script errors, or blockchain integration.

**File:** `blockchain-bsv.md`

#### `code-architecture-reviewer`

Use this agent when you need to review recently written code for adherence to best practices, architectural consistency, and system integration. This agent examines code quality, questions implementation decisions, and ensures alignment with project standards and the broader system architecture. Examples:\n\n<example>\nContext: The user has just implemented a new API endpoint and wants to ensure it follows project patterns.\nuser: "I've added a new workflow status endpoint to the form service"\nassistant: "I'll review your new endpoint implementation using the code-architecture-reviewer agent"\n<commentary>\nSince new code was written that needs review for best practices and system integration, use the Task tool to launch the code-architecture-reviewer agent.\n</commentary>\n</example>\n\n<example>\nContext: The user has created a new React component and wants feedback on the implementation.\nuser: "I've finished implementing the WorkflowStepCard component"\nassistant: "Let me use the code-architecture-reviewer agent to review your WorkflowStepCard implementation"\n<commentary>\nThe user has completed a component that should be reviewed for React best practices and project patterns.\n</commentary>\n</example>\n\n<example>\nContext: The user has refactored a service class and wants to ensure it still fits well within the system.\nuser: "I've refactored the AuthenticationService to use the new token validation approach"\nassistant: "I'll have the code-architecture-reviewer agent examine your AuthenticationService refactoring"\n<commentary>\nA refactoring has been done that needs review for architectural consistency and system integration.\n</commentary>\n</example>

**File:** `code-architecture-reviewer.md`

#### `code-refactor-master`

Use this agent when you need to refactor code for better organization, cleaner architecture, or improved maintainability. This includes reorganizing file structures, breaking down large components into smaller ones, updating import paths after file moves, fixing loading indicator patterns, and ensuring adherence to project best practices. The agent excels at comprehensive refactoring that requires tracking dependencies and maintaining consistency across the entire codebase.\n\n<example>\nContext: The user wants to reorganize a messy component structure with large files and poor organization.\nuser: "This components folder is a mess with huge files. Can you help refactor it?"\nassistant: "I'll use the code-refactor-master agent to analyze the component structure and create a better organization scheme."\n<commentary>\nSince the user needs help with refactoring and reorganizing components, use the code-refactor-master agent to analyze the current structure and propose improvements.\n</commentary>\n</example>\n\n<example>\nContext: The user has identified multiple components using early returns with loading indicators instead of proper loading components.\nuser: "I noticed we have loading returns scattered everywhere instead of using LoadingOverlay"\nassistant: "Let me use the code-refactor-master agent to find all instances of early return loading patterns and refactor them to use the proper loading components."\n<commentary>\nThe user has identified a pattern that violates best practices, so use the code-refactor-master agent to systematically find and fix all occurrences.\n</commentary>\n</example>\n\n<example>\nContext: The user wants to break down a large component file into smaller, more manageable pieces.\nuser: "The Dashboard.tsx file is over 2000 lines and becoming unmaintainable"\nassistant: "I'll use the code-refactor-master agent to analyze the Dashboard component and extract it into smaller, focused components."\n<commentary>\nThe user needs help breaking down a large component, which requires careful analysis of dependencies and proper extraction - perfect for the code-refactor-master agent.\n</commentary>\n</example>

**File:** `code-refactor-master.md`

#### `code-review-expert`

Comprehensive code review specialist covering 6 focused aspects - architecture & design, code quality, security & dependencies, performance & scalability, testing coverage, and documentation & API design. Provides deep analysis with actionable feedback. Use PROACTIVELY after significant code changes.

**File:** `code-review-expert.md`

#### `documentation-architect`

Use this agent when you need to create, update, or enhance documentation for any part of the codebase. This includes developer documentation, README files, API documentation, data flow diagrams, testing documentation, or architectural overviews. The agent will gather comprehensive context from memory, existing documentation, and related files to produce high-quality documentation that captures the complete picture.\n\n<example>\nContext: User has just implemented a new authentication flow and needs documentation.\nuser: "I've finished implementing the JWT cookie-based authentication. Can you document this?"\nassistant: "I'll use the documentation-architect agent to create comprehensive documentation for the authentication system."\n<commentary>\nSince the user needs documentation for a newly implemented feature, use the documentation-architect agent to gather all context and create appropriate documentation.\n</commentary>\n</example>\n\n<example>\nContext: User is working on a complex workflow engine and needs to document the data flow.\nuser: "The workflow engine is getting complex. We need to document how data flows through the system."\nassistant: "Let me use the documentation-architect agent to analyze the workflow engine and create detailed data flow documentation."\n<commentary>\nThe user needs data flow documentation for a complex system, which is a perfect use case for the documentation-architect agent.\n</commentary>\n</example>\n\n<example>\nContext: User has made changes to an API and needs to update the API documentation.\nuser: "I've added new endpoints to the form service API. The docs need updating."\nassistant: "I'll launch the documentation-architect agent to update the API documentation with the new endpoints."\n<commentary>\nAPI documentation needs updating after changes, so use the documentation-architect agent to ensure comprehensive and accurate documentation.\n</commentary>\n</example>

**File:** `documentation-architect.md`

#### `frontend-error-fixer`

Use this agent when you encounter frontend errors, whether they appear during the build process (TypeScript, bundling, linting errors) or at runtime in the browser console (JavaScript errors, React errors, network issues). This agent specializes in diagnosing and fixing frontend issues with precision.\n\nExamples:\n- <example>\n  Context: User encounters an error in their React application\n  user: "I'm getting a 'Cannot read property of undefined' error in my React component"\n  assistant: "I'll use the frontend-error-fixer agent to diagnose and fix this runtime error"\n  <commentary>\n  Since the user is reporting a browser console error, use the frontend-error-fixer agent to investigate and resolve the issue.\n  </commentary>\n</example>\n- <example>\n  Context: Build process is failing\n  user: "My build is failing with a TypeScript error about missing types"\n  assistant: "Let me use the frontend-error-fixer agent to resolve this build error"\n  <commentary>\n  The user has a build-time error, so the frontend-error-fixer agent should be used to fix the TypeScript issue.\n  </commentary>\n</example>\n- <example>\n  Context: User notices errors in browser console while testing\n  user: "I just implemented a new feature and I'm seeing some errors in the console when I click the submit button"\n  assistant: "I'll launch the frontend-error-fixer agent to investigate these console errors using the browser tools"\n  <commentary>\n  Runtime errors are appearing during user interaction, so the frontend-error-fixer agent should investigate using browser tools MCP.\n  </commentary>\n</example>

**File:** `frontend-error-fixer.md`

#### `git-expert`

Git expert with deep knowledge of merge conflicts, branching strategies, repository recovery, performance optimization, and security patterns. Use PROACTIVELY for any Git workflow issues including complex merge conflicts, history rewriting, collaboration patterns, and repository management. If a specialized expert is a better fit, I will recommend switching and stop.

**File:** `git/git-expert.md`

#### `oracle`

>-

**File:** `oracle.md`

#### `plan-reviewer`

Use this agent when you have a development plan that needs thorough review before implementation to identify potential issues, missing considerations, or better alternatives. Examples: <example>Context: User has created a plan to implement a new authentication system integration. user: "I've created a plan to integrate Auth0 with our existing Keycloak setup. Can you review this plan before I start implementation?" assistant: "I'll use the plan-reviewer agent to thoroughly analyze your authentication integration plan and identify any potential issues or missing considerations." <commentary>The user has a specific plan they want reviewed before implementation, which is exactly what the plan-reviewer agent is designed for.</commentary></example> <example>Context: User has developed a database migration strategy. user: "Here's my plan for migrating our user data to a new schema. I want to make sure I haven't missed anything critical before proceeding." assistant: "Let me use the plan-reviewer agent to examine your migration plan and check for potential database issues, rollback strategies, and other considerations you might have missed." <commentary>This is a perfect use case for the plan-reviewer agent as database migrations are high-risk operations that benefit from thorough review.</commentary></example>

**File:** `plan-reviewer.md`

#### `refactor-planner`

Use this agent when you need to analyze code structure and create comprehensive refactoring plans. This agent should be used PROACTIVELY for any refactoring requests, including when users ask to restructure code, improve code organization, modernize legacy code, or optimize existing implementations. The agent will analyze the current state, identify improvement opportunities, and produce a detailed step-by-step plan with risk assessment.\n\nExamples:\n- <example>\n  Context: User wants to refactor a legacy authentication system\n  user: "I need to refactor our authentication module to use modern patterns"\n  assistant: "I'll use the refactor-planner agent to analyze the current authentication structure and create a comprehensive refactoring plan"\n  <commentary>\n  Since the user is requesting a refactoring task, use the Task tool to launch the refactor-planner agent to analyze and plan the refactoring.\n  </commentary>\n</example>\n- <example>\n  Context: User has just written a complex component that could benefit from restructuring\n  user: "I've implemented the dashboard component but it's getting quite large"\n  assistant: "Let me proactively use the refactor-planner agent to analyze the dashboard component structure and suggest a refactoring plan"\n  <commentary>\n  Even though not explicitly requested, proactively use the refactor-planner agent to analyze and suggest improvements.\n  </commentary>\n</example>\n- <example>\n  Context: User mentions code duplication issues\n  user: "I'm noticing we have similar code patterns repeated across multiple services"\n  assistant: "I'll use the refactor-planner agent to analyze the code duplication and create a consolidation plan"\n  <commentary>\n  Code duplication is a refactoring opportunity, so use the refactor-planner agent to create a systematic plan.\n  </commentary>\n</example>

**File:** `refactor-planner.md`

#### `research-expert`

Specialized research expert for parallel information gathering. Use for focused research tasks with clear objectives and structured output requirements.

**File:** `research-expert.md`

#### `triage-expert`

Context gathering and initial problem diagnosis specialist. Use PROACTIVELY when encountering errors, performance issues, or unexpected behavior before engaging specialized experts.

**File:** `triage-expert.md`

#### `web-research-specialist`

Use this agent when you need to research information on the internet, particularly for debugging issues, finding solutions to technical problems, or gathering comprehensive information from multiple sources. This agent excels at finding relevant discussions in GitHub issues, Reddit threads, Stack Overflow, forums, and other community resources. Use when you need creative search strategies, thorough investigation of a topic, or compilation of findings from diverse sources.\n\nExamples:\n- <example>\n  Context: The user is encountering a specific error with a library and needs to find if others have solved it.\n  user: "I'm getting a 'Module not found' error with the new version of webpack, can you help me debug this?"\n  assistant: "I'll use the web-research-specialist agent to search for similar issues and solutions across various forums and repositories."\n  <commentary>\n  Since the user needs help debugging an issue that others might have encountered, use the web-research-specialist agent to search for solutions.\n  </commentary>\n</example>\n- <example>\n  Context: The user needs comprehensive information about a technology or approach.\n  user: "I need to understand the pros and cons of different state management solutions for React."\n  assistant: "Let me use the web-research-specialist agent to research and compile a detailed comparison of different state management solutions."\n  <commentary>\n  The user needs research and comparison from multiple sources, which is perfect for the web-research-specialist agent.\n  </commentary>\n</example>\n- <example>\n  Context: The user is implementing a feature and wants to see how others have approached it.\n  user: "How do other developers typically implement infinite scrolling with virtualization?"\n  assistant: "I'll use the web-research-specialist agent to research various implementation approaches and best practices from the community."\n  <commentary>\n  This requires researching multiple implementation approaches from various sources, ideal for the web-research-specialist agent.\n  </commentary>\n</example>

**File:** `web-research-specialist.md`

---

### linting

#### `linting-expert`

Code linting, formatting, static analysis, and coding standards enforcement across multiple languages and tools

**File:** `code-quality/code-quality-linting-expert.md`

---

### specialized-domains

#### `game-developer`

Build games with Unity, Unreal Engine, or web technologies. Implements game mechanics, physics, AI, and optimization. Use PROACTIVELY for game development, engine integration, or gameplay programming.

**File:** `game-developer.md`

---

### Testing & QA

#### `playwright-expert`

Expert in Playwright end-to-end testing, cross-browser automation, visual regression testing, and CI/CD integration

**File:** `e2e/e2e-playwright-expert.md`

#### `jest-testing-expert`

Expert in Jest testing framework, advanced mocking strategies, snapshot testing, async patterns, TypeScript integration, and performance optimization

**File:** `testing/jest-testing-expert.md`

#### `testing-expert`

Testing expert with comprehensive knowledge of test structure, mocking strategies, async testing, coverage analysis, and cross-framework debugging. Use PROACTIVELY for test reliability, flaky test debugging, framework migration, and testing architecture decisions. Covers Jest, Vitest, Playwright, and Testing Library.

**File:** `testing/testing-expert.md`

#### `vitest-testing-expert`

>-

**File:** `testing/vitest-testing-expert.md`

---

### tools

#### `code-search`

A specialized agent for searching through codebases to find relevant files. Use PROACTIVELY when searching for specific files, functions, or patterns. Returns focused file lists, not comprehensive answers.

**File:** `code-search.md`

#### `documentation-expert`

Expert in documentation structure, cohesion, flow, audience targeting, and information architecture. Use PROACTIVELY for documentation quality issues, content organization, duplication, navigation problems, or readability concerns. Detects documentation anti-patterns and optimizes for user experience.

**File:** `documentation/documentation-expert.md`

---


## How to Use Agents

### Via Task Tool
```
I'll use the Task tool to launch the [agent-name] agent
```

### Direct Request
```
Use the [agent-name] agent to review my code
```

### In Commands
Many commands automatically invoke agents:
- `/code-review` → Uses code-review-expert
- `/research <query>` → Uses research-expert
- `/thomas-fix` → Uses multiple testing agents

---

## When to Use Agents vs Skills

| Use Agents When... | Use Skills When... |
|-------------------|-------------------|
| Task requires multiple steps | Need inline guidance |
| Complex analysis needed | Checking best practices |
| Autonomous work preferred | Want to maintain control |
| Task has clear end goal | Ongoing development work |
| Example: "Review all controllers" | Example: "Creating a new route" |

**Both can work together:**
- Skill provides patterns during development
- Agent reviews the result when complete

---

## Creating Custom Agents

Agents are markdown files with YAML frontmatter:

```markdown
---
name: my-agent
description: What this agent does
category: general
---

# My Agent

## When Invoked

### Step 1: Environment Detection
Check project setup and adapt

### Step 2: Problem Analysis
Identify the issue

### Step 3: Solution Implementation
Fix the problem

## Tools Available
List of tools this agent uses

## Expected Output
Format for results
```

**Tips:**
- Be very specific in instructions
- Break complex tasks into numbered steps
- Specify exactly what to return
- Include examples of good output

---

## Integration Guide

**Standard Integration (Most Agents):**

```bash
# Copy agent to your project
cp showcase/.claude/agents/agent-name.md \
   your-project/.claude/agents/

# Verify (check for hardcoded paths)
grep -n "~/git/\|/root/" your-project/.claude/agents/agent-name.md

# Use it
# Ask Claude: "Use the [agent-name] agent to [task]"
```

**That's it!** Agents are standalone and work immediately.

---

## Troubleshooting

### Agent not found
```bash
# Check if agent file exists
ls -la .claude/agents/[agent-name].md
```

### Agent fails with path errors
```bash
# Check for hardcoded paths
grep "~/\|/root/\|/Users/" .claude/agents/[agent-name].md

# Fix with environment variables
sed -i 's|~/git/.*project|$CLAUDE_PROJECT_DIR|g' .claude/agents/[agent-name].md
```

---

**Last Updated:** $(date +%Y-%m-%d)
**Auto-generated:** Yes (via scripts/update-agent-readme.sh)
**Agent Count:** $agent_count
