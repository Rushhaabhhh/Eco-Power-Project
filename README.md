# Eco Power Project

A student science project built with Next.js that demonstrates a dual-purpose environmental system:

- **Thermoelectric power generation** using the Seebeck Effect
- **Air purification** using a 3-stage activated carbon filtration flow

## What this app shows

- Interactive explanation of the Seebeck Effect (`V = S × ΔT`)
- Animated system flow for power and filtration pathways
- Sectioned educational layout (Intro, Thermo, Filter, System, Evaluation, Conclusion)
- Light/Dark theme toggle
- Responsive single-page design

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Inline component styling

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Project structure

- `app/page.tsx` — main page sections and UI flow
- `app/components/SeebeckDiagram.tsx` — reusable Seebeck hero diagram component
- `app/layout.tsx` — root layout and metadata

## Purpose

The project highlights how one heat source can provide two benefits at once: producing electricity and reducing air pollution through filtration.
