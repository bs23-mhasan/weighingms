# Units: WeighingMS Decomposition (Continued)

## 6. Supervisor Management Unit
**Responsibility:** Managing supervisor privileges and security.
**Capabilities:** Supervisor authentication, review of batch progress, authorization of overrides, manual scale reselection, calibration bypass authority.
**Dependencies:** Operator unit (for role identification), Users API (authentication, role management).
**Why a separate Unit:** High-sensitivity operations requiring distinct authentication and audit trails.
**Construction Bolt Type:** DDD Construction.

## 7. Scale Configuration Unit
**Responsibility:** Managing scale definitions and calibration.
**Capabilities:** Scale metadata (capacity, resolution, calibration status), update of calibration state, selection rules for scale assignment.
**Dependencies:** Weighing Station unit (for live weight source).
**Why a separate Unit:** Scale state management with operational rules that are outside weighing logic but essential for unit correctness.
**Construction Bolt Type:** Simple Construction.

## 8. Operator Management Unit
**Responsibility:** Managing operator profiles and their session context.
**Capabilities:** Operator identification (badge scanning), session start, role tracking, audit log attachment.
**Dependencies:** All other units for traceability context.
**Why a separate Unit:** Operator is a first-class entity in traceability and business rules; central for audit and responsibility.
**Construction Bolt Type:** DDD Construction.

## 9. Configuration Management Unit
**Responsibility:** Centralized configuration for WeighingMS.
**Capabilities:** Language configuration, tolerance rules, compensation rules, compensation function logic, ticket format templates.
**Dependencies:** All functional units for configuration consumption.
**Why a separate Unit:** Highly configurable, rules-driven aspects that need to be externalizable and versionable. Provides configuration-driven operations.
**Construction Bolt Type:** DDD Construction.

## 10. Integration Manager Unit
**Responsibility:** Coordinating integration patterns (retry, deferred sync, circuit breakers).
**Capabilities:** Managing integration boundaries, handling failures, queue management, reconciliation with external systems.
**Dependencies:** OrgaTEX Integration unit, Scale Configuration unit.
**Why a separate Unit:** Integration complexity isolation for maintainability and testing.
**Construction Bolt Type:** DDD Construction.
