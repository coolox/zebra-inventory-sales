# Initial clothing inventory — Owner worksheet

Status: **TASK-087 in progress — awaiting physical-count source list.**

This worksheet is the only approved input for the first real Zebra Boutique stock.
Do not invent products, suppliers, costs or quantities. Do not import through SQL,
the demo mode, or a legacy VPS.

## Source list

Provide one row per sellable colour/size variant. A spreadsheet, CSV, photographed
count sheet or a pasted table is acceptable if every required field is legible.

| Required field | Example format | Rule |
| --- | --- | --- |
| Product code | `ZB-001` | Unique model code; no spaces or ambiguous duplicates. |
| Product name | `Linen shirt` | Customer-facing name. |
| Brand | `Zebra` | One consistent spelling per brand. |
| Category | `Shirts` | Clothing category. |
| Gender | `women`, `men`, or `unisex` | Use the app’s supported value. |
| Supplier | `Supplier A` | Required for every model. |
| Colour | `Black` | One colour per row. |
| Size | `S`, `M`, `38`, etc. | One size per row. |
| Quantity | positive integer | Physical count, not an estimate. |
| Cost | decimal amount | Purchase cost per unit. |
| Currency | `EUR`, `TRY`, `USD`, `GBP`, or `RUB` | Currency of the unit cost. |

Optional: model barcode, variant barcode, intended sale price, photo reference and
source-document reference (invoice, receiving sheet or count-sheet page).

## Import and reconciliation

1. Owner compares the source list with the physical items before entering data.
2. Owner enters the list only through the live **Receive product** workflow. Each
   receipt must retain supplier, cost, currency and size-level quantity.
3. After entry, compare system quantities with the physical count by variant.
4. Trace a selection of variants back to their listed source document; any mismatch
   is corrected through an auditable stock adjustment with a written reason.
5. Check that no variant is negative or duplicated by code/colour/size.
6. Owner records a final result: total models, variants, units, discrepancies and
   whether every discrepancy was resolved. Only after that confirmation can TASK-087
   complete and TASK-088 become eligible.

Do not record customer data, credentials, private invoice scans or supplier payment
details in this repository.
