export interface Bono {
  id?: string; // Firestore doc id — the code itself (uppercase), e.g. "BIENVENIDA"
  discountPercent: number;
  active: boolean;
  description?: string;
  createdAt?: any;
  // Set on personal codes minted for a specific customer at registration
  // (format: 3 letters + 3 digits) — distinct from shared codes like BIENVENIDA.
  ownerUid?: string;
  // When true, this bono only discounts the extra/add-on items in an order,
  // never the combo currently being purchased.
  extraItemsOnly?: boolean;
}
