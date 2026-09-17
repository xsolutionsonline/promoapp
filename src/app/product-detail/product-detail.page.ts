import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ModalController, ToastController, NavController, IonicModule } from '@ionic/angular';
import { ProductDetailModalPage } from '../product-detail-modal/product-detail-modal.page';
import { Events } from '../services/events.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../services/firestore.service';
import { DropiProductService } from '../services/dropi-product.service';
import { HttpClient } from '@angular/common/http';
import { Firestore, collection, query, where, doc, updateDoc, setDoc, arrayUnion, runTransaction } from '@angular/fire/firestore';
import { Auth, authState, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { LoadingService } from '../services/loading.service';
import { DataServiceService } from '../services/data-service.service';
import { CategoryService, CategoryItem } from '../services/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ProductSections, Benefit, ComparisonRow, ProductLegal, FaqItem } from '../models/product.model';
import {
  DEFAULT_REFUND_POLICY,
  DEFAULT_TERMS_OF_SERVICE,
  DEFAULT_PRIVACY_POLICY
} from '../shared/default-legal-content';

interface GroupVariant {
  text: string;
  dprice: number;
  price: number;
  active: boolean;
  dropiCodes?: string[];
  dropiMainCode?: string;
  dropiQuantities?: { [code: string]: number };
  dropiValues?: { [code: string]: number };
  bonoFinalPrice?: number;
  dropiValuesBono?: { [code: string]: number };
}

type LegalModalType = 'refund' | 'terms' | 'privacy' | null;

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProductDetailPage implements OnInit, OnDestroy {
  @ViewChild('productSlider', { static: false }) productSlider: ElementRef;

  public visProductSuccessful = true;

  // ----- Post-purchase upsell (one-click "take another for a discount") -----
  public showUpsellPromo = false;
  public isProcessingUpsell = false;
  public upsellUnitPrice = 0;
  public upsellQuantity = 1;
  public upsellTotalPrice = 0;
  private lastOrderId: string | null = null;
  private lastOrderMainCode: string | null = null;

  productQuantity = 1;
  productPrice = 90;
  productDPrice = 100;

  public visiablePopup = false;
  public divBlur = ""
  public visHeart = true;
  public categoryHeader = "Product Name Here";
  // Starts empty (not the old leftover template shoe photos) — real slides
  // come from the loaded product. The gallery shows a neutral placeholder
  // (see .pdp-gallery-main styles) until then instead of a wrong-looking image.
  public slides = [];
  // Starts empty (not the old leftover template shoe products) — filled in
  // from the loaded product's similarItems, if it has any.
  public productSlides = [];
  public colorItems = [];
  public sizeItems = [];
  public groupItems: GroupVariant[] = [];
  private dropiProductValues: { [code: string]: number } = {};
  private dropiProductNames: { [code: string]: string } = {};
  private dropiProductProviders: { [code: string]: string } = {};
  sliderConfig = {
    slidesPerView: 2.1,
    spaceBetween: 5,
  };

  // Immersive landing page state
  public brandPrimary = '#6D28D9';
  public brandSecondary = '#111111';
  public secondaryTextColor = '#ffffff';
  public productSubtitle = '';
  public productBadgeText = '';
  public productUrgencyText = '';
  public productShippingText = '';
  public productCtaText = 'OBTENER OFERTA Y PAGAR AL RECIBIR';
  public ctaBackgroundColor = '';
  public ctaTextColor = '#ffffff';
  public ctaHoverColor = '#6D28D9';
  public productDeliveryText = '';
  public ratingValue = 4.7;
  public reviewsCount = 217;
  public sections: ProductSections = {};
  public benefits: Benefit[] = [];
  public comparisonRows: ComparisonRow[] = [];
  public legal: ProductLegal = {};
  public activeLegalModal: LegalModalType = null;
  public activeSlideIndex = 0;
  public youtubeEmbedUrl: SafeResourceUrl | null = null;
  public showcaseImageUrl = '';
  public showcaseImageUrl2 = '';
  public highlightMessage = '';
  public closingImageUrl = '';
  public closingImageUrl2 = '';
  public faqTitle = '';
  public faqSubtitle = '';
  public faqs: FaqItem[] = [];

  currentProduct: any = null;
  public productLoaded = false;
  private autoplayInterval: any;

  public checkoutData = {
    nombre: '', apellido: '', telefono: '', direccion: '', departamento: '', ciudad: '', email: '', nota: ''
  };
  public isSubmittingOrder = false;

  // ----- Add extra products to the order (search + slider, replaces the old combo selector) -----
  public isUserRegistered = false;
  private allProductsCache: any[] = [];
  public addOnSearchTerm = '';
  public orderExtraItems: {
    id: string; title: string; img: string; price: number; quantity: number;
    dropiCodes?: string[]; dropiMainCode?: string; dropiQuantities?: { [code: string]: number };
    dropiValues?: { [code: string]: number }; bonoFinalPrice?: number; listPrice?: number;
    dropiValuesBono?: { [code: string]: number };
  }[] = [];

  // ----- Combo picker shown when adding an extra product that has packages -----
  public isAddOnComboModalOpen = false;
  public addOnComboModalProduct: any = null;
  public addOnComboModalGroups: any[] = [];
  public addOnComboModalSelectedIndex = 0;

  // ----- Discount bono (only available to registered users) -----
  public bonoCode = '';
  public bonoDiscountPercent = 0;
  public isApplyingBono = false;
  public bonoError = '';
  // True for personal codes minted at registration: they discount only the
  // extra/add-on items in the order, never the combo being purchased right now.
  public bonoAppliesToExtrasOnly = false;

  // ----- Inline registration (shown once an extra product is added, so the
  // welcome bono can be applied to "the second product") -----
  public activeCategories: CategoryItem[] = [];
  public regEmail = '';
  public regPassword = '';
  public regConfirmPassword = '';
  public regWhatsapp = '';
  public regSelectedCategories: string[] = [];
  public isRegistering = false;
  public registerError = '';

  get showInlineRegisterForm(): boolean {
    return !this.isUserRegistered && this.orderExtraItems.length > 0;
  }

  toggleRegCategory(text: string) {
    const i = this.regSelectedCategories.indexOf(text);
    if (i === -1) { this.regSelectedCategories.push(text); } else { this.regSelectedCategories.splice(i, 1); }
  }

  // ----- Departamento / Ciudad picker (assets/data/departments.json) -----
  private departmentsData: { name: string; cities: string[] }[] = [];
  public citiesForSelectedDepartment: string[] = [];
  public isLocationPickerOpen = false;
  public locationPickerType: 'departamento' | 'ciudad' | null = null;
  public locationPickerSearchTerm = '';

  get locationPickerOptions(): string[] {
    const term = this.locationPickerSearchTerm.trim().toLowerCase();
    const options = this.locationPickerType === 'departamento'
      ? this.departmentsData.map(d => d.name)
      : this.citiesForSelectedDepartment;
    if (!term) { return options; }
    return options.filter(option => option.toLowerCase().includes(term));
  }

  openLocationPicker(type: 'departamento' | 'ciudad') {
    if (type === 'ciudad' && !this.checkoutData.departamento) { return; }
    this.locationPickerType = type;
    this.locationPickerSearchTerm = '';
    this.isLocationPickerOpen = true;
  }

  closeLocationPicker() {
    this.isLocationPickerOpen = false;
    this.locationPickerType = null;
    this.locationPickerSearchTerm = '';
  }

  selectLocationOption(value: string) {
    if (this.locationPickerType === 'departamento') {
      this.checkoutData.departamento = value;
      this.checkoutData.ciudad = '';
      const dept = this.departmentsData.find(d => d.name === value);
      this.citiesForSelectedDepartment = dept ? dept.cities : [];
    } else if (this.locationPickerType === 'ciudad') {
      this.checkoutData.ciudad = value;
    }
    this.closeLocationPicker();
  }

  constructor(private modalCtrl: ModalController,
    public events: Events, private elementRef: ElementRef,
    private toastController: ToastController,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private dropiProductService: DropiProductService,
    private http: HttpClient,
    private firestore: Firestore,
    private auth: Auth,
    private categoryService: CategoryService,
    private dataService: DataServiceService,
    private loadingService: LoadingService,
    private sanitizer: DomSanitizer) {

    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });

    this.dropiProductService.getAll().subscribe(list => {
      this.dropiProductValues = {};
      this.dropiProductNames = {};
      this.dropiProductProviders = {};
      list.forEach(p => {
        this.dropiProductValues[p.code] = p.value;
        this.dropiProductNames[p.code] = p.name;
        this.dropiProductProviders[p.code] = p.provider;
      });
    });

    this.http.get<{ name: string; cities: string[] }[]>('assets/data/departments.json')
      .subscribe(data => this.departmentsData = data || []);

    authState(this.auth).subscribe(user => { this.isUserRegistered = !!user; });

    this.firestoreService.getAll<any>('products').subscribe(list => {
      this.allProductsCache = list || [];
    });

    this.categoryService.getActive().subscribe(list => {
      this.activeCategories = list || [];
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  initializeProductData(data: any) {
    if (data) {
      this.currentProduct = data;
      this.categoryHeader = data.title ? data.title : data.text;
      this.productPrice = parseFloat(data.price);
      this.productDPrice = parseFloat(data.dPrice);
      this.visHeart = !data.heartVis;

      if (data.imgSlides && data.imgSlides.length > 0) {
        this.slides = data.imgSlides;
      } else if (data.img) {
        this.slides = [data.img, data.img, data.img];
      }

      if (data.similarItems) {
        this.productSlides = data.similarItems;
      }

      if (data.priceGroups && data.priceGroups.length > 0) {
        this.groupItems = data.priceGroups.map((group, index) => ({
          ...group,
          active: index === 0
        }));
      } else if (data.variants && data.variants[0] && data.variants[0].groups) {
        this.groupItems = (data.variants[0].groups || []).map((group, index) => ({
          ...group,
          active: index === 0
        }));
      } else {
        this.groupItems = [];
      }

      if (data.variants && data.variants[0]) {
        this.colorItems = data.variants[0].colors || [];
        this.sizeItems = data.variants[0].sizes || [];
      } else {
        this.colorItems = [];
        this.sizeItems = [];
      }

      this.brandPrimary = data.primaryColor || '#6D28D9';
      this.brandSecondary = data.secondaryColor || '#111111';
      this.secondaryTextColor = data.secondaryTextColor || '#ffffff';
      this.showcaseImageUrl = data.showcaseImageUrl || '';
      this.showcaseImageUrl2 = data.showcaseImageUrl2 || '';
      this.highlightMessage = data.highlightMessage || '';
      this.closingImageUrl = data.closingImageUrl || '';
      this.closingImageUrl2 = data.closingImageUrl2 || '';
      this.faqTitle = data.faqTitle || 'Pregúntanos lo que quieras';
      this.faqSubtitle = data.faqSubtitle || '¿Tienes dudas? Aquí resolvemos las más frecuentes.';
      this.faqs = data.faqs || [];
      this.productSubtitle = data.subtitle || '';
      this.productBadgeText = data.badgeText || '';
      this.productUrgencyText = data.urgencyText || '';
      this.productShippingText = data.shippingText || '';
      this.productCtaText = data.ctaText || 'OBTENER OFERTA Y PAGAR AL RECIBIR';
      this.ctaBackgroundColor = data.ctaBackgroundColor || data.primaryColor || '#1faf5a';
      this.ctaTextColor = data.ctaTextColor || '#ffffff';
      this.ctaHoverColor = data.ctaHoverColor || this.ctaBackgroundColor;
      this.productDeliveryText = data.deliveryText || '';
      this.ratingValue = data.ratingValue || 4.7;
      this.reviewsCount = data.reviewsCount || 217;
      this.sections = data.sections || {};
      this.benefits = data.benefits || [];
      this.comparisonRows = data.comparisonRows || [];
      this.legal = data.legal || {};

      const youtubeId = data.youtubeUrl ? this.extractYoutubeId(data.youtubeUrl) : null;
      this.youtubeEmbedUrl = youtubeId
        ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${youtubeId}`)
        : null;

      this.activeSlideIndex = 0;
      this.productQuantity = 1;
      this.updateTotalPrice();
    }
  }

  selectSlide(index: number) {
    this.activeSlideIndex = index;
    this.stopAutoplay();
  }

  // ----- Immersive landing page helpers -----
  get descriptionHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.currentProduct?.description || 'No description available.');
  }

  private extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  formatPrice(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num === null || num === undefined || isNaN(num)) { return '0'; }
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  sectionHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  get darkBlockBackground(): string {
    return this.brandSecondary;
  }

  openLegal(type: LegalModalType) {
    this.activeLegalModal = type;
  }

  closeLegal() {
    this.activeLegalModal = null;
  }

  get legalModalTitle(): string {
    if (this.activeLegalModal === 'refund') { return 'Política de reembolsos'; }
    if (this.activeLegalModal === 'terms') { return 'Términos y condiciones'; }
    if (this.activeLegalModal === 'privacy') { return 'Política de privacidad'; }
    return '';
  }

  get legalModalContent(): string {
    if (this.activeLegalModal === 'refund') { return this.legal.refundPolicy || DEFAULT_REFUND_POLICY; }
    if (this.activeLegalModal === 'terms') { return this.legal.termsOfService || DEFAULT_TERMS_OF_SERVICE; }
    if (this.activeLegalModal === 'privacy') { return this.legal.privacyPolicy || DEFAULT_PRIVACY_POLICY; }
    return '';
  }

  selectGroup(selectedGroup: GroupVariant) {
    this.groupItems.forEach(group => group.active = (group.text === selectedGroup.text));
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    const selectedGroup = this.groupItems.find(g => g.active);
    let unitPrice = selectedGroup ? selectedGroup.dprice : (this.currentProduct ? parseFloat(this.currentProduct.price) : 0);
    this.productPrice = unitPrice * this.productQuantity;
  }

  // ----- Add extra products to the order (search + slider) -----
  get addOnResults(): any[] {
    const term = this.addOnSearchTerm.trim().toLowerCase();
    const pool = this.allProductsCache.filter(p => p.id !== this.currentProduct?.id);
    if (!term) { return pool.slice(0, 15); }
    return pool.filter(p => (p.title || p.text || '').toLowerCase().includes(term)).slice(0, 15);
  }

  // Tapping an add-on either bumps its quantity (already in the order), adds
  // it straight away (no packages to choose from), or opens the combo picker
  // so the shopper can pick which package (X1/X2/X3) to add.
  openAddOnComboPicker(product: any) {
    const existing = this.orderExtraItems.find(i => i.id === product.id);
    if (existing) {
      existing.quantity++;
      return;
    }
    const groups = (product.priceGroups || []).filter((g: any) => g && g.text);
    if (groups.length === 0) {
      this.addExtraProductWithGroup(product, null);
      return;
    }
    this.addOnComboModalProduct = product;
    this.addOnComboModalGroups = groups;
    this.addOnComboModalSelectedIndex = 0;
    this.isAddOnComboModalOpen = true;
  }

  selectAddOnComboOption(index: number) {
    this.addOnComboModalSelectedIndex = index;
  }

  closeAddOnComboModal() {
    this.isAddOnComboModalOpen = false;
    this.addOnComboModalProduct = null;
    this.addOnComboModalGroups = [];
    this.addOnComboModalSelectedIndex = 0;
  }

  confirmAddOnCombo() {
    if (!this.addOnComboModalProduct) { return; }
    const group = this.addOnComboModalGroups[this.addOnComboModalSelectedIndex] || null;
    this.addExtraProductWithGroup(this.addOnComboModalProduct, group);
    this.closeAddOnComboModal();
  }

  private addExtraProductWithGroup(product: any, group: any | null) {
    // "Precio tachado" (the crossed-out list price) lives on group.price for
    // a package, or product.dPrice for a plain product — group.dprice /
    // product.price are the actual (non-bono) sale prices, kept in `price`.
    const listPriceRaw = group ? group.price : product.dPrice;
    const listPrice = listPriceRaw != null && listPriceRaw !== '' ? parseFloat(listPriceRaw) : undefined;
    this.orderExtraItems.push({
      id: product.id,
      title: product.title || product.text,
      img: product.img,
      price: group ? (parseFloat(group.dprice) || 0) : (parseFloat(product.price) || 0),
      quantity: 1,
      dropiCodes: group?.dropiCodes,
      dropiMainCode: group?.dropiMainCode,
      dropiQuantities: group?.dropiQuantities,
      dropiValues: group?.dropiValues,
      dropiValuesBono: group?.dropiValuesBono,
      bonoFinalPrice: group?.bonoFinalPrice,
      listPrice
    });
  }

  incrementExtraItem(item: { quantity: number }) {
    item.quantity++;
  }

  decrementExtraItem(item: { quantity: number }) {
    item.quantity--;
    if (item.quantity <= 0) {
      this.removeExtraItem(item as any);
    }
  }

  removeExtraItem(item: { id: string }) {
    this.orderExtraItems = this.orderExtraItems.filter(i => i.id !== item.id);
  }

  get extraItemsSubtotal(): number {
    return this.orderExtraItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  get orderSubtotal(): number {
    return this.productPrice + this.extraItemsSubtotal;
  }

  // Sum, over every add-on, of ("Precio tachado" − "Precio final con bono") —
  // the same before/after pair shown struck-through in the add-ons cart —
  // falling back to the generic percentage for add-ons that don't set a bono price.
  private get extraItemsBonoDiscount(): number {
    return this.orderExtraItems.reduce((sum, item) => {
      const perUnitDiscount = item.bonoFinalPrice != null
        ? Math.max(0, (item.listPrice ?? item.price) - item.bonoFinalPrice)
        : item.price * (this.bonoDiscountPercent / 100);
      return sum + perUnitDiscount * item.quantity;
    }, 0);
  }

  get orderDiscountAmount(): number {
    if (this.bonoDiscountPercent <= 0) { return 0; }
    // Personal codes (minted at registration) only ever discount the
    // extra/add-on items — never the combo currently being purchased, so the
    // main product's full price always gets added on top untouched.
    if (this.bonoAppliesToExtrasOnly) {
      return this.extraItemsBonoDiscount;
    }
    // A combo can define its own fixed price for when a bono is applied
    // (bonoFinalPrice) instead of using the generic percentage.
    const selectedGroup = this.groupItems.find(g => g.active);
    const comboDiscount = (selectedGroup && selectedGroup.bonoFinalPrice != null)
      ? Math.max(0, this.productPrice - selectedGroup.bonoFinalPrice)
      : this.productPrice * (this.bonoDiscountPercent / 100);
    return comboDiscount + this.extraItemsBonoDiscount;
  }

  get orderTotal(): number {
    return this.orderSubtotal - this.orderDiscountAmount;
  }

  // ----- Discount bono (registered users only) -----
  async applyBono() {
    const code = this.bonoCode.trim().toUpperCase();
    if (!code) { return; }
    this.isApplyingBono = true;
    this.bonoError = '';
    try {
      const snap = await this.firestoreService.getById<any>('bonos', code);
      const data = snap.exists() ? snap.data() : null;
      const ownerUid: string | undefined = data?.['ownerUid'];
      // Personal codes are minted for one specific customer — only that
      // logged-in account can redeem them.
      if (ownerUid && ownerUid !== this.auth.currentUser?.uid) {
        this.bonoError = 'Este código de bono no está disponible para tu cuenta.';
      } else if (data && data['active'] !== false && data['discountPercent']) {
        this.bonoDiscountPercent = data['discountPercent'];
        this.bonoAppliesToExtrasOnly = !!data['extraItemsOnly'];
      } else {
        this.bonoError = 'Código de bono no válido.';
      }
    } catch (error) {
      console.error('Error validating bono code', error);
      this.bonoError = 'No pudimos validar el código. Intenta de nuevo.';
    } finally {
      this.isApplyingBono = false;
    }
  }

  removeBono() {
    this.bonoCode = '';
    this.bonoDiscountPercent = 0;
    this.bonoAppliesToExtrasOnly = false;
    this.bonoError = '';
  }

  // Personal bono codes (3 letters + 3 digits, e.g. "XKQ482") are minted per
  // customer at registration instead of sharing one global code. Retries a
  // few times against the "bonos" collection to avoid the (astronomically
  // unlikely) case of picking a code that's already taken.
  private async generateUniqueBonoCode(): Promise<string> {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O — easy to confuse with 1/0
    const digits = '0123456789';
    let code = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      code = '';
      for (let i = 0; i < 3; i++) { code += letters[Math.floor(Math.random() * letters.length)]; }
      for (let i = 0; i < 3; i++) { code += digits[Math.floor(Math.random() * digits.length)]; }
      const existing = await this.firestoreService.getById('bonos', code);
      if (!existing.exists()) { return code; }
    }
    return code;
  }

  // ----- Inline registration: create the account without leaving the
  // checkout popup, then mint and auto-apply a personal bono code (3 letters
  // + 3 digits) for this customer. It only discounts extra/add-on items —
  // never the combo currently being purchased. -----
  async submitInlineRegister() {
    this.registerError = '';
    const email = this.regEmail.trim();
    const whatsapp = this.regWhatsapp.trim();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      this.registerError = 'Ingresa un correo válido.';
      return;
    }
    if (this.regPassword.length < 6) {
      this.registerError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.regPassword !== this.regConfirmPassword) {
      this.registerError = 'Las contraseñas no coinciden.';
      return;
    }
    if (!whatsapp) {
      this.registerError = 'Ingresa tu número de WhatsApp.';
      return;
    }

    this.isRegistering = true;
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, this.regPassword);
      const uid = credential.user.uid;

      // "bonos/BIENVENIDA" now only serves as the admin-configured template
      // for the discount percentage — the code actually applied is unique
      // per customer.
      let welcomeDiscount = 50;
      try {
        const bonoSnap = await this.firestoreService.getById<any>('bonos', 'BIENVENIDA');
        if (bonoSnap.exists()) {
          const bonoData = bonoSnap.data();
          welcomeDiscount = bonoData['active'] === false ? 0 : (bonoData['discountPercent'] || 50);
        }
      } catch (e) {
        console.error('Error reading welcome bono template, using default', e);
      }

      let personalBonoCode: string | null = null;
      if (welcomeDiscount > 0) {
        personalBonoCode = await this.generateUniqueBonoCode();
        await this.firestoreService.createWithId('bonos', personalBonoCode, {
          discountPercent: welcomeDiscount,
          active: true,
          ownerUid: uid,
          extraItemsOnly: true,
          createdAt: new Date()
        });
      }

      const customerData = {
        email,
        whatsapp,
        interestedCategories: this.regSelectedCategories,
        welcomeBonoApplied: true,
        bonoCode: personalBonoCode,
        createdAt: new Date()
      };
      await setDoc(doc(this.firestore, `customers/${uid}`), customerData);

      // Firebase Auth already signs the new user in, but the app's own login
      // state (side menu, /my-account, etc.) is driven by DataServiceService —
      // keep it in sync so the user stays logged in across the app, not just
      // for this checkout.
      this.dataService.setLogin(true);
      this.dataService.setUserData(customerData);

      const toastMessage = personalBonoCode
        ? `¡Cuenta creada! Tu bono personal ${personalBonoCode} (${welcomeDiscount}%) ya fue aplicado a los productos adicionales de este pedido.`
        : '¡Cuenta creada! Ya puedes continuar con tu pedido.';
      if (personalBonoCode) {
        this.bonoCode = personalBonoCode;
        this.bonoDiscountPercent = welcomeDiscount;
        this.bonoAppliesToExtrasOnly = true;
      }

      const toast = await this.toastController.create({
        message: toastMessage,
        duration: 3500,
        color: 'success'
      });
      toast.present();
      this.resetInlineRegisterForm();
    } catch (error: any) {
      console.error('Error during inline registration', error);
      if (error?.code === 'auth/email-already-in-use') {
        this.registerError = 'Ese correo ya está registrado. Inicia sesión para aplicar tu bono.';
      } else {
        this.registerError = 'No pudimos crear tu cuenta. Intenta de nuevo.';
      }
    } finally {
      this.isRegistering = false;
    }
  }

  ionViewDidLeave() {
    this.stopAutoplay();
    this.currentProduct = null;
  }

  startAutoplay() {
    this.stopAutoplay();
    if (!this.slides || this.slides.length <= 1) { return; }
    this.autoplayInterval = setInterval(() => {
      this.activeSlideIndex = (this.activeSlideIndex + 1) % this.slides.length;
    }, 6000);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  async share() {
    const toast = await this.toastController.create({ message: 'Product Share Clicked', duration: 2000 });
    toast.present();
  }

  async heart() {
    this.visHeart = !this.visHeart;
    const newHeartVis = !this.visHeart;

    if (this.currentProduct && this.currentProduct.id) {
      const productDocRef = doc(this.firestore, `products/${this.currentProduct.id}`);
      try {
        await updateDoc(productDocRef, { heartVis: newHeartVis });
        this.currentProduct.heartVis = newHeartVis;
        const message = newHeartVis ? 'Product Added To Wishlist' : 'Product Removed From Wishlist';
        const toast = await this.toastController.create({ message, duration: 2000 });
        toast.present();
      } catch (e) {
        console.error('Error updating heartVis in Firestore', e);
        this.visHeart = !this.visHeart;
        const toast = await this.toastController.create({ message: 'Failed to update wishlist status', duration: 2000, color: 'danger' });
        toast.present();
      }
    }
  }

  async heartProduct(item) {
    item.heartVis = !item.heartVis;
    if (item && item.id) {
      const productDocRef = doc(this.firestore, `products/${item.id}`);
      try {
        await updateDoc(productDocRef, { heartVis: item.heartVis });
        const message = item.heartVis ? 'Product Added To Wishlist' : 'Product Removed From Wishlist';
        const toast = await this.toastController.create({ message, duration: 2000 });
        toast.present();
      } catch (e) {
        console.error('Error updating heartVis in Firestore', e);
        item.heartVis = !item.heartVis;
        const toast = await this.toastController.create({ message: 'Failed to update wishlist status', duration: 2000, color: 'danger' });
        toast.present();
      }
    }
  }

  async loadProductById(id: string) {
    try {
      const snap = await this.firestoreService.getById<any>('products', id);
      if (snap.exists()) {
        this.initializeProductData({ ...snap.data(), id });
      }
    } catch (error) {
      console.error('Error loading product by id', error);
    }
  }

  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    this.productLoaded = false;

    // The 50off.png popup stays up for exactly 3s, even if the product data
    // (router state, or a fast Firestore fetch) is ready sooner.
    const popupShownAt = Date.now();
    const revealAfterMinDelay = () => {
      const remaining = Math.max(0, 3000 - (Date.now() - popupShownAt));
      setTimeout(() => { this.productLoaded = true; }, remaining);
    };

    if (history.state && history.state.product) {
      this.initializeProductData(history.state.product);
      revealAfterMinDelay();
    } else if (id) {
      // Direct/shared link: no router state (fresh load), fetch the product by its id.
      this.loadingService.show();
      this.loadProductById(id).finally(() => {
        this.loadingService.hide();
        revealAfterMinDelay();
      });
    } else {
      revealAfterMinDelay();
    }
    this.events.subscribe('blurValue', (data) => { this.divBlur = data; });
    this.visiablePopup = false;
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    setTimeout(() => { this.startAutoplay(); }, 1000);
  }

  goToProductDetailModal() {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.divBlur = "blur(6px)";
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
      this.visiablePopup = true;
    }, 2000);
  }

  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.visiablePopup = false;
    this.divBlur = "blur(0px)";
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    if (!this.visProductSuccessful) {
      this.visProductSuccessful = true;
      this.showUpsellPromo = false;
      this.checkoutData = { nombre: '', apellido: '', telefono: '', direccion: '', departamento: '', ciudad: '', email: '', nota: '' };
      this.citiesForSelectedDepartment = [];
      this.orderExtraItems = [];
      this.addOnSearchTerm = '';
      this.removeBono();
      this.resetInlineRegisterForm();
    }
  }

  isColorCheck(item) {
    this.colorItems.forEach(c => c.selectSize = false);
    item.selectSize = true;
  }

  isSelectedColorCheck(item) {
    item.selectSize = false;
  }

  isSizeCheck(item) {
    this.sizeItems.forEach(s => s.selectSize = false);
    item.selectSize = true;
  }

  isSelectSizeCheck(item) {
    item.selectSize = false;
  }

  goToReview() {
    this.navCtrl.navigateForward("review");
  }

  // Sequential order number: YYYY + 6-digit consecutive (e.g. "2026000001"),
  // resetting to 1 each new year. The running counter lives in a single
  // parametros/contadorPedidos doc; a transaction keeps concurrent checkouts
  // from ever handing out the same number.
  private async generateOrderNumber(): Promise<string> {
    const counterRef = doc(this.firestore, 'parametros/contadorPedidos');
    const year = new Date().getFullYear();
    const consecutivo = await runTransaction(this.firestore, async (transaction) => {
      const snap = await transaction.get(counterRef);
      const data = snap.exists() ? snap.data() : null;
      const next = (data && data['year'] === year) ? (data['consecutivo'] || 0) + 1 : 1;
      transaction.set(counterRef, { year, consecutivo: next });
      return next;
    });
    return `${year}${String(consecutivo).padStart(6, '0')}`;
  }

  // ----- COD checkout (Pago contra entrega) -----
  // Saves one document per order with the exact column names used by Dropi's
  // bulk order upload template (docs/FORMATO-DE-ORDENES-MASIVAS) so these can
  // later be exported/uploaded as-is.
  async submitCheckout() {
    const d = this.checkoutData;
    if (!d.nombre.trim() || !d.apellido.trim() || !d.telefono.trim() || !d.direccion.trim() || !d.departamento || !d.ciudad.trim()) {
      const toast = await this.toastController.create({
        message: 'Por favor completa todos los campos obligatorios.',
        duration: 2500,
        color: 'warning',
        position: 'top'
      });
      toast.present();
      return;
    }

    this.isSubmittingOrder = true;
    const selectedGroup = this.groupItems.find(g => g.active);
    const quantityLabel = selectedGroup ? selectedGroup.text : '1';
    const dropiCodes: string[] = (selectedGroup && selectedGroup.dropiCodes) || [];
    const dropiCode = dropiCodes.join(', ');
    const dropiQuantities: { [code: string]: number } = (selectedGroup && selectedGroup.dropiQuantities) || {};
    const dropiValues: { [code: string]: number } = (selectedGroup && selectedGroup.dropiValues) || {};
    // A bono only swaps in the combo's bono-specific values when the combo
    // actually defines a bonoFinalPrice — otherwise there's nothing to split
    // differently and the normal order values are used as-is. A personal
    // (extras-only) bono never touches the combo being purchased, so it never
    // swaps in bono-specific dropi values either.
    const useBonoValues = this.bonoDiscountPercent > 0 && !this.bonoAppliesToExtrasOnly
      && !!(selectedGroup && selectedGroup.bonoFinalPrice != null);
    const dropiValuesBono: { [code: string]: number } = (selectedGroup && selectedGroup.dropiValuesBono) || {};

    // Each Dropi product in the combo carries the value set for it when the
    // combo was created (falling back to its catalog "valor" if not set), so
    // admins control exactly how the combo's total price is split per row.
    const mainCode = (selectedGroup && selectedGroup.dropiMainCode && dropiCodes.includes(selectedGroup.dropiMainCode))
      ? selectedGroup.dropiMainCode
      : dropiCodes[0];

    const dropiItems = dropiCodes.map(code => ({
      code,
      name: this.dropiProductNames[code] || '',
      provider: this.dropiProductProviders[code] || '',
      quantity: dropiQuantities[code] || 1,
      value: (useBonoValues ? dropiValuesBono[code] : undefined) ?? dropiValues[code] ?? this.dropiProductValues[code] ?? 0,
      isMain: code === mainCode
    }));

    // Extra products added via the search/slider follow the exact same rule
    // as the main combo's codes: each product's own "Valor con bono" is used
    // when a bono is applied and that extra's package defines one, otherwise
    // its "Valor orden" (falling back to the catalog value) — for every code,
    // not just the extra's own main one. These rows are what represent the
    // extra product in the order — there's no separate "extraItems" list.
    const extraDropiItems = this.orderExtraItems.reduce((acc, item) => {
      const codes = item.dropiCodes || [];
      const extraMainCode = (item.dropiMainCode && codes.includes(item.dropiMainCode)) ? item.dropiMainCode : codes[0];
      const useExtraBonoValues = this.bonoDiscountPercent > 0 && item.bonoFinalPrice != null;
      codes.forEach(code => acc.push({
        code,
        name: this.dropiProductNames[code] || item.title,
        provider: this.dropiProductProviders[code] || '',
        quantity: (item.dropiQuantities?.[code] || 1) * item.quantity,
        value: (useExtraBonoValues ? item.dropiValuesBono?.[code] : undefined) ?? item.dropiValues?.[code] ?? this.dropiProductValues[code] ?? 0,
        isMain: code === extraMainCode
      }));
      return acc;
    }, [] as { code: string; name: string; provider: string; quantity: number; value: number; isMain: boolean }[]);
    const allDropiItems = [...dropiItems, ...extraDropiItems];
    const allProductCodes = [dropiCode, ...this.orderExtraItems.map(i => (i.dropiCodes || []).join(', ')).filter(Boolean)].filter(Boolean).join(', ');
    const allQuantityLabels = [quantityLabel, ...this.orderExtraItems.map(i => `${i.title} x${i.quantity}`)].join(' + ');

    try {
      const orderNumber = await this.generateOrderNumber();

      const order: any = {
        orderNumber,
        'NOMBRES': d.nombre.trim(),
        'APELLIDOS': d.apellido.trim(),
        'DIRECCION': d.direccion.trim(),
        'DEPARTAMENTO': d.departamento,
        'CIUDAD': d.ciudad.trim(),
        'TELEFONO': d.telefono.trim(),
        'ID DE PRODUCTO': allProductCodes,
        'CANTIDAD': allQuantityLabels,
        'PRECIO TOTAL (SIN PUNTOS NI COMAS)': Math.round(this.orderTotal),
        'CON RECAUDO': 'SI',
        'NOTA': d.nota.trim(),
        'EMAIL (NO OBLIGATORIO)': d.email.trim(),
        productTitle: this.currentProduct?.title || this.categoryHeader,
        internalProductId: this.currentProduct?.id || '',
        dropiItems: allDropiItems,
        createdAt: new Date(),
        status: 'nuevo',
        // Lets "Mis pedidos" find this order later; null for guest checkouts.
        userUid: this.auth.currentUser?.uid || null
      };

      if (this.bonoDiscountPercent > 0) {
        order.bono = {
          code: this.bonoCode.trim().toUpperCase(),
          discountPercent: this.bonoDiscountPercent,
          discountAmount: this.orderDiscountAmount,
          extraItemsOnly: this.bonoAppliesToExtrasOnly
        };
      }

      const docRef = await this.firestoreService.create('dropi-orders', order);
      this.lastOrderId = docRef.id;
      this.lastOrderMainCode = mainCode || null;
      this.visProductSuccessful = false;
      this.setupUpsellPromo(mainCode, dropiQuantities[mainCode] || 1);
    } catch (error) {
      console.error('Error saving order', error);
      const toast = await this.toastController.create({
        message: 'Hubo un error al enviar tu pedido. Intenta de nuevo.',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    } finally {
      this.isSubmittingOrder = false;
    }
  }

  goToHome() {
    this.events.publish('blurValue', "blur(0px)");
    this.visProductSuccessful = true;
    this.showUpsellPromo = false;
    this.checkoutData = { nombre: '', apellido: '', telefono: '', direccion: '', departamento: '', ciudad: '', email: '', nota: '' };
    this.citiesForSelectedDepartment = [];
    this.orderExtraItems = [];
    this.addOnSearchTerm = '';
    this.removeBono();
    this.resetInlineRegisterForm();
    this.navCtrl.navigateForward("home");
  }

  private resetInlineRegisterForm() {
    this.regEmail = '';
    this.regPassword = '';
    this.regConfirmPassword = '';
    this.regWhatsapp = '';
    this.regSelectedCategories = [];
    this.registerError = '';
  }

  // ----- Post-purchase upsell: "take another [main product] for a discount" -----
  private setupUpsellPromo(mainCode: string | null, mainQuantity: number) {
    const mainValue = mainCode ? (this.dropiProductValues[mainCode] || 0) : 0;
    if (!mainCode || !mainValue || !this.currentProduct?.promoImageUrl) {
      this.showUpsellPromo = false;
      return;
    }
    this.upsellQuantity = mainQuantity;
    this.upsellUnitPrice = mainValue * 2;
    this.upsellTotalPrice = this.upsellUnitPrice * mainQuantity;
    this.showUpsellPromo = true;
  }

  async acceptUpsellDiscount() {
    if (!this.lastOrderId) {
      this.goToHome();
      return;
    }
    this.isProcessingUpsell = true;
    try {
      const code = this.lastOrderMainCode || '';
      // The accepted upsell is just another dropiItems row (name + provider
      // included, same as every other row) — not a separate "upsell" field.
      await this.firestoreService.update('dropi-orders', this.lastOrderId, {
        dropiItems: arrayUnion({
          code,
          name: this.dropiProductNames[code] || '',
          provider: this.dropiProductProviders[code] || '',
          quantity: this.upsellQuantity,
          value: this.upsellTotalPrice,
          isMain: false
        })
      });
      const toast = await this.toastController.create({
        message: '¡Listo! Agregamos tu descuento al pedido. Te contactaremos para confirmarlo.',
        duration: 3500,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      console.error('Error saving upsell', error);
      const toast = await this.toastController.create({
        message: 'No pudimos agregar el descuento, pero tu pedido original ya quedó registrado.',
        duration: 3500,
        color: 'danger'
      });
      toast.present();
    } finally {
      this.isProcessingUpsell = false;
      this.goToHome();
    }
  }

  declineUpsellDiscount() {
    this.goToHome();
  }
}
