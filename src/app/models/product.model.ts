export interface SubCategory {
  name: string;
  active: boolean;
}

export interface Category {
  name: string;
  subcategory: SubCategory;
  active: boolean;
}

export interface ProductVariant {
  color?: string;
  colorCode?: string;
  size?: string;
  stock: number;
}

export interface PriceGroup {
  text: string;
  price: number;
  dprice: number;
  dropiCodes?: string[];
  dropiMainCode?: string;
  dropiQuantities?: { [code: string]: number };
  // Value each associated Dropi product is reported with when this combo's
  // order is created. Set explicitly per product so their sum matches the
  // combo's final price (dprice) — not derived automatically.
  dropiValues?: { [code: string]: number };
  // This combo's price when a bono code is applied, replacing dprice for the
  // discount calculation instead of the generic bono discount percentage.
  bonoFinalPrice?: number;
  // Per-product order values used instead of dropiValues when a bono is
  // applied to the order. Only meaningful (and editable) when bonoFinalPrice
  // is set — their sum should match bonoFinalPrice.
  dropiValuesBono?: { [code: string]: number };
}

export interface DropiProduct {
  id?: string;
  code: string;
  name: string;
  stock: number;
  value: number;
  provider: string;
}

export interface DropiOrderItem {
  code: string;
  name?: string;
  provider?: string;
  quantity: number;
  value: number;
  isMain: boolean;
}

// Column names match docs/FORMATO-DE-ORDENES-MASIVAS-ID.xlsx exactly, since
// these are the same keys product-detail.page.ts writes to Firestore on checkout.
export interface DropiOrder {
  id?: string;
  'NOMBRES': string;
  'APELLIDOS': string;
  'DIRECCION': string;
  'DEPARTAMENTO': string;
  'CIUDAD': string;
  'TELEFONO': string;
  'ID DE PRODUCTO': string;
  'CANTIDAD': string;
  'PRECIO TOTAL (SIN PUNTOS NI COMAS)': number;
  'CON RECAUDO': string;
  'NOTA': string;
  'EMAIL (NO OBLIGATORIO)': string;
  productTitle?: string;
  internalProductId?: string;
  dropiItems?: DropiOrderItem[];
  createdAt?: any;
  status?: string;
  // Sequential, human-facing order number: YYYY + 6-digit consecutive
  // (e.g. "2026000001"), tracked in parametros/contadorPedidos.
  orderNumber?: string;
}

export const DROPI_ORDER_COLUMNS: (keyof DropiOrder)[] = [
  'NOMBRES', 'APELLIDOS', 'DIRECCION', 'DEPARTAMENTO', 'CIUDAD', 'TELEFONO',
  'ID DE PRODUCTO', 'CANTIDAD', 'PRECIO TOTAL (SIN PUNTOS NI COMAS)',
  'CON RECAUDO', 'NOTA', 'EMAIL (NO OBLIGATORIO)'
];

export interface Benefit {
  icon: string;
  title: string;
  text: string;
}

export interface ComparisonRow {
  label: string;
  ours: string;
  others: string;
}

export interface ProductSections {
  specifications?: string;
  experience?: string;
  materials?: string;
  howToUse?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProductLegal {
  refundPolicy?: string;
  termsOfService?: string;
  privacyPolicy?: string;
}

export interface Product {
  id?: string;
  img: string;
  imgSlides: string[];
  title: string;
  text: string;
  heartVis: boolean;
  dPrice: string;
  price: string;
  featured: boolean;
  new: boolean;
  sale: boolean;
  description: string;
  category: Category;
  similarItems: any[];
  variants?: ProductVariant[];

  // Immersive landing page fields
  subtitle?: string;
  badgeText?: string;
  urgencyText?: string;
  shippingText?: string;
  ctaText?: string;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  ctaHoverColor?: string;
  deliveryText?: string;
  ratingValue?: number;
  reviewsCount?: number;
  primaryColor?: string;
  secondaryColor?: string;
  secondaryTextColor?: string;
  priceGroups?: PriceGroup[];
  youtubeUrl?: string;
  showcaseImageUrl?: string;
  showcaseImageUrl2?: string;
  highlightMessage?: string;
  closingImageUrl?: string;
  closingImageUrl2?: string;
  promoImageUrl?: string;
  faqTitle?: string;
  faqSubtitle?: string;
  faqs?: FaqItem[];
  sections?: ProductSections;
  benefits?: Benefit[];
  comparisonRows?: ComparisonRow[];
  legal?: ProductLegal;
}
