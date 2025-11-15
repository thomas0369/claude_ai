# CI/CD Integration Guide

This guide shows how to integrate `/thomas-app` into your CI/CD pipeline.

## GitHub Actions

### Basic Integration

Create `.github/workflows/thomas-app.yml`:

```yaml
name: Thomas App Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm install
          npx playwright install --with-deps

      - name: Start dev server
        run: |
          npm run dev &
          npx wait-on http://localhost:3000 -t 60000

      - name: Run Thomas App Tests
        run: /thomas-app --quick

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: thomas-app-results
          path: thomas-app-results/

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('thomas-app-results/report.json', 'utf8'));

            const comment = `## 🚀 Thomas App Test Results

            **Overall Score:** ${report.scores.overall}/100 ${report.scores.overall >= 80 ? '✅' : '⚠️'}

            | Category | Score |
            |----------|-------|
            | UX | ${report.scores.ux}/100 |
            | Performance | ${report.scores.performance}/100 |
            | Accessibility | ${report.scores.accessibility}/100 |
            | Security | ${report.scores.security}/100 |
            | SEO | ${report.scores.seo}/100 |

            **Issues Found:** ${report.issues.length}

            [View Full Report](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Advanced Integration with Quality Gates

```yaml
name: Thomas App Testing with Quality Gates

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm install
          npx playwright install --with-deps

      - name: Start dev server
        run: |
          npm run dev &
          npx wait-on http://localhost:3000 -t 60000

      - name: Run Thomas App Tests (Deep)
        run: /thomas-app --deep

      - name: Check quality gates
        run: |
          #!/bin/bash
          REPORT=$(cat thomas-app-results/report.json)
          OVERALL=$(echo $REPORT | jq '.scores.overall')
          SECURITY=$(echo $REPORT | jq '.scores.security')
          ACCESSIBILITY=$(echo $REPORT | jq '.scores.accessibility')

          echo "Overall Score: $OVERALL"
          echo "Security Score: $SECURITY"
          echo "Accessibility Score: $ACCESSIBILITY"

          # Quality gates
          if [ "$OVERALL" -lt 70 ]; then
            echo "❌ Overall score below 70"
            exit 1
          fi

          if [ "$SECURITY" -lt 80 ]; then
            echo "❌ Security score below 80"
            exit 1
          fi

          if [ "$ACCESSIBILITY" -lt 80 ]; then
            echo "❌ Accessibility score below 80"
            exit 1
          fi

          echo "✅ All quality gates passed"

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: thomas-app-html-report
          path: thomas-app-results/report.html

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: thomas-app-screenshots
          path: thomas-app-results/screenshots/
```

## GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - report

thomas-app-test:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  services:
    - name: your-app:latest
      alias: app
  variables:
    BASE_URL: "http://app:3000"
  script:
    - npm install
    - npx playwright install
    - /thomas-app --quick
  artifacts:
    when: always
    paths:
      - thomas-app-results/
    reports:
      junit: thomas-app-results/junit.xml
  only:
    - merge_requests
    - main

publish-report:
  stage: report
  script:
    - echo "Publishing Thomas App report"
  artifacts:
    paths:
      - thomas-app-results/report.html
    expose_as: 'Thomas App Report'
  only:
    - merge_requests
    - main
```

## Jenkins

Create `Jenkinsfile`:

```groovy
pipeline {
    agent any

    stages {
        stage('Setup') {
            steps {
                sh 'npm install'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Start Application') {
            steps {
                sh 'npm run dev &'
                sh 'npx wait-on http://localhost:3000 -t 60000'
            }
        }

        stage('Thomas App Tests') {
            steps {
                sh '/thomas-app --deep'
            }
        }

        stage('Quality Gates') {
            steps {
                script {
                    def report = readJSON file: 'thomas-app-results/report.json'

                    echo "Overall Score: ${report.scores.overall}"

                    if (report.scores.overall < 70) {
                        error("Overall score below 70")
                    }

                    if (report.scores.security < 80) {
                        error("Security score below 80")
                    }

                    if (report.scores.accessibility < 80) {
                        error("Accessibility score below 80")
                    }
                }
            }
        }
    }

    post {
        always {
            publishHTML([
                reportDir: 'thomas-app-results',
                reportFiles: 'report.html',
                reportName: 'Thomas App Report'
            ])

            archiveArtifacts artifacts: 'thomas-app-results/**/*', allowEmptyArchive: true
        }
    }
}
```

## CircleCI

Create `.circleci/config.yml`:

```yaml
version: 2.1

orbs:
  node: circleci/node@5.0.0

jobs:
  thomas-app-test:
    docker:
      - image: mcr.microsoft.com/playwright:v1.40.0-jammy

    steps:
      - checkout

      - node/install-packages

      - run:
          name: Install Playwright
          command: npx playwright install

      - run:
          name: Start dev server
          command: npm run dev
          background: true

      - run:
          name: Wait for server
          command: npx wait-on http://localhost:3000 -t 60000

      - run:
          name: Run Thomas App Tests
          command: /thomas-app --quick

      - store_artifacts:
          path: thomas-app-results
          destination: thomas-app-results

      - store_test_results:
          path: thomas-app-results

workflows:
  test:
    jobs:
      - thomas-app-test
```

## Docker Integration

### Dockerfile for Testing

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Install Thomas App dependencies
RUN npx playwright install

CMD ["/thomas-app", "--quick"]
```

### Docker Compose for Local Testing

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production

  thomas-app:
    image: mcr.microsoft.com/playwright:v1.40.0-jammy
    depends_on:
      - app
    environment:
      - BASE_URL=http://app:3000
    volumes:
      - ./thomas-app-results:/app/thomas-app-results
    command: /thomas-app --deep
```

## Environment Variables

Thomas App supports these environment variables:

```bash
# Base URL (required)
THOMAS_APP_BASE_URL=http://localhost:3000

# Output directory (optional, default: ./thomas-app-results)
THOMAS_APP_OUTPUT_DIR=/path/to/results

# Test mode (optional: quick, deep)
THOMAS_APP_MODE=quick

# Specific test suites (comma-separated)
THOMAS_APP_SUITES=ux,performance,security

# App type override (optional: game, ecommerce, saas, content)
THOMAS_APP_TYPE=game

# Headless mode (optional, default: true)
THOMAS_APP_HEADLESS=true

# Timeout (optional, default: 30000ms)
THOMAS_APP_TIMEOUT=60000
```

## Quality Gate Examples

### Minimum Score Requirements

```bash
#!/bin/bash
# quality-gates.sh

REPORT="thomas-app-results/report.json"

OVERALL=$(jq '.scores.overall' $REPORT)
UX=$(jq '.scores.ux' $REPORT)
PERFORMANCE=$(jq '.scores.performance' $REPORT)
ACCESSIBILITY=$(jq '.scores.accessibility' $REPORT)
SECURITY=$(jq '.scores.security' $REPORT)
SEO=$(jq '.scores.seo' $REPORT)

echo "=== Quality Gates ==="
echo "Overall: $OVERALL/100"
echo "UX: $UX/100"
echo "Performance: $PERFORMANCE/100"
echo "Accessibility: $ACCESSIBILITY/100"
echo "Security: $SECURITY/100"
echo "SEO: $SEO/100"

EXIT_CODE=0

# Define minimum requirements
if (( $(echo "$OVERALL < 70" | bc -l) )); then
  echo "❌ Overall score below 70"
  EXIT_CODE=1
fi

if (( $(echo "$SECURITY < 80" | bc -l) )); then
  echo "❌ Security score below 80"
  EXIT_CODE=1
fi

if (( $(echo "$ACCESSIBILITY < 80" | bc -l) )); then
  echo "❌ Accessibility score below 80"
  EXIT_CODE=1
fi

if (( $(echo "$PERFORMANCE < 60" | bc -l) )); then
  echo "⚠️  Performance score below 60"
  # Not blocking, just warning
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All quality gates passed"
fi

exit $EXIT_CODE
```

### Compare with Baseline

```bash
#!/bin/bash
# baseline-comparison.sh

REPORT="thomas-app-results/report.json"
BASELINE="thomas-app-results/baseline.json"

if [ ! -f "$BASELINE" ]; then
  echo "No baseline found, creating one..."
  cp $REPORT $BASELINE
  exit 0
fi

CURRENT_SCORE=$(jq '.scores.overall' $REPORT)
BASELINE_SCORE=$(jq '.scores.overall' $BASELINE)

DIFF=$(echo "$CURRENT_SCORE - $BASELINE_SCORE" | bc)

echo "=== Baseline Comparison ==="
echo "Current Score: $CURRENT_SCORE"
echo "Baseline Score: $BASELINE_SCORE"
echo "Difference: $DIFF"

if (( $(echo "$DIFF < -5" | bc -l) )); then
  echo "❌ Score dropped by more than 5 points"
  exit 1
fi

if (( $(echo "$DIFF >= 0" | bc -l) )); then
  echo "✅ Score maintained or improved"
  # Update baseline
  cp $REPORT $BASELINE
fi

exit 0
```

## Notifications

### Slack Notification

```bash
#!/bin/bash
# slack-notify.sh

REPORT="thomas-app-results/report.json"
WEBHOOK_URL="$SLACK_WEBHOOK_URL"

OVERALL=$(jq '.scores.overall' $REPORT)
ISSUES=$(jq '.issues | length' $REPORT)

COLOR="good"
if (( $(echo "$OVERALL < 70" | bc -l) )); then
  COLOR="danger"
elif (( $(echo "$OVERALL < 85" | bc -l) )); then
  COLOR="warning"
fi

curl -X POST -H 'Content-type: application/json' \
  --data "{
    \"attachments\": [{
      \"color\": \"$COLOR\",
      \"title\": \"Thomas App Test Results\",
      \"fields\": [
        {\"title\": \"Overall Score\", \"value\": \"$OVERALL/100\", \"short\": true},
        {\"title\": \"Issues Found\", \"value\": \"$ISSUES\", \"short\": true}
      ]
    }]
  }" \
  $WEBHOOK_URL
```

## Best Practices

1. **Run Quick Tests on Every PR**: Use `--quick` mode for fast feedback
2. **Run Deep Tests on Main**: Use `--deep` mode for comprehensive testing before deployment
3. **Set Quality Gates**: Define minimum score requirements based on your project needs
4. **Track Baselines**: Compare results over time to catch regressions
5. **Publish Reports**: Make HTML reports accessible to team members
6. **Fail Fast**: Stop deployment if critical issues are found
7. **Notify Team**: Send notifications for test failures
8. **Archive Results**: Keep historical test results for analysis

## Troubleshooting

### Tests Failing in CI but Passing Locally

- Ensure dev server is fully started before running tests
- Use `wait-on` to wait for server readiness
- Check environment variables are set correctly
- Verify Playwright is installed with `--with-deps`

### Out of Memory Errors

- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`
- Use `--quick` mode to reduce resource usage
- Run tests in parallel with multiple jobs

### Flaky Tests

- Increase timeout values
- Ensure proper wait conditions in customer journeys
- Check network stability in CI environment
- Use retry logic for critical tests
