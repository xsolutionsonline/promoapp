import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private commonSimilarItems = [
    { img: "assets/images/shoes/featured/2.png", title: "KVIDIO Headphones", name: "KVIDIO Headphones", price: "18.99", dPrice: "28.99", feature: true, new: false, sale: false, heartVis: false },
    { img: "assets/images/shoes/new/2.png", title: "Dog Toys", name: "Dog Toys", price: "12.99", dPrice: "15", feature: false, new: true, sale: false, heartVis: false },
    { img: "assets/images/shoes/sale/1.png", title: "Hybrid Headphones", name: "Hybrid Headphones", price: "39.99", dPrice: "80", feature: true, new: true, sale: true, heartVis: false }
  ];

  private featuredItems = [
    {
      img: "assets/images/shoes/featured/1.png",
      imgSlides: ["assets/images/shoes/featured/1.png", "assets/images/shoes/featured/1.png", "assets/images/shoes/featured/1.png"],
      title: "AA Batteries",
      text: "Powermax 12 AA Dual Batteries, Long-Lasting Alkaline Blister Pack ...",
      heartVis: true,
      dPrice: "10",
      price: "6.10",
      featured: true,
      new: true,
      sale: true,
      description: "Long-lasting power for your everyday devices. These AA batteries are perfect for toys, remote controls, and more.",
      category: "Technology",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/featured/2.png",
      imgSlides: ["assets/images/shoes/featured/2.png", "assets/images/shoes/featured/2.png", "assets/images/shoes/featured/2.png"],
      title: "Bluetooth Headphones",
      text: "KVIDIO Over-Ear Bluetooth Headphones, 65 Hours Playtime...",
      heartVis: false,
      dPrice: "28.99",
      price: "18.99",
      featured: true,
      new: false,
      sale: false,
      description: "Experience high-quality sound with KVIDIO Over-Ear Bluetooth Headphones. With up to 65 hours of playtime, you can enjoy your music all day long.",
      category: "Technology",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/featured/3.png",
      imgSlides: ["assets/images/shoes/featured/3.png", "assets/images/shoes/featured/3.png", "assets/images/shoes/featured/3.png"],
      title: "Rubber Dog Toys",
      text: "Squeaky Dog Toys, Soft Latex Rubber Squeaky Balls for Puppies...",
      heartVis: false,
      dPrice: "18",
      price: "15.99",
      featured: true,
      new: false,
      sale: false,
      description: "Keep your puppy entertained with these soft latex rubber squeaky balls. Durable and safe for your furry friend.",
      category: "Pets",
      similarItems: this.commonSimilarItems
    },
  ];

  private newItems = [
    {
      img: "assets/images/shoes/new/1.png",
      imgSlides: ["assets/images/shoes/new/1.png", "assets/images/shoes/new/1.png", "assets/images/shoes/new/1.png"],
      title: "Resin Art Course",
      text: "THE MOST COMPLETE RESIN COURSE 🚀 Learn how to create....",
      heartVis: false,
      dPrice: "74",
      price: "49.99",
      featured: false,
      new: true,
      sale: false,
      description: "Master the art of resin with this comprehensive course. Learn techniques to create stunning jewelry, art, and more.",
      category: "Info-products",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/new/2.png",
      imgSlides: ["assets/images/shoes/new/2.png", "assets/images/shoes/new/2.png", "assets/images/shoes/new/2.png"],
      title: "Soft Dog Toys",
      text: "Best Pet Supplies Squeaky Dog Toys with Soft and Durable Fabric....",
      heartVis: false,
      dPrice: "15",
      price: "12.99",
      featured: false,
      new: true,
      sale: false,
      description: "Durable and soft fabric squeaky toys for dogs. Perfect for fetch and cuddle time.",
      category: "Pets",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/new/3.png",
      imgSlides: ["assets/images/shoes/new/3.png", "assets/images/shoes/new/3.png", "assets/images/shoes/new/3.png"],
      title: "Mini Projector",
      text: "Elephas – 2020 Mini Proyector de Película, 5000 LUX Full HD 1080P",
      heartVis: false,
      dPrice: "70",
      price: "49.99",
      featured: false,
      new: true,
      sale: true,
      description: "Turn your living room into a home theater with the Elephas Mini Projector. Supports 1080P Full HD for crisp images.",
      category: "Technology",
      similarItems: this.commonSimilarItems
    },
  ];

  private saleItems = [
    {
      img: "assets/images/shoes/sale/1.png",
      imgSlides: ["assets/images/shoes/sale/1.png", "assets/images/shoes/sale/1.png", "assets/images/shoes/sale/1.png"],
      title: "Noise Cancelling Headphones",
      text: "Hybrid wireless headphones with active noise cancellation,",
      heartVis: false,
      dPrice: "80",
      price: "39.99",
      featured: true,
      new: true,
      sale: true,
      description: "Immerse yourself in music with these hybrid wireless headphones featuring active noise cancellation.",
      category: "Technology",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/sale/2.png",
      imgSlides: ["assets/images/shoes/sale/2.png", "assets/images/shoes/sale/2.png", "assets/images/shoes/sale/2.png"],
      title: "Floral Course",
      text: "Learn how to create floral arrangements for events",
      heartVis: false,
      dPrice: "197",
      price: "89.99",
      featured: true,
      new: false,
      sale: true,
      description: "Become a floral design expert. This course teaches you how to create beautiful arrangements for weddings and events.",
      category: "Info-products",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/sale/3.png",
      imgSlides: ["assets/images/shoes/sale/3.png", "assets/images/shoes/sale/3.png", "assets/images/shoes/sale/3.png"],
      title: "Pet Blanket",
      text: "Waterproof Dog Bed Blanket, Soft Pet Blankets,",
      heartVis: false,
      dPrice: "50",
      price: "37.7",
      featured: true,
      new: false,
      sale: true,
      description: "Protect your furniture and keep your pet cozy with this waterproof dog bed blanket.",
      category: "Pets",
      similarItems: this.commonSimilarItems
    },
  ];

  private categoryProducts = [
    {
      img: "assets/images/shoes/featured/2.png",
      imgSlides: ["assets/images/shoes/featured/2.png", "assets/images/shoes/featured/2.png", "assets/images/shoes/featured/2.png"],
      title: "KVIDIO Headphones",
      text: "Product Name Will Go Here!",
      textGrid: "Product Name Will Go Here!",
      textList: "Product Name Will Go Here! Product Title",
      price: "100",
      dPrice: "150",
      heartVis: false,
      featured: true,
      new: false,
      sale: false,
      description: "High quality headphones with excellent sound clarity.",
      category: "Technology",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/featured/1.png",
      imgSlides: ["assets/images/shoes/featured/1.png", "assets/images/shoes/featured/1.png", "assets/images/shoes/featured/1.png"],
      title: "AA Batteries",
      text: "Product Name Will Go Here!",
      textGrid: "Product Name Will Go Here!",
      textList: "Product Name Will Go Here! Product Title",
      price: "100",
      dPrice: "150",
      heartVis: false,
      featured: false,
      new: false,
      sale: true,
      description: "Long lasting batteries for all your devices.",
      category: "Technology",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/sale/2.png",
      imgSlides: ["assets/images/shoes/sale/2.png", "assets/images/shoes/sale/2.png", "assets/images/shoes/sale/2.png"],
      title: "Floral Course",
      text: "Product Name Will Go Here!",
      textGrid: "Product Name Will Go Here!",
      textList: "Product Name Will Go Here! Product Title",
      price: "100",
      dPrice: "150",
      heartVis: false,
      featured: false,
      new: true,
      sale: false,
      description: "Learn to arrange flowers like a pro.",
      category: "Info-products",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/sport/4.png",
      imgSlides: ["assets/images/shoes/sport/4.png", "assets/images/shoes/sport/4.png", "assets/images/shoes/sport/4.png"],
      title: "Sport Shoes 4",
      text: "Product Name Will Go Here!",
      textGrid: "Product Name Will Go Here!",
      textList: "Product Name Will Go Here! Product Title",
      price: "100",
      dPrice: "150",
      heartVis: false,
      featured: true,
      new: true,
      sale: false,
      description: "Comfortable sport shoes for running.",
      category: "Sport",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/sport/1.png",
      imgSlides: ["assets/images/shoes/sport/1.png", "assets/images/shoes/sport/1.png", "assets/images/shoes/sport/1.png"],
      title: "Sport Shoes 1",
      text: "Product Name Will Go Here!",
      textGrid: "Product Name Will Go Here!",
      textList: "Product Name Will Go Here! Product Title",
      price: "100",
      dPrice: "150",
      heartVis: false,
      featured: true,
      new: false,
      sale: true,
      description: "Durable sport shoes for everyday use.",
      category: "Sport",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/sport/2.png",
      imgSlides: ["assets/images/shoes/sport/2.png", "assets/images/shoes/sport/2.png", "assets/images/shoes/sport/2.png"],
      title: "Sport Shoes 2",
      text: "Product Name Will Go Here!",
      textGrid: "Product Name Will Go Here!",
      textList: "Product Name Will Go Here! Product Title",
      price: "100",
      dPrice: "150",
      heartVis: false,
      featured: false,
      new: true,
      sale: true,
      description: "Stylish sport shoes for the gym.",
      category: "Sport",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/sport/3.png",
      imgSlides: ["assets/images/shoes/sport/3.png", "assets/images/shoes/sport/3.png", "assets/images/shoes/sport/3.png"],
      title: "Sport Shoes 3",
      text: "Product Name Will Go Here!",
      textGrid: "Product Name Will Go Here!",
      textList: "Product Name Will Go Here! Product Title",
      price: "100",
      dPrice: "150",
      heartVis: false,
      featured: true,
      new: true,
      sale: true,
      description: "High performance sport shoes.",
      category: "Sport",
      similarItems: this.commonSimilarItems
    },
    {
      img: "assets/images/shoes/new/3.png",
      imgSlides: ["assets/images/shoes/new/3.png", "assets/images/shoes/new/3.png", "assets/images/shoes/new/3.png"],
      title: "Mini Projector",
      text: "Product Name Will Go Here!",
      textGrid: "Product Name Will Go Here!",
      textList: "Product Name Will Go Here! Product Title",
      price: "100",
      dPrice: "150",
      heartVis: false,
      featured: false,
      new: false,
      sale: false,
      description: "Portable mini projector for home cinema.",
      category: "Technology",
      similarItems: this.commonSimilarItems
    },
  ];

  private slides = [
    "assets/images/banner/banner-1.png",
    "assets/images/banner/banner-2.png",
    "assets/images/banner/banner-3.png",
  ];

  private categoryItems = [
    { img: "assets/images/category/technology.png", text: "Technology" },
    { img: "assets/images/category/pets-dos.png", text: "Pets" },
    { img: "assets/images/category/health.png", text: "Health" },
    { img: "assets/images/category/info-prod.png", text: "Info-products" },
  ];

  constructor() { }

  getFeaturedItems() {
    return this.featuredItems;
  }

  getNewItems() {
    return this.newItems;
  }

  getSaleItems() {
    return this.saleItems;
  }

  getSlides() {
    return this.slides;
  }

  getCategoryItems() {
    return this.categoryItems;
  }

  getCategoryProducts() {
    return this.categoryProducts;
  }
}
