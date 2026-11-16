# System Context: WeighingMS

## Real Systems
### Human Actors
- **Operator:** Primary weighing station user.
- **Supervisor:** Authorizes overrides, view batch progress.

### System Actors
- **WeighingMS:** The application product.
- **OrgaTEX:** Main MES (Manufacturing Execution System).

### Devices
- **Scale:** Weighing equipment (Precision: ≤3kg; Floor: >3kg).
- **Scanner:** Barcode input for batch and chemical identification.
- **Printer:** Ticket label generation.
- **Terminal:** 21-key control for confirm/abandon actions.

## Training Time Dummy Integrations (The Product)
- **Dummy OrgaTEX API:** REST service exposing `/api/batches`, `/api/batches/{batchId}`, `/api/batches/{batchId}/recipe`, and `POST /api/batches/{batchId}/consumption`.
- **Dummy Scale API:** REST service exposing `/api/scales/{scaleId}/status`, `GET /api/scales/{scaleId}/weight`, and `POST /api/scales/{scaleId}/tare`.
- **Dummy Printer API:** Single endpoint `POST /api/tickets`.
- **Dummy Scanner API:** Simulated via form input with identity verification against a master dyestuff list.

## Integration Points
- **Inbound:** Operator scan, batch/barcode, recipe batch matching.
- **Outbound:** Consumption write-back to OrgaTEX, printing of weighing tickets.

## Failure Boundaries
- **OrgaTEX outage:** Operation continues in local mode; deferred sync on reconnection.
- **Scale disconnection:** Confirmation blocked; supervisor override allowed for manual entry.
- **Printer failure:** Batch completion logged; reprint operation queued.
