# Intent: WeighingMS — Assisted Dyestuff Weighing Station

## Business Problem
In textile dyeing facilities (e.g., FCI), dyestuff weighing is often manual and unrecorded. Recipes are issued on paper, operators weigh by eye, and actual dispensed quantities are never captured. When a batch fails shade approval, there is no record distinguishing a bad recipe from a bad weighing, making attribution and prevention impossible.

## Primary User
- **Weighing Operator:** Primary daily user needing a guided, fast, and low-stress station.
- **Dyehouse Supervisor:** Oversees progress, overrides, and batch approval.

## Desired Outcome
Provide an Assisted Dyestuff Weighing Station application that:
1. Retrieves batch queues and recipes from production systems (OrgaTEX).
2. Automatically selects the correct scale (Precision vs. Floor scale).
3. Guides operators through live weight measurement against target and tolerance.
4. Enforces tolerance rules before confirmation.
5. Records component-level traceability (operator, timestamp, scale, lot, actual quantity).
6. Posts actual consumption back to OrgaTEX and generates tickets/labels upon batch completion.

## Scope & Boundaries
- **In Scope:** Batch selection, recipe retrieval, automatic scale selection, tare handling, live guided weighing, tolerance checks, overshoot handling, supervisor override, lot capture, consumption write-back, ticket printing, and mock API integration layer.
- **Out of Scope:** Automated chemical dispensing machinery, automated transport, liquid chemical dosing, recipe authoring, and laboratory color matching.

## Dummy Integrations
The application must use robust mock APIs for:
- OrgaTEX MES (Batches, Recipes, Consumption write-back)
- Weighing Scales (Precision 3kg scale, Floor 32kg scale, continuous streaming)
- Barcode Scanner
- Ticket Printer
