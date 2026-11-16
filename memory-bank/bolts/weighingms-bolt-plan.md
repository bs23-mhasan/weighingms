# Bolt Plan: WeighingMS

Using approved Intent, Requirements, System Context, Units, and Stories, we derive the minimum executable sequence.

## Bolt 01: Batch List Retrieval (Unit: Batch Management)
**Bolt ID:** BMT-001
**Unit:** Batch Management
**Stories:** S1
**Dependencies:** (None)
**Bolt Type:** Simple Construction
**Expected Outcome:** Batch list available for operator selection.
**Test Expectations:** Mock batch API call succeeds; batch list displays with identifiers, order, machine, shade.

## Bolt 02: Batch Selection Validation (Unit: Batch Management)
**Bolt ID:** BMT-002
**Unit:** Batch Management
**Stories:** S1, S2
**Dependencies:** BMT-001
**Bolt Type:** Simple Construction
**Expected Outcome:** Selected batch is validated as released; recipe fetched.
**Test Expectations:** API validates batch status; recipe retrieved and displayed.

## Bolt 03: Recipe Component Display (Unit: Recipe & Material Management)
**Bolt ID:** RMM-001
**Unit:** Recipe & Material Management
**Stories:** S2, S3
**Dependencies:** BMT-002
**Bolt Type:** DDD Construction
**Expected Outcome:** Component list displayed with target quantities, tolerances, scale selections.
**Test Expectations:** Component count matches recipe; scale selection logic applied.

## Bolt 04: Component State Initialization (Unit: Component Progression)
**Bolt ID:** CP-001
**Unit:** Component Progression
**Stories:** S3
**Dependencies:** RMM-001
**Bolt Type:** Simple Construction
**Expected Outcome:** Component states initialized (all pending).
**Test Expectations:** All 5 components present with correct sequence.

## Bolt 05: Scale Selection Service (Unit: Scale Configuration)
**Bolt ID:** SC-001
**Unit:** Scale Configuration
**Stories:** S4
**Dependencies:** RMM-001
**Bolt Type:** DDD Construction
**Expected Outcome:** Rule-based scale selection service.
**Test Expectations:** Target quantity ≤3kg → Precision scale; >3kg → Floor scale.

## Bolt 06: Live Weight Service (Unit: Weighing Station)
**Bolt ID:** WS-001
**Unit:** Weighing Station
**Stories:** S5
**Dependencies:** SC-001
**Bolt Type:** DDD Construction
**Expected Outcome:** Live weight stream integration.
**Test Expectations:** Weight updates simulated with realistic frequency; can be paused/continued.

## Bolt 07: Tolerance Service (Unit: Weighing Station)
**Bolt ID:** WS-002
**Unit:** Weighing Station
**Stories:** S6
**Dependencies:** WS-001, SC-001
**Bolt Type:** DDD Construction
**Expected Outcome:** Tolerance evaluation and surplus handling.
**Test Expectations:** Out-of-tolerance weight blocked; compensatory calculation performed; supervisor override available.

## Bolt 08: Component Completion (Unit: Component Progression)
**Bolt ID:** CP-002
**Unit:** Component Progression
**Stories:** S7
**Dependencies:** WS-002
**Bolt Type:** Simple Construction
**Expected Outcome:** Component state updated upon completion.
**Test Expectations:** Component state transitions (PENDING → ACTIVE → COMPLETED); next component activation.

## Bolt 09: OrgaTEX Consumption Write-back (Unit: OrgaTEX Integration)
**Bolt ID:** OI-001
**Unit:** OrgaTEX Integration
**Stories:** S8
**Dependencies:** WS-002 (batch complete), WS-008
**Bolt Type:** DDD Construction
**Expected Outcome:** Consumption posted to OrgaTEX; idempotency ensured.
**Test Expectations:** API call to POST /api/batches/{batchId}/consumption successful; retry idempotent.

## Bolt 10: Ticket Generation (Unit: Ticket Generation)
**Bolt ID:** TG-001
**Unit:** Ticket Generation
**Stories:** S8
**Dependencies:** OI-001
**Bolt Type:** Simple Construction
**Expected Outcome:** Weighing ticket created and printed.
**Test Expectations:** Ticket generated with FCI's agreed content; preview available.

## Bolt 11: Supervisor Override (Unit: Supervisor Management)
**Bolt ID:** SM-001
**Unit:** Supervisor Management
**Stories:** S9
**Dependencies:** (independent)
**Bolt Type:** DDD Construction
**Expected Outcome:** Supervisor authentication and override.
**Test Expectations:** Override records stored with author and reason; audit log updated.

## Bolt 12: Deferred Sync Service (Unit: Integration Manager)
**Bolt ID:** IM-001
**Unit:** Integration Manager
**Stories:** S10
**Dependencies:** (independent)
**Bolt Type:** DDD Construction
**Expected Outcome:** Sync queue management.
**Test Expectations:** Offline operations queued; sync on reconnection.
