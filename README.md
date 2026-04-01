# Personal Finance Dashboard

A frontend assessment project based on the provided finance dashboard design guide. The goal of this implementation was to build a polished, responsive dashboard that feels close to a production-ready personal finance product rather than a static demo.

## Live Project Shape

- `pnpm` workspace managed with `turbo`
- main app inside `apps/web`
- `React + TypeScript + Vite`
- custom CSS and SVG charts for tighter visual control

## What The App Includes

- summary cards for balance, cashflow, savings, and reserves
- balance trend chart and monthly cashflow chart
- category breakdown donut chart
- searchable and filterable transactions table
- role-based UI with `viewer` and `admin`
- add and delete transaction flows
- loading, empty, no-results, and toast feedback states
- dark mode and responsive layout support

## Why This Stack

I chose a Turbo workspace even though the submission currently has one app because it keeps the repo scalable and organized if shared utilities, tests, or another frontend surface need to be added later.

React with TypeScript and Vite kept the development loop fast while still giving enough structure for reusable components, typed transaction models, and maintainable state handling.

## Folder Structure

```text
.
|-- apps/
|   `-- web/
|       |-- src/
|       |   |-- components/
|       |   |-- constants/
|       |   |-- data/
|       |   |-- pages/
|       |   |-- utils/
|       |   `-- types.ts
|-- package.json
|-- pnpm-workspace.yaml
`-- turbo.json
```

## Running Locally

```bash
pnpm install
pnpm dev
```

Production build:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

## Product Decisions

- One filtered transaction source powers the cards, charts, and table so the dashboard stays consistent after every interaction.
- Viewer mode disables editing affordances instead of hiding the entire workflow, which makes the role difference obvious during review.
- The empty states are intentionally explicit so the app still feels designed even with no data or restrictive filters.
- The charts are lightweight custom SVG components to keep the visual style under control and avoid over-depending on chart libraries for a small assessment.

## QA Checklist Covered

- empty transaction state
- no matching search or filter results
- viewer/admin restrictions
- add and delete actions updating dashboard metrics
- negative balance styling
- responsive table overflow
- loading and toast feedback

## Assumptions

- Transactions are mocked locally and there is no backend persistence.
- The dashboard is optimized around the light finance references in the PDF, with an additional dark mode for polish.
- Currency is formatted in USD for consistency across the seeded dataset.

## Repository Notes

- The extracted PDF reference images were used during implementation but are intentionally ignored from git.
- Commit history is split into meaningful steps so reviewers can follow the project evolution more easily.
