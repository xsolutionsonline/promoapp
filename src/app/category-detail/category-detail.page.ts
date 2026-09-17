import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Events } from '../services/events.service';
import { NavigationExtras, Router, ActivatedRoute } from "@angular/router";
import { Firestore, collection, query, where, collectionData, doc, getDoc } from '@angular/fire/firestore';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-category-detail',
  templateUrl: './category-detail.page.html',
  styleUrls: ['./category-detail.page.scss'],
  standalone: false,
})
export class CategoryDetailPage implements OnInit {
  // for showing grid or list content
  public visiableGrid = true;
  public divBlur = "";
  // for category id get from home page
  public categoryId = "";
  //for category
  public categoryHeader = "Category";
  public categoryLoop = [];
  public displayedProducts = [];

  public searchTerm = "";
  public sortDirection: 'asc' | 'desc' | null = null;

  constructor(private elementRef: ElementRef,
    private events: Events,
    private toastController: ToastController,
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore) {

    //for making background blur
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });

    this.route.queryParams.subscribe(params => {

      if (this.router.getCurrentNavigation().extras.state) {
        const category = this.router.getCurrentNavigation().extras.state["category"];
        if (category) {
          this.categoryId = category.id;
          this.categoryHeader = category.text;
          this.loadProducts();
        }
      }
    });
  }

  ngOnInit() {
  }

  async heart(item) {
    if (item.heartVis == true) {
      item.heartVis = false;
      const toast = await this.toastController.create({
        message: 'Producto removido de tus favoritos',
        duration: 2000
      });
      toast.present();
    }
    else {
      item.heartVis = true;
      const toast = await this.toastController.create({
        message: 'Producto agregado a tus favoritos',
        duration: 2000
      });
      toast.present();
    }
  }

  // for list and grid
  isGridList(item) {
    this.visiableGrid = item === 'grid';
  }

  onSearchChange() {
    this.applyFilters();
  }

  setSortDirection(direction: 'asc' | 'desc') {
    this.sortDirection = this.sortDirection === direction ? null : direction;
    this.applyFilters();
  }

  private applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    let result = !term
      ? [...this.categoryLoop]
      : this.categoryLoop.filter(item =>
          (item.title && item.title.toLowerCase().includes(term)) ||
          (item.text && item.text.toLowerCase().includes(term))
        );

    if (this.sortDirection === 'asc') {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (this.sortDirection === 'desc') {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    this.displayedProducts = result;
  }

  loadProducts() {
    if (this.categoryHeader) {
      const productsRef = collection(this.firestore, 'products');
      const q = query(productsRef, where('category.name', '==', this.categoryHeader));

      collectionData(q, { idField: 'id' }).subscribe((products: any[]) => {
        this.categoryLoop = products;
        this.applyFilters();
      });
    }
  }

  ionViewWillEnter() {
    // Keep existing event subscription as fallback or for other navigation methods
    this.events.subscribe('CatId', async (data) => {
      this.categoryId = data;

      if (this.categoryId) {
        // 1. Get Category Name from Firestore
        const categoryDocRef = doc(this.firestore, `category/${this.categoryId}`);
        const categorySnapshot = await getDoc(categoryDocRef);

        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.data();
          this.categoryHeader = categoryData['text'];
          this.loadProducts();
        } else {
          this.categoryHeader = "Category Not Found";
          this.categoryLoop = [];
          this.displayedProducts = [];
        }
      }
    });
  }

  goToProductDetail(item) {
    if (item) {
      const navigationExtras: NavigationExtras = {
        state: {
          product: item
        }
      };
      this.router.navigate(['product-detail'], navigationExtras);
    } else {
      console.warn("No item passed to goToProductDetail");
    }
  }
}
