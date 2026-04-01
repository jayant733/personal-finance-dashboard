# Finance Dashboard Assessment

This workspace contains a finance dashboard implementation built from the provided design guide in [Finance Dashboard UI_ Design & Implementation Guide.pdf](C:\Users\jayan\Downloads\Finance Dashboard UI_ Design & Implementation Guide.pdf).

## Stack

- `pnpm` workspace with `turbo` at the repo root
- `React` + `TypeScript` + `Vite` in [`apps/web`](C:\Users\jayan\Desktop\Assesment\apps\web)
- Custom CSS and SVG-driven charts for close visual control

## Features

- Dashboard layout modeled after the guide's light finance UI references
- Summary cards, large balance trend chart, category donut chart, and monthly cashflow chart
- Transactions table with search, date filtering, category filtering, zebra rows, and CSV export
- Simulated `viewer` and `admin` role toggle
- Admin-only add and delete transaction actions
- Loading state, empty state, success toast, and dark mode toggle
- Responsive layout for desktop, tablet, and mobile

## Run

```bash
pnpm install
pnpm dev
```

To create a production build:

```bash
pnpm build
```

## Notes

- I chose a Turbo workspace so the assessment can scale cleanly if you later add shared packages, tests, or another app surface.
- For this first pass, I matched the overall composition and styling language of the PDF examples rather than recreating one screenshot pixel-for-pixel from an exported design file.
- The extracted PDF pages are available in [`pdf_extract`](C:\Users\jayan\Desktop\Assesment\pdf_extract) for reference while refining the UI further.
