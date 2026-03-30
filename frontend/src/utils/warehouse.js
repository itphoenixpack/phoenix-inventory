/** Canonical labels match `warehouses` ids 1 / 2 used by the API after normalization. */
export const LABEL_W2 = "Warehouse 2";
export const LABEL_W3 = "Warehouse 3";

export function isWarehouse2(item) {
  return item.warehouse_id === 1 || item.warehouse_name === LABEL_W2;
}

export function isWarehouse3(item) {
  return item.warehouse_id === 2 || item.warehouse_name === LABEL_W3;
}

export function stockRowKey(item) {
  return `${item.source || 'inv'}-${item.id}`;
}
