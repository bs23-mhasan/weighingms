# Stories: WeighingMS

Each story delivers observable value, links to Units, references requirements, includes acceptance criteria, identifies UI/UX impact, API dependencies, and test expectations.

## Story 1: Select Batch (Unit: Batch Management)
**Value:** Enable operator to access weighing work from OrgaTEX.
**Reference Requirements:** BR-01, BR-02, BR-03, FR-01, FR-02, FR-03, FR-04.
**Acceptance Criteria:** Operator can scan a barcode or select a batch from a displayed queue; system rejects unselected/released batches; batch context (order, machine, shade, component count) displayed.
**UI Impact:** Batch list view with scannable codes, error feedback for invalid selections.
**API Dependencies:** Mock batch API (GET /api/batches, GET /api/batches/{batchId}).
**Test Expectation:** Load batch list, scan valid batch → recipe loaded; scan invalid batch → error shown.

## Story 2: Load Recipe (Unit: Recipe & Material Management)
**Value:** Retrieve recipe for selected batch.
**Reference Requirements:** BR-04, FR-05.
**Acceptance Criteria:** Recipe and component list displayed after batch selection; recipe immutable (read-only from OrgaTEX).
**UI Impact:** Recipe view showing all components, target quantities, tolerance bands, and scale selection.
**API Dependencies:** Mock recipe API (GET /api/batches/{batchId}/recipe).
**Test Expectation:** Recipe retrieved with correct component count and target quantities.

## Story 3: Display Components (Unit: Component Progression)
**Value:** Present components for weighing in sequence.
**Reference Requirements:** FR-06.
**Acceptance Criteria:** Components shown in recipe order with states (completed, active, pending); component selection workflow triggers weighing process.
**UI Impact:** Recipe navigation UI with progress indicator and component states.
**API Dependencies:** Internal unit dependencies only.
**Test Expectation:** All 5 components displayed with correct sequence.

## Story 4: Automatic Scale Selection (Unit: Scale Configuration)
**Value:** Choose correct weighing scale per component.
**Reference Requirements:** BR-05, FR-07, FR-08, FR-12.
**Acceptance Criteria:** System selects scale automatically based on target quantity (≤3kg = Precision, >3kg = Floor); operator can supervisor-override.
**UI Impact:** Scale displayed with visual scale type indicators; manual reselection option for supervisors.
**API Dependencies:** Scale API (GET /api/scales).
**Test Expectation:** 1.5kg component → Precision; 5kg component → Floor.

## Story 5: Live Weight (Unit: Weighing Station)
**Value:** Real-time weight monitoring.
**Reference Requirements:** BR-06, FR-13, FR-14, FR-15.
**Acceptance Criteria:** Live weight display updates continuously; target, still-to-weigh, and progress indicator shown.
**UI Impact:** Weighing UI with live weight readout, target bands, progress bar, scale type.
**API Dependencies:** Mock scale weight API (GET /api/scales/{scaleId}/weight).
**Test Expectation:** Weight updates simulate realistic measurement with sub-second lag.

## Story 6: Tolerance Evaluation (Unit: Weighing Station)
**Value:** Automated tolerance enforcement.
**Reference Requirements:** BR-07, FR-16, FR-17, FR-18, FR-19, FR-20, FR-21, FR-22, FR-23, FR-24.
**Acceptance Criteria:** Confirmation enabled only when weight is within tolerance; underflow → cannot confirm; overflow → compensatory calculation or supervisor override.
**UI Impact:** Visual tolerance band, color-coded state (green within, red out-of-range), confirmation button states.
**API Dependencies:** Internal compensation logic; Supervisor unit.
**Test Expectation:** Weight 93.4g (target 94g, tolerance ±0.5g) → cannot confirm; weight 94.2g → can confirm.

## Story 7: Component Progression (Unit: Component Progression)
**Value:** Sequential completion management.
**Reference Requirements:** FR-25, FR-26.
**Acceptance Criteria:** Next component becomes active only after previous complete; component state progression maintained.
**UI Impact:** Navigation between components, progress tracking.
**API Dependencies:** Internal unit dependencies only.
**Test Expectation:** Complete component 1 → Component 2 active; incomplete component → Component 2 blocked.

## Story 8: Batch Completion (Unit: OrgaTEX Integration)
**Value:** Write actual consumption back to OrgaTEX and generate tickets.
**Reference Requirements:** BR-12, BR-15, FR-27, FR-28, FR-29.
**Acceptance Criteria:** All components confirmed → POST consumption to OrgaTEX; ticket generated with FCI's agreed content.
**UI Impact:** Final screen with ticket preview/print; completed batch summary.
**API Dependencies:** OrgaTEX API (POST /api/batches/{batchId}/consumption), Printer API (POST /api/tickets).
**Test Expectation:** All 5 components confirmed → API calls made, ticket generated.

## Story 9: Supervisor Override (Unit: Supervisor Management)
**Value:** Authorize out-of-tolerance confirmations.
**Reference Requirements:** BR-13, FR-23, FR-24.
**Acceptance Criteria:** Supervisor can override out-of-tolerance weighing with reason; override recorded in audit log.
**UI Impact:** Override screen with supervisor authentication and reason text.
**API Dependencies:** Supervisor unit (authentication), internal override recording.
**Test Expectation:** Supervisor override recorded with author and timestamp.

## Story 10: System Continuity (Unit: Integration Manager)
**Value:** Offline operation and sync restoration.
**Reference Requirements:** BR-16, BR-17, BR-18, FR-30, FR-31, FR-32, FR-33.
**Acceptance Criteria:** Operation continues when OrgaTEX offline; unsynchronized records queued; data synced automatically on reconnection.
**UI Impact:** Connection status indicator; unsynchronized count display.
**API Dependencies:** Deferred sync service.
**Test Expectation:** Offline mode used; records remain locally; sync on reconnection.
