# Units: WeighingMS Decomposition

## 1. Batch Management Unit
**Responsibility:** Managing batches and their lifecycle.
**Capabilities:** Retrieve and display batch list, scan/analyze batch barcode, validate released state, fetch associated recipe, update batch status (WEIGHING -> WEIGHED).
**Dependencies:** OrgaTEX API (batches), Operator unit for user context.
**Why a separate Unit:** Batch is the primary entity owned by OrgaTEX; its management is distinct from the weighing station operation. Provides isolation and clear traceability.
**Construction Bolt Type:** Simple Construction (API integration/utility layer).

## 2. Recipe & Material Management Unit
**Responsibility:** Managing recipes and material specifications.
**Capabilities:** Retrieve recipe components, validate dyestuff identity, capture lot numbers, extract target quantities and tolerance rules, determine compensability.
**Dependencies:** Batch Management unit (for recipe fetching), OrgaTEX API (recipes, dyestuff master data).
**Why a separate Unit:** High domain semantics (recipes, tolerance rules) and complex validation logic that must be decoupled from UI and weighing hardware.
**Construction Bolt Type:** DDD Construction (domain model design).

## 2a. Component Progression Unit
**Responsibility:** Orchestrating the order in which components are weighed.
**Capabilities:** Component sequence management, state tracking (PENDING, ACTIVE, COMPLETED), blocking mechanism when previous component incomplete.
**Dependencies:** Recipe & Material Management unit.
**Why a separate Unit:** Purely workflow logic with zero business data; isolated for easier testing and sequencing.
**Construction Bolt Type:** Simple Construction.

## 3. Weighing Station Unit
**Responsibility:** Physical weighing process coordination.
**Capabilities:** Scale integration (live weight), scale selection logic, tolerance evaluation, surplus handling and compensation logic, supervisor overrides, transaction recording.
**Dependencies:** Recipe & Material Management unit (component metadata), Component Progression unit (current component), Scale API.
**Why a separate Unit:** Core physical process distinct from data handling and user interface. Handles business rules like tolerance and compensation.
**Construction Bolt Type:** DDD Construction.

## 4. OrgaTEX Integration Unit
**Responsibility:** External system synchronization.
**Capabilities:** Batch consumption write-back, idempotency handling, sync status tracking, deferred sync queue.
**Dependencies:** Weighing Station unit (for completed weighing records), OrgaTEX API.
**Why a separate Unit:** Complex integration patterns (failure handling, retry, network resilience) that must not contaminate the application core.
**Construction Bolt Type:** DDD Construction.

## 5. Ticket Generation Unit
**Responsibility:** Document and label creation.
**Capabilities:** Generate weighing tickets with FCI's configured content, handle reprinting with flags, provide preview.
**Dependencies:** OrgaTEX Integration unit (for completed batch reference), Printer API.
**Why a separate Unit:** I/O heavy (printing) and has its own business rules (ticket format, reprint tracking) independent of weighing logic.
**Construction Bolt Type:** Simple Construction.
