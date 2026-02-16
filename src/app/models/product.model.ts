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
}
