# Requirements: WeighingMS

Derived from `docs/brief.md`, `Project Requirement.pdf`, and `docs/customize-weighing-station.html`.

## 1. Batch & Recipe Management
- **BR-01:** Retrieve batch queue from OrgaTEX.
- **BR-02:** Operator starts work by scanning or selecting a batch identifier.
- **BR-03:** Prevent weighing against unreleased batches.
- **BR-04:** Read-only recipe consumption from OrgaTEX.

## 2. Weighing Accuracy & Scale Selection
- **BR-05:** Automatic scale selection based on component target quantity (Precision Scale ≤ 3kg, Heavy-Duty Floor Scale > 3kg).
- **BR-06:** Live weight feedback during dispensing.
- **BR-07:** Refuse confirmation if weight is outside tolerance without supervisor override.
- **BR-08:** Standardized handling for over-dose / surplus conditions.

## 3. Traceability & Write-back
- **BR-11:** Permanently record target, actual, operator, scale, timestamp, and dyestuff lot.
- **BR-12:** Post actual consumption back to OrgaTEX upon completion.
- **BR-13:** Audit trail for all tolerance overrides.
- **BR-15:** Ticket generation upon batch completion.

## 4. Mock API Integration Layer
- **IR-01 to IR-06:** Mock OrgaTEX REST APIs for batches, recipes, and consumption.
- **IR-10 to IR-14:** Mock scale indicator streaming weight with stability flags.
- **IR-15 to IR-17:** Mock scanner and printer support.
