import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { CategoryService, CategoryItem } from '../../services/category.service';
import { DropiProductService } from '../../services/dropi-product.service';
import { Product, ProductVariant, DropiProduct } from '../../models/product.model';
import { NavController, ToastController, ModalController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import {
  DEFAULT_REFUND_POLICY,
  DEFAULT_TERMS_OF_SERVICE,
  DEFAULT_PRIVACY_POLICY,
  DEFAULT_LEGAL_DISCLAIMER
} from '../../shared/default-legal-content';

const NEW_CATEGORY_OPTION = '__new_category__';

// Alta rápida: imágenes por defecto cuando se rellena el formulario pegando
// solo el nombre + el copy del producto, sin subir fotos todavía.
const QUICK_ADD_NO_PHOTO_IMG = 'https://firebasestorage.googleapis.com/v0/b/bigoff-e8e4d.firebasestorage.app/o/configuraciones%2Fsin-foto.png?alt=media&token=ecf63982-3f9c-4bdc-89b2-c5873f2ca37d';
const QUICK_ADD_SECONDARY_IMG = 'https://firebasestorage.googleapis.com/v0/b/bigoff-e8e4d.firebasestorage.app/o/product-images%2F1789417986583_50OFF4-3.png?alt=media&token=0deda121-2e2b-4b39-872b-5ae35d4799b9';

interface QuickAddParsed {
  text: string;
  description: string;
  specifications: string;
  experience: string;
  materials: string;
  howToUse: string;
  highlightMessage: string;
  comparisonRows: { label: string; ours: string; others: string }[];
  faqs: { question: string; answer: string }[];
  benefits: { icon: string; title: string; text: string }[];
}

type QuickAddSectionKey =
  | 'main' | 'specifications' | 'experience' | 'materials' | 'howToUse'
  | 'benefits' | 'reviewsTitle' | 'comparison' | 'faqs';

// Only lines that look like "<n>. <keyword...>" are treated as top-level
// section headers. Matching on the keyword (not just "\d+\. ") matters
// because the "Cómo usarlo" copy itself contains numbered steps like
// "1. Conecta el tubo..." which must NOT be mistaken for a new section.
const QUICK_ADD_HEADER_PATTERNS: { key: QuickAddSectionKey; regex: RegExp }[] = [
  { key: 'main', regex: /^\s*\d+\.\s*copy\s+principal/i },
  { key: 'specifications', regex: /^\s*\d+\.\s*especificaciones/i },
  { key: 'experience', regex: /^\s*\d+\.\s*experiencia/i },
  { key: 'materials', regex: /^\s*\d+\.\s*materiales/i },
  { key: 'howToUse', regex: /^\s*\d+\.\s*c[oó]mo\s+usar/i },
  { key: 'benefits', regex: /^\s*\d+\..*beneficio/i },
  { key: 'reviewsTitle', regex: /^\s*\d+\..*rese[ñn]a/i },
  { key: 'comparison', regex: /^\s*\d+\.\s*nosotros/i },
  { key: 'faqs', regex: /^\s*\d+\..*pregunta/i },
];

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.page.html',
  styleUrls: ['./create-product.page.scss'],
  standalone:false,
})
export class CreateProductPage implements OnInit {

  @ViewChild('descriptionEditor') descriptionEditorRef: ElementRef<HTMLDivElement>;
  @ViewChild('specsEditor') specsEditorRef: ElementRef<HTMLDivElement>;
  @ViewChild('experienceEditor') experienceEditorRef: ElementRef<HTMLDivElement>;
  @ViewChild('materialsEditor') materialsEditorRef: ElementRef<HTMLDivElement>;
  @ViewChild('howToUseEditor') howToUseEditorRef: ElementRef<HTMLDivElement>;
  @ViewChild('quickAddCopyEditor') quickAddCopyEditorRef: ElementRef<HTMLDivElement>;

  productForm: FormGroup;
  product: Product = {
    img: '',
    imgSlides: [],
    title: '',
    text: '',
    heartVis: false,
    dPrice: '',
    price: '',
    featured: false,
    new: false,
    sale: false,
    description: '',
    category: {
      name: '',
      subcategory: {
        name: '',
        active: true
      },
      active: true
    },
    similarItems: [],
    variants: [] as ProductVariant[]
  };
  isVariantModalOpen = false;
  variantForm: FormGroup;

  categories$: Observable<CategoryItem[]>;
  readonly newCategoryOption = NEW_CATEGORY_OPTION;

  showSuccess = false;
  savedProduct: Product | null = null;

  isEditMode = false;
  productId: string | null = null;
  // Closed by default, both when creating a new product and when editing one.
  openAccordionSections: string[] = [];

  // ----- Alta rápida (pegar nombre + copy y rellenar el formulario) -----
  showQuickAdd = false;
  quickAddName = '';
  // HTML (con negrillas preservadas) capturado del editor enriquecido de "Copy del producto".
  quickAddCopyHtml = '';

  availableColors = [
    { name: 'Blue', value: '#1C197A' },
    { name: 'Purple', value: '#5A197A' },
    { name: 'Brown', value: '#913523' },
    { name: 'Camel', value: '#7A6719' },
    { name: 'Green', value: '#33581A' },
    { name: 'Black', value: '#000000' },
    { name: 'Grey', value: '#7D7D7D' },
    { name: 'Mustard', value: '#AF9306' },
    { name: 'Light Blue', value: '#36BDD9' },
    { name: 'Magenta', value: '#7A197A' },
    { name: 'Dark Purple', value: '#40197A' },
    { name: 'Red', value: '#72000C' }
  ];

  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Small', 'Medium', 'Big'];

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private categoryService: CategoryService,
    private dropiProductService: DropiProductService,
    private navCtrl: NavController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController,
    private alertController: AlertController,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.categories$ = this.categoryService.getActive();
    this.dropiProductService.getAll().subscribe(list => this.dropiProducts = list);

    this.dropiProductForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      value: [0, [Validators.required, Validators.min(0)]],
      provider: ['', Validators.required]
    });

    this.productForm = this.fb.group({
      title: ['', Validators.required],
      text: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      dPrice: [''],
      tags: [[]],
      categoryName: ['', Validators.required],

      subtitle: [''],
      badgeText: ['¡CORRE QUE SE ACABA!'],
      urgencyText: ['Solo por tiempo limitado — hasta 48% OFF'],
      shippingText: ['Envío gratis | Pago contraentrega'],
      ctaText: ['OBTENER OFERTA Y PAGAR AL RECIBIR'],
      ctaBackgroundColor: ['#1faf5a'],
      ctaTextColor: ['#ffffff'],
      ctaHoverColor: ['#6D28D9'],
      deliveryText: ['Entrega 2 a 5 días a todo Colombia'],
      ratingValue: [4.7],
      reviewsCount: [217],

      primaryColor: ['#6D28D9', Validators.required],
      secondaryColor: ['#111111', Validators.required],
      secondaryTextColor: ['#ffffff', Validators.required],
      youtubeUrl: [''],

      priceGroups: this.fb.array([]),
      variants: this.fb.array([]),

      sections: this.fb.group({
        specifications: [''],
        experience: [''],
        materials: [''],
        howToUse: ['']
      }),

      benefits: this.fb.array([]),
      highlightMessage: [''],
      comparisonRows: this.fb.array([]),

      legal: this.fb.group({
        refundPolicy: [DEFAULT_REFUND_POLICY],
        termsOfService: [DEFAULT_TERMS_OF_SERVICE],
        privacyPolicy: [DEFAULT_PRIVACY_POLICY],
        legalDisclaimer: [DEFAULT_LEGAL_DISCLAIMER]
      }),

      seo: this.fb.group({
        metaTitle: ['', Validators.maxLength(70)],
        metaDescription: ['', Validators.maxLength(160)],
        ogImage: ['']
      }),

      faqTitle: ['Pregúntanos lo que quieras'],
      faqSubtitle: ['¿Tienes dudas? Aquí resolvemos las más frecuentes.'],
      faqs: this.fb.array([])
    });

    this.variantForm = this.fb.group({
      color: [''],
      size: [''],
      stock: [0, [Validators.required, Validators.min(0)]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = id;
      this.loadProductForEdit(id);
    }
  }

  async loadProductForEdit(id: string) {
    try {
      const snap = await this.firestoreService.getById<Product>('products', id);
      if (!snap.exists()) {
        const toast = await this.toastController.create({
          message: 'No se encontró el producto',
          duration: 2500,
          color: 'danger'
        });
        await toast.present();
        this.navCtrl.navigateBack('/product-list');
        return;
      }
      this.populateForm(snap.data() as Product);
    } catch (error) {
      console.error(error);
      const toast = await this.toastController.create({
        message: 'Error cargando el producto',
        duration: 2500,
        color: 'danger'
      });
      await toast.present();
    }
  }

  private populateForm(data: Product) {
    this.product = {
      ...this.product,
      ...data,
      id: this.productId,
      category: data.category || this.product.category,
      imgSlides: data.imgSlides || [],
      similarItems: data.similarItems || []
    };

    this.productForm.patchValue({
      title: data.title,
      text: data.text,
      description: data.description || '',
      price: data.price,
      dPrice: data.dPrice,
      tags: [
        ...(data.featured ? ['featured'] : []),
        ...(data.new ? ['new'] : []),
        ...(data.sale ? ['sale'] : [])
      ],
      categoryName: data.category?.name || '',
      subtitle: data.subtitle || '',
      badgeText: data.badgeText || '',
      urgencyText: data.urgencyText || '',
      shippingText: data.shippingText || '',
      ctaText: data.ctaText || 'OBTENER OFERTA Y PAGAR AL RECIBIR',
      ctaBackgroundColor: data.ctaBackgroundColor || '#1faf5a',
      ctaTextColor: data.ctaTextColor || '#ffffff',
      ctaHoverColor: data.ctaHoverColor || '#6D28D9',
      deliveryText: data.deliveryText || '',
      ratingValue: data.ratingValue ?? 4.7,
      reviewsCount: data.reviewsCount ?? 217,
      primaryColor: data.primaryColor || '#6D28D9',
      secondaryColor: data.secondaryColor || '#111111',
      secondaryTextColor: data.secondaryTextColor || '#ffffff',
      youtubeUrl: data.youtubeUrl || '',
      highlightMessage: data.highlightMessage || '',
      faqTitle: data.faqTitle || 'Pregúntanos lo que quieras',
      faqSubtitle: data.faqSubtitle || '¿Tienes dudas? Aquí resolvemos las más frecuentes.'
    });

    (data.priceGroups || []).forEach(group => {
      this.priceGroups.push(this.fb.group({
        text: [group.text, Validators.required],
        price: [group.price, [Validators.required, Validators.min(0)]],
        dprice: [group.dprice, [Validators.required, Validators.min(0)]],
        dropiCodes: [group.dropiCodes || []],
        dropiMainCode: [group.dropiMainCode || null],
        dropiQuantities: [group.dropiQuantities || {}],
        dropiValues: [group.dropiValues || {}],
        bonoFinalPrice: [group.bonoFinalPrice ?? null, [Validators.min(0)]],
        dropiValuesBono: [group.dropiValuesBono || {}]
      }));
    });

    (data.variants || []).forEach(variant => {
      this.variants.push(this.fb.group({
        color: [variant.color],
        colorCode: [variant.colorCode],
        size: [variant.size],
        stock: [variant.stock, [Validators.required, Validators.min(0)]]
      }));
    });

    (data.benefits || []).forEach(benefit => {
      this.benefits.push(this.fb.group({
        icon: [benefit.icon],
        title: [benefit.title, Validators.required],
        text: [benefit.text, Validators.required]
      }));
    });

    (data.comparisonRows || []).forEach(row => {
      this.comparisonRows.push(this.fb.group({
        label: [row.label, Validators.required],
        ours: [row.ours, Validators.required],
        others: [row.others, Validators.required]
      }));
    });

    (data.faqs || []).forEach(faq => {
      this.faqs.push(this.fb.group({
        question: [faq.question, Validators.required],
        answer: [faq.answer, Validators.required]
      }));
    });

    this.productForm.get('sections').patchValue({
      specifications: data.sections?.specifications || '',
      experience: data.sections?.experience || '',
      materials: data.sections?.materials || '',
      howToUse: data.sections?.howToUse || ''
    });

    this.productForm.get('legal').patchValue({
      refundPolicy: data.legal?.refundPolicy || DEFAULT_REFUND_POLICY,
      termsOfService: data.legal?.termsOfService || DEFAULT_TERMS_OF_SERVICE,
      privacyPolicy: data.legal?.privacyPolicy || DEFAULT_PRIVACY_POLICY,
      legalDisclaimer: data.legal?.legalDisclaimer || DEFAULT_LEGAL_DISCLAIMER
    });

    this.productForm.get('seo').patchValue({
      metaTitle: data.seo?.metaTitle || '',
      metaDescription: data.seo?.metaDescription || '',
      ogImage: data.seo?.ogImage || ''
    });

    // Rich contenteditable fields aren't native form controls: hydrate them manually
    // once the view has settled (accordions are all forced open in edit mode above).
    setTimeout(() => {
      if (this.descriptionEditorRef) this.descriptionEditorRef.nativeElement.innerHTML = data.description || '';
      if (this.specsEditorRef) this.specsEditorRef.nativeElement.innerHTML = data.sections?.specifications || '';
      if (this.experienceEditorRef) this.experienceEditorRef.nativeElement.innerHTML = data.sections?.experience || '';
      if (this.materialsEditorRef) this.materialsEditorRef.nativeElement.innerHTML = data.sections?.materials || '';
      if (this.howToUseEditorRef) this.howToUseEditorRef.nativeElement.innerHTML = data.sections?.howToUse || '';
      this.cdr.detectChanges();
    });
  }

  get f() { return this.productForm.controls; }
  get variants() { return this.productForm.get('variants') as FormArray; }
  get priceGroups() { return this.productForm.get('priceGroups') as FormArray; }
  get benefits() { return this.productForm.get('benefits') as FormArray; }
  get comparisonRows() { return this.productForm.get('comparisonRows') as FormArray; }
  get faqs() { return this.productForm.get('faqs') as FormArray; }

  // ----- Category -----
  async onCategoryChange(value: string) {
    if (value === NEW_CATEGORY_OPTION) {
      await this.promptNewCategory();
    }
  }

  async promptNewCategory() {
    const alert = await this.alertController.create({
      header: 'Nueva categoría',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Ej: Salud y Bienestar' }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.f['categoryName'].setValue('');
          }
        },
        {
          text: 'Crear',
          handler: async (data) => {
            const name = (data.name || '').trim();
            if (!name) {
              this.f['categoryName'].setValue('');
              return;
            }
            try {
              await this.categoryService.create(name);
              this.f['categoryName'].setValue(name);
              const toast = await this.toastController.create({
                message: `Categoría "${name}" creada`,
                duration: 2000,
                color: 'success'
              });
              toast.present();
            } catch (error) {
              console.error(error);
              this.f['categoryName'].setValue('');
              const toast = await this.toastController.create({
                message: 'No se pudo crear la categoría',
                duration: 2000,
                color: 'danger'
              });
              toast.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // ----- Price groups (paquetes tipo X1/X2/X3) -----
  addPriceGroup() {
    this.priceGroups.push(this.fb.group({
      text: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      dprice: ['', [Validators.required, Validators.min(0)]],
      dropiCodes: [[]],
      dropiMainCode: [null],
      dropiQuantities: [{}],
      dropiValues: [{}],
      bonoFinalPrice: [null, [Validators.min(0)]],
      dropiValuesBono: [{}]
    }));
  }

  removePriceGroup(index: number) {
    this.priceGroups.removeAt(index);
  }

  // ----- Dropi codes label (shown under the "Asociar producto(s) Dropi" button) -----
  dropiCodesText(index: number): string {
    const codes: string[] = this.priceGroups.at(index).get('dropiCodes').value || [];
    const mainCode: string | null = this.priceGroups.at(index).get('dropiMainCode').value || null;
    const quantities: { [code: string]: number } = this.priceGroups.at(index).get('dropiQuantities').value || {};
    const values: { [code: string]: number } = this.priceGroups.at(index).get('dropiValues').value || {};
    const bonoValues: { [code: string]: number } = this.priceGroups.at(index).get('dropiValuesBono').value || {};
    return codes.map(code => {
      const qty = quantities[code] || 1;
      const val = values[code];
      const bonoVal = bonoValues[code];
      const valText = val !== undefined ? ` ($${val}${bonoVal !== undefined ? ` / bono $${bonoVal}` : ''})` : '';
      return code === mainCode ? `${code} x${qty}${valText} (principal)` : `${code} x${qty}${valText}`;
    }).join(', ');
  }

  // ----- Dropi products picker -----
  // Backed by the "products-dropi" Firestore collection, our own catalog until
  // we have a real integration with the Dropi API.
  dropiProducts: (DropiProduct & { id: string })[] = [];
  isDropiModalOpen = false;
  dropiModalTargetIndex: number | null = null;
  dropiModalSelection: Set<string> = new Set();
  dropiModalMainCode: string | null = null;
  dropiModalQuantities: { [code: string]: number } = {};
  dropiModalValues: { [code: string]: number } = {};
  dropiModalValuesBono: { [code: string]: number } = {};
  dropiSearchTerm = '';
  dropiShowOnlySelected = false;

  dropiProductForm: FormGroup;
  isDropiProductFormOpen = false;
  editingDropiProductId: string | null = null;

  get filteredDropiProducts(): (DropiProduct & { id: string })[] {
    const term = this.dropiSearchTerm.trim().toLowerCase();
    let list = this.dropiProducts;
    if (term) { list = list.filter(p => p.code.toLowerCase().includes(term)); }
    if (this.dropiShowOnlySelected) { list = list.filter(p => this.isDropiSelected(p.code)); }
    return list;
  }

  openDropiModal(index: number) {
    this.dropiModalTargetIndex = index;
    const current: string[] = this.priceGroups.at(index).get('dropiCodes').value || [];
    this.dropiModalSelection = new Set(current);
    this.dropiModalMainCode = this.priceGroups.at(index).get('dropiMainCode').value || null;
    this.dropiModalQuantities = { ...(this.priceGroups.at(index).get('dropiQuantities').value || {}) };
    this.dropiModalValues = { ...(this.priceGroups.at(index).get('dropiValues').value || {}) };
    this.dropiModalValuesBono = { ...(this.priceGroups.at(index).get('dropiValuesBono').value || {}) };
    this.dropiSearchTerm = '';
    this.dropiShowOnlySelected = false;
    this.closeDropiProductForm();
    this.isDropiModalOpen = true;
  }

  closeDropiModal() {
    this.isDropiModalOpen = false;
    this.dropiModalTargetIndex = null;
    this.dropiModalSelection = new Set();
    this.dropiModalMainCode = null;
    this.dropiModalQuantities = {};
    this.dropiModalValues = {};
    this.dropiModalValuesBono = {};
    this.dropiSearchTerm = '';
    this.dropiShowOnlySelected = false;
    this.closeDropiProductForm();
  }

  openAddDropiProduct() {
    this.editingDropiProductId = null;
    this.dropiProductForm.reset({ code: '', name: '', stock: 0, value: 0, provider: '' });
    this.isDropiProductFormOpen = true;
  }

  openEditDropiProduct(product: DropiProduct & { id: string }) {
    this.editingDropiProductId = product.id;
    this.dropiProductForm.reset({
      code: product.code,
      name: product.name,
      stock: product.stock,
      value: product.value,
      provider: product.provider
    });
    this.isDropiProductFormOpen = true;
  }

  closeDropiProductForm() {
    this.isDropiProductFormOpen = false;
    this.editingDropiProductId = null;
  }

  async saveDropiProduct() {
    if (this.dropiProductForm.invalid) { return; }
    const value: DropiProduct = this.dropiProductForm.value;
    try {
      if (this.editingDropiProductId) {
        await this.dropiProductService.update(this.editingDropiProductId, value);
      } else {
        await this.dropiProductService.create(value);
      }
      this.closeDropiProductForm();
    } catch (error) {
      console.error(error);
      const toast = await this.toastController.create({
        message: 'Error guardando el producto Dropi',
        duration: 2500,
        color: 'danger'
      });
      await toast.present();
    }
  }

  isDropiSelected(code: string): boolean {
    return this.dropiModalSelection.has(code);
  }

  toggleDropiSelection(code: string) {
    if (this.dropiModalSelection.has(code)) {
      this.dropiModalSelection.delete(code);
      delete this.dropiModalQuantities[code];
      delete this.dropiModalValues[code];
      delete this.dropiModalValuesBono[code];
      if (this.dropiModalMainCode === code) {
        this.dropiModalMainCode = null;
      }
    } else {
      this.dropiModalSelection.add(code);
      this.dropiModalQuantities[code] = 1;
      this.dropiModalValues[code] = this.dropiCatalogValue(code);
      this.dropiModalValuesBono[code] = this.dropiCatalogValue(code);
      if (!this.dropiModalMainCode) {
        this.dropiModalMainCode = code;
      }
    }
  }

  isDropiMain(code: string): boolean {
    return this.dropiModalMainCode === code;
  }

  setMainDropiCode(code: string) {
    if (!this.dropiModalSelection.has(code)) {
      this.dropiModalSelection.add(code);
      this.dropiModalQuantities[code] = 1;
      this.dropiModalValues[code] = this.dropiCatalogValue(code);
      this.dropiModalValuesBono[code] = this.dropiCatalogValue(code);
    }
    this.dropiModalMainCode = code;
  }

  getDropiQuantity(code: string): number {
    return this.dropiModalQuantities[code] || 1;
  }

  setDropiQuantity(code: string, value: string) {
    const qty = Math.max(1, parseInt(value, 10) || 1);
    this.dropiModalQuantities[code] = qty;
  }

  // ----- Dropi value per product: what each associated product will be
  // reported with when this combo's order is created. Admin sets these so
  // they add up to the combo's final price — nothing here enforces it beyond
  // the live total shown in the modal footer. -----
  private dropiCatalogValue(code: string): number {
    const product = this.dropiProducts.find(p => p.code === code);
    return product ? product.value : 0;
  }

  getDropiValue(code: string): number {
    return this.dropiModalValues[code] ?? this.dropiCatalogValue(code);
  }

  setDropiValue(code: string, value: string) {
    this.dropiModalValues[code] = Math.max(0, parseFloat(value) || 0);
  }

  get dropiModalValuesTotal(): number {
    return [...this.dropiModalSelection].reduce((sum, code) => sum + this.getDropiValue(code), 0);
  }

  get dropiModalComboPrice(): number {
    if (this.dropiModalTargetIndex === null) { return 0; }
    return parseFloat(this.priceGroups.at(this.dropiModalTargetIndex).get('dprice').value) || 0;
  }

  get dropiModalValuesMatchCombo(): boolean {
    return this.dropiModalValuesTotal === this.dropiModalComboPrice;
  }

  // Positive: the sum is short by this much (needs to go up to match).
  // Negative: the sum is over by this much (needs to come down).
  get dropiModalValuesDiff(): number {
    return this.dropiModalComboPrice - this.dropiModalValuesTotal;
  }

  // ----- Dropi value per product when a bono applies -----
  // Only usable once this combo has a "Precio final con bono" set; otherwise
  // there's nothing to split (the field stays locked in the template).
  get dropiModalBonoFinalPrice(): number | null {
    if (this.dropiModalTargetIndex === null) { return null; }
    const raw = this.priceGroups.at(this.dropiModalTargetIndex).get('bonoFinalPrice').value;
    return raw === null || raw === '' || raw === undefined ? null : parseFloat(raw);
  }

  get dropiModalBonoEnabled(): boolean {
    return (this.dropiModalBonoFinalPrice || 0) > 0;
  }

  getDropiValueBono(code: string): number {
    return this.dropiModalValuesBono[code] ?? this.dropiCatalogValue(code);
  }

  setDropiValueBono(code: string, value: string) {
    if (!this.dropiModalBonoEnabled) { return; }
    this.dropiModalValuesBono[code] = Math.max(0, parseFloat(value) || 0);
  }

  get dropiModalValuesBonoTotal(): number {
    return [...this.dropiModalSelection].reduce((sum, code) => sum + this.getDropiValueBono(code), 0);
  }

  get dropiModalComboBonoPrice(): number {
    return this.dropiModalBonoFinalPrice || 0;
  }

  get dropiModalValuesBonoMatchCombo(): boolean {
    return this.dropiModalValuesBonoTotal === this.dropiModalComboBonoPrice;
  }

  get dropiModalValuesBonoDiff(): number {
    return this.dropiModalComboBonoPrice - this.dropiModalValuesBonoTotal;
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  confirmDropiSelection() {
    if (this.dropiModalTargetIndex === null) { return; }
    const codes = [...this.dropiModalSelection];
    const quantities: { [code: string]: number } = {};
    const values: { [code: string]: number } = {};
    const bonoValues: { [code: string]: number } = {};
    const bonoEnabled = this.dropiModalBonoEnabled;
    codes.forEach(code => {
      quantities[code] = this.dropiModalQuantities[code] || 1;
      values[code] = this.getDropiValue(code);
      if (bonoEnabled) {
        bonoValues[code] = this.getDropiValueBono(code);
      }
    });

    const group = this.priceGroups.at(this.dropiModalTargetIndex);
    group.get('dropiCodes').setValue(codes);
    group.get('dropiQuantities').setValue(quantities);
    group.get('dropiValues').setValue(values);
    group.get('dropiValuesBono').setValue(bonoValues);
    group.get('dropiMainCode')
      .setValue(this.dropiModalMainCode && codes.includes(this.dropiModalMainCode) ? this.dropiModalMainCode : null);
    this.closeDropiModal();
  }

  // ----- Benefits -----
  addBenefit() {
    this.benefits.push(this.fb.group({
      icon: ['⭐'],
      title: ['', Validators.required],
      text: ['', Validators.required]
    }));
  }

  removeBenefit(index: number) {
    this.benefits.removeAt(index);
  }

  // ----- Comparison rows -----
  addComparisonRow() {
    this.comparisonRows.push(this.fb.group({
      label: ['', Validators.required],
      ours: ['', Validators.required],
      others: ['', Validators.required]
    }));
  }

  removeComparisonRow(index: number) {
    this.comparisonRows.removeAt(index);
  }

  // ----- FAQ -----
  addFaq() {
    this.faqs.push(this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required]
    }));
  }

  removeFaq(index: number) {
    this.faqs.removeAt(index);
  }

  // ----- Variants (color/size, opcional) -----
  openVariantModal() {
    this.variantForm.reset({ stock: 0 });
    this.isVariantModalOpen = true;
  }

  closeVariantModal() {
    this.isVariantModalOpen = false;
  }

  addVariantFromModal() {
    const color = this.variantForm.value.color;
    const size = this.variantForm.value.size;

    if (!color && !size) {
      this.toastController.create({
        message: 'Please select either a Color or a Size (or both).',
        duration: 2000,
        color: 'warning',
        position: 'top'
      }).then(toast => toast.present());
      return;
    }

    if (this.variantForm.valid) {
      const selectedColorObj = this.availableColors.find(c => c.name === color);
      const colorCode = selectedColorObj ? selectedColorObj.value : '';

      const variantGroup = this.fb.group({
        color: [color],
        colorCode: [colorCode],
        size: [size],
        stock: [this.variantForm.value.stock, [Validators.required, Validators.min(0)]]
      });
      this.variants.push(variantGroup);
      this.closeVariantModal();
    }
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }

  // ----- Rich text fields (description + accordion sections): preserve pasted
  // bold/color/emoji formatting, same behavior for every field that uses them. -----
  onRichInput(event: Event, controlPath: string) {
    const html = (event.target as HTMLElement).innerHTML;
    this.setControlValue(controlPath, html);
  }

  onRichPaste(event: ClipboardEvent, controlPath: string) {
    event.preventDefault();
    const html = event.clipboardData?.getData('text/html');
    const text = event.clipboardData?.getData('text/plain') || '';
    const insert = html ? this.sanitizePastedHtml(html) : this.escapeHtml(text);
    document.execCommand('insertHTML', false, insert);
    this.setControlValue(controlPath, (event.target as HTMLElement).innerHTML);
  }

  markRichTouched(controlPath: string) {
    this.productForm.get(controlPath)?.markAsTouched();
  }

  private setControlValue(controlPath: string, value: string) {
    const control = this.productForm.get(controlPath);
    control?.setValue(value);
    control?.markAsDirty();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }

  private sanitizePastedHtml(html: string): string {
    // Parse with DOMParser (not div.innerHTML=) so nothing is ever attached to a
    // live document: images/scripts/handlers cannot load or fire while we clean up.
    const body = new DOMParser().parseFromString(html, 'text/html').body;

    body.querySelectorAll('script, style, img, iframe, object, embed, form, input, button, link, meta, svg').forEach(el => el.remove());

    body.querySelectorAll<HTMLElement>('*').forEach(el => {
      const style = el.getAttribute('style') || '';
      const keep: string[] = [];
      const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*[^;]+/i);
      const weightMatch = style.match(/(?:^|;)\s*font-weight\s*:\s*[^;]+/i);
      const italicMatch = style.match(/(?:^|;)\s*font-style\s*:\s*[^;]+/i);
      if (colorMatch) keep.push(colorMatch[0].replace(/^;/, '').trim());
      if (weightMatch) keep.push(weightMatch[0].replace(/^;/, '').trim());
      if (italicMatch) keep.push(italicMatch[0].replace(/^;/, '').trim());

      // Strip every attribute (this removes any on* handler regardless of name),
      // then re-add only the safe style properties extracted above.
      Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name));
      if (keep.length) {
        el.setAttribute('style', keep.join('; '));
      }
    });

    return body.innerHTML;
  }

  // ----- Images -----
  removeImgSlide(index: number) {
    this.product.imgSlides.splice(index, 1);
    if (this.product.imgSlides.length > 0) {
      if (!this.product.imgSlides.includes(this.product.img)) {
        this.product.img = this.product.imgSlides[0];
      }
    } else {
      this.product.img = '';
    }
    this.cdr.detectChanges();
  }

  setAsMainImage(slide: string) {
    this.product.img = slide;
    this.cdr.detectChanges();
  }

  moveImgSlide(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= this.product.imgSlides.length) { return; }
    const slides = this.product.imgSlides;
    [slides[index], slides[targetIndex]] = [slides[targetIndex], slides[index]];
    this.cdr.detectChanges();
  }

  onImageUploaded(url: string) {
    this.product.imgSlides.push(url);
    if (this.product.imgSlides.length > 0 && !this.product.img) {
      this.product.img = this.product.imgSlides[0];

    }
    this.cdr.detectChanges();
  }

  // Which column the next upload goes to — picked via the segment control
  // next to the single "Agregar Imagen" button for each section, so there's
  // no longer two separate, easy-to-mix-up upload buttons.
  showcaseUploadTarget: 'col1' | 'col2' = 'col1';
  closingUploadTarget: 'col1' | 'col2' = 'col1';

  onShowcaseImageUploaded(url: string) {
    if (this.showcaseUploadTarget === 'col2') {
      this.product.showcaseImageUrl2 = url;
    } else {
      this.product.showcaseImageUrl = url;
    }
    this.cdr.detectChanges();
  }

  removeShowcaseImage() {
    this.product.showcaseImageUrl = '';
    this.cdr.detectChanges();
  }

  removeShowcaseImage2() {
    this.product.showcaseImageUrl2 = '';
    this.cdr.detectChanges();
  }

  onClosingImageUploaded(url: string) {
    if (this.closingUploadTarget === 'col2') {
      this.product.closingImageUrl2 = url;
    } else {
      this.product.closingImageUrl = url;
    }
    this.cdr.detectChanges();
  }

  removeClosingImage() {
    this.product.closingImageUrl = '';
    this.cdr.detectChanges();
  }

  removeClosingImage2() {
    this.product.closingImageUrl2 = '';
    this.cdr.detectChanges();
  }

  onPromoImageUploaded(url: string) {
    this.product.promoImageUrl = url;
    this.cdr.detectChanges();
  }

  removePromoImage() {
    this.product.promoImageUrl = '';
    this.cdr.detectChanges();
  }

  // ----- Alta rápida -----
  toggleQuickAdd() {
    this.showQuickAdd = !this.showQuickAdd;
  }

  // Rich-paste handlers for the "Copy del producto" editor — same pattern as
  // onRichInput/onRichPaste, but writing to quickAddCopyHtml instead of a form control.
  onQuickAddCopyInput(event: Event) {
    this.quickAddCopyHtml = (event.target as HTMLElement).innerHTML;
  }

  onQuickAddCopyPaste(event: ClipboardEvent) {
    event.preventDefault();
    const html = event.clipboardData?.getData('text/html');
    const text = event.clipboardData?.getData('text/plain') || '';
    const insert = html ? this.sanitizePastedHtml(html) : this.escapeHtml(text);
    document.execCommand('insertHTML', false, insert);
    this.quickAddCopyHtml = (event.target as HTMLElement).innerHTML;
  }

  async applyQuickAdd() {
    const name = this.quickAddName.trim();
    const copyHtml = this.quickAddCopyHtml.trim();

    if (!name && !copyHtml) {
      const toast = await this.toastController.create({
        message: 'Escribe el nombre del producto y/o pega el copy antes de rellenar.',
        duration: 2500,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    // Convierte el HTML pegado (con negrillas) a texto plano con marcadores
    // **negrilla**, para poder reutilizar el mismo parser por secciones.
    const copy = this.htmlToMarkedText(copyHtml);
    const parsed = this.parseQuickAddCopy(copy);

    if (name) {
      this.productForm.patchValue({ title: name });
    }
    this.productForm.patchValue({
      text: parsed.text || name,
      description: parsed.description,
      highlightMessage: parsed.highlightMessage
    });
    this.productForm.get('sections').patchValue({
      specifications: parsed.specifications,
      experience: parsed.experience,
      materials: parsed.materials,
      howToUse: parsed.howToUse
    });

    while (this.comparisonRows.length) { this.comparisonRows.removeAt(0); }
    parsed.comparisonRows.forEach(row => {
      this.comparisonRows.push(this.fb.group({
        label: [row.label, Validators.required],
        ours: [row.ours, Validators.required],
        others: [row.others, Validators.required]
      }));
    });

    while (this.faqs.length) { this.faqs.removeAt(0); }
    parsed.faqs.forEach(faq => {
      this.faqs.push(this.fb.group({
        question: [faq.question, Validators.required],
        answer: [faq.answer, Validators.required]
      }));
    });

    // Si el copy trae una sección de beneficios, se agregan con el ícono
    // (emoji) detectado al inicio de cada uno; si no se detecta ninguno,
    // queda el ícono por defecto (⭐) para que el admin lo corrija a mano.
    while (this.benefits.length) { this.benefits.removeAt(0); }
    parsed.benefits.forEach(benefit => {
      this.benefits.push(this.fb.group({
        icon: [benefit.icon],
        title: [benefit.title, Validators.required],
        text: [benefit.text, Validators.required]
      }));
    });

    // Combos (priceGroups) nunca se crean desde el alta rápida, aunque el
    // copy pegado los mencione — quedan vacíos para que el admin los arme a mano.

    this.product.img = QUICK_ADD_NO_PHOTO_IMG;
    this.product.imgSlides = [QUICK_ADD_NO_PHOTO_IMG];
    this.product.showcaseImageUrl = QUICK_ADD_NO_PHOTO_IMG;
    this.product.showcaseImageUrl2 = QUICK_ADD_SECONDARY_IMG;
    this.product.closingImageUrl = QUICK_ADD_NO_PHOTO_IMG;
    this.product.closingImageUrl2 = QUICK_ADD_SECONDARY_IMG;

    // Los campos contenteditable no son controles de formulario nativos:
    // hidratarlos manualmente igual que hace populateForm() al editar.
    setTimeout(() => {
      if (this.descriptionEditorRef) this.descriptionEditorRef.nativeElement.innerHTML = parsed.description || '';
      if (this.specsEditorRef) this.specsEditorRef.nativeElement.innerHTML = parsed.specifications || '';
      if (this.experienceEditorRef) this.experienceEditorRef.nativeElement.innerHTML = parsed.experience || '';
      if (this.materialsEditorRef) this.materialsEditorRef.nativeElement.innerHTML = parsed.materials || '';
      if (this.howToUseEditorRef) this.howToUseEditorRef.nativeElement.innerHTML = parsed.howToUse || '';
      this.cdr.detectChanges();
    });

    this.openAccordionSections = ['basic', 'category', 'images', 'sections', 'benefits', 'comparison', 'faq'];
    this.showQuickAdd = false;
    this.cdr.detectChanges();

    const toast = await this.toastController.create({
      message: 'Formulario rellenado. Revisa el contenido (íconos de beneficios incluidos), completa precio y categoría, y guarda.',
      duration: 3500,
      color: 'success'
    });
    await toast.present();
  }

  private parseQuickAddCopy(raw: string): QuickAddParsed {
    const result: QuickAddParsed = {
      text: '', description: '', specifications: '', experience: '',
      materials: '', howToUse: '', highlightMessage: '',
      comparisonRows: [], faqs: [], benefits: []
    };
    if (!raw) { return result; }

    const lines = raw.replace(/\r\n/g, '\n').split('\n');
    const matches: { key: QuickAddSectionKey; lineIndex: number }[] = [];
    lines.forEach((line, i) => {
      const hit = QUICK_ADD_HEADER_PATTERNS.find(p => p.regex.test(line));
      if (hit) { matches.push({ key: hit.key, lineIndex: i }); }
    });

    const bodies: { [key in QuickAddSectionKey]?: string } = {};
    matches.forEach((m, idx) => {
      const start = m.lineIndex + 1;
      const end = idx + 1 < matches.length ? matches[idx + 1].lineIndex : lines.length;
      bodies[m.key] = lines.slice(start, end).join('\n').trim();
    });

    if (bodies.main) {
      const blocks = this.quickAddBlocks(bodies.main);
      result.text = this.stripBoldMarkers(blocks[0]?.lines[0] || '');
      result.description = this.quickAddSectionToHtml(bodies.main, true);
    }
    result.specifications = this.quickAddSectionToHtml(bodies.specifications || '', false);
    result.experience = this.quickAddSectionToHtml(bodies.experience || '', false);
    result.materials = this.quickAddSectionToHtml(bodies.materials || '', false);
    result.howToUse = this.quickAddSectionToHtml(bodies.howToUse || '', false);
    result.highlightMessage = this.stripBoldMarkers(bodies.reviewsTitle || '');
    if (bodies.comparison) {
      result.comparisonRows = this.parseQuickAddComparison(bodies.comparison);
    }
    if (bodies.faqs) {
      result.faqs = this.parseQuickAddFaqs(bodies.faqs);
    }
    if (bodies.benefits) {
      result.benefits = this.parseQuickAddBenefits(bodies.benefits);
    }

    return result;
  }

  // Convierte el HTML pegado (sanitizado por sanitizePastedHtml) a texto plano
  // con bloques separados por línea en blanco y negrillas marcadas como
  // **texto**, para que parseQuickAddCopy pueda seguir trabajando sobre texto
  // simple sin importar si el admin escribió a mano o pegó contenido con formato.
  private htmlToMarkedText(html: string): string {
    if (!html) { return ''; }
    const body = new DOMParser().parseFromString(html, 'text/html').body;
    const BLOCK_TAGS = new Set(['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TR']);

    const isBoldEl = (el: HTMLElement): boolean => {
      if (el.tagName === 'B' || el.tagName === 'STRONG') { return true; }
      const weight = el.style?.fontWeight;
      if (!weight) { return false; }
      if (weight === 'bold' || weight === 'bolder') { return true; }
      const numeric = parseInt(weight, 10);
      return !isNaN(numeric) && numeric >= 600;
    };

    let out = '';
    const walk = (node: ChildNode, bold: boolean) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) { out += bold ? this.wrapBold(text) : text; }
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) { return; }
      const el = node as HTMLElement;
      if (el.tagName === 'BR') { out += '\n'; return; }
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') { return; }

      const nowBold = bold || isBoldEl(el);
      if (el.tagName === 'LI') { out += '- '; }

      Array.from(el.childNodes).forEach(child => walk(child, nowBold));

      if (el.tagName === 'TD' || el.tagName === 'TH') {
        out += '\t';
      } else if (BLOCK_TAGS.has(el.tagName)) {
        const hasContent = (el.textContent || '').trim().length > 0;
        out += hasContent ? '\n' : '\n\n';
      }
    };

    Array.from(body.childNodes).forEach(n => walk(n, false));
    return out.replace(/\n{3,}/g, '\n\n').trim();
  }

  private wrapBold(text: string): string {
    if (!text.trim()) { return text; }
    const leading = text.match(/^\s*/)[0];
    const trailing = text.match(/\s*$/)[0];
    const core = text.slice(leading.length, text.length - trailing.length);
    return core ? `${leading}**${core}**${trailing}` : text;
  }

  // Quita los marcadores **negrilla** para los campos de texto plano
  // (inputs simples) donde la negrilla no se puede representar.
  private stripBoldMarkers(text: string): string {
    return text.replace(/\*\*(.+?)\*\*/g, '$1').trim();
  }

  // Detecta un emoji al inicio de la línea (ícono del beneficio) y separa el resto.
  private extractLeadingIcon(line: string): { icon: string; rest: string } {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\p{Extended_Pictographic}(?:\uFE0F)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F)?)*)\s*/u);
    if (match && match[1]) {
      return { icon: match[1], rest: trimmed.slice(match[0].length).trim() };
    }
    return { icon: '', rest: trimmed };
  }

  private quickAddBlocks(body: string): { lines: string[] }[] {
    return body.split(/\n\s*\n/)
      .map(b => b.split('\n').map(l => l.trim()).filter(Boolean))
      .filter(lines => lines.length > 0)
      .map(lines => ({ lines }));
  }

  private quickAddSectionToHtml(body: string, isMainCopy: boolean): string {
    const blocks = this.quickAddBlocks(body);
    if (!blocks.length) { return ''; }

    return blocks.map((block, idx) => {
      const { lines } = block;
      if (idx === 0 && lines.length === 1) {
        return isMainCopy
          ? `<p><strong>${this.quickAddInline(lines[0])}</strong></p>`
          : `<h3><strong>${this.quickAddInline(lines[0])}</strong></h3>`;
      }
      if (lines.length > 1) {
        return `<ul>${lines.map(l => `<li>${this.quickAddInline(l)}</li>`).join('')}</ul>`;
      }
      return `<p>${this.quickAddInline(lines[0])}</p>`;
    }).join('');
  }

  // Escapes HTML then turns **bold** markdown into <strong>.
  private quickAddInline(line: string): string {
    return this.escapeHtml(line).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  // Soporta dos formatos de tabla:
  // - 3 columnas: aspecto | nosotros | ellos (ej. "600 ml automáticos | ✓ | ✕")
  // - 2 columnas: nosotros | ellos, con el ✅/❌ ya incluido en el texto de
  //   cada celda (ej. "✅ Va contigo | ❌ Depende de una ubicación") — el
  //   "aspecto" no viene por separado, así que se deriva quitándole el ícono
  //   a la celda "nosotros".
  // La fila de encabezado de la tabla (ej. "Característica | Nuestro X | Otros Y")
  // se detecta porque, a diferencia de las filas de datos, ninguna de sus
  // celdas trae un ícono tipo ✅/❌/✓ al inicio.
  private parseQuickAddComparison(body: string): { label: string; ours: string; others: string }[] {
    const rows: { label: string; ours: string; others: string }[] = [];
    body.split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
      const parts = line.split(/\t|\||\s{2,}/).map(p => this.stripBoldMarkers(p).trim()).filter(Boolean);

      if (parts.length === 3) {
        const [label, ours, others] = parts;
        if (!this.extractLeadingIcon(ours).icon && !this.extractLeadingIcon(others).icon) { return; }
        rows.push({ label, ours, others });
      } else if (parts.length === 2) {
        const [ours, others] = parts;
        const oursIcon = this.extractLeadingIcon(ours);
        const othersIcon = this.extractLeadingIcon(others);
        if (!oursIcon.icon && !othersIcon.icon) { return; }
        const label = oursIcon.rest || othersIcon.rest || ours;
        rows.push({ label, ours, others });
      }
    });
    return rows;
  }

  private parseQuickAddFaqs(body: string): { question: string; answer: string }[] {
    const faqs: { question: string; answer: string }[] = [];
    const doc = new DOMParser().parseFromString(body, 'text/html');
    doc.body.querySelectorAll('details').forEach(detail => {
      const summary = detail.querySelector('summary');
      const question = this.stripBoldMarkers(summary?.textContent || '');
      const clone = detail.cloneNode(true) as HTMLElement;
      clone.querySelector('summary')?.remove();
      const answer = this.stripBoldMarkers(clone.textContent || '');
      if (question && answer) { faqs.push({ question, answer }); }
    });

    if (faqs.length) { return faqs; }

    // Sin <details>: agrupa cada línea que termina en "?" con las líneas
    // siguientes hasta la próxima pregunta.
    let current: { question: string; answer: string[] } | null = null;
    body.split('\n').map(l => this.stripBoldMarkers(l)).filter(Boolean).forEach(line => {
      if (/\?\s*$/.test(line)) {
        if (current) { faqs.push({ question: current.question, answer: current.answer.join(' ').trim() }); }
        current = { question: line, answer: [] };
      } else if (current) {
        current.answer.push(line);
      }
    });
    if (current) { faqs.push({ question: current.question, answer: current.answer.join(' ').trim() }); }
    return faqs;
  }

  // No agrupa por bloques separados por línea en blanco — esa línea en blanco
  // no siempre sobrevive intacta al pegar HTML (depende de cómo el editor de
  // origen estructura los párrafos). En su lugar usa el ícono como ancla:
  // cada línea que arranca con un emoji abre un beneficio nuevo, y todo lo
  // que sigue (hasta el próximo ícono) es su descripción. Las líneas antes
  // del primer ícono (ej. el subtítulo de la sección) se ignoran.
  private parseQuickAddBenefits(body: string): { icon: string; title: string; text: string }[] {
    const lines = body.split('\n').map(l => this.stripBoldMarkers(l).trim()).filter(Boolean);
    const benefits: { icon: string; title: string; text: string[] }[] = [];

    lines.forEach(line => {
      const { icon, rest: title } = this.extractLeadingIcon(line);
      if (icon) {
        benefits.push({ icon, title, text: [] });
      } else if (benefits.length) {
        benefits[benefits.length - 1].text.push(line);
      }
    });

    return benefits.map(b => ({
      icon: b.icon,
      title: b.title,
      text: b.text.join(' ').trim() || b.title
    }));
  }

  // ----- Save -----
  async validateAndSave() {
    if (this.productForm.invalid) {
      let message = 'Please fill all required fields:';
      if (this.f['title'].invalid) message += '\n- Name';
      if (this.f['text'].invalid) message += '\n- Text (Short Description)';
      if (this.f['description'].invalid) message += '\n- Description';
      if (this.f['price'].invalid) message += '\n- Price';
      if (this.f['categoryName'].invalid) message += '\n- Category Name';
      if (this.f['primaryColor'].invalid || this.f['secondaryColor'].invalid || this.f['secondaryTextColor'].invalid) message += '\n- Colores de marca';

      if (this.variants.invalid) {
         message += '\n- All variants must have stock';
      }
      if (this.priceGroups.invalid) {
        message += '\n- Revisa los paquetes de precio';
      }
      if (this.benefits.invalid) {
        message += '\n- Revisa los beneficios';
      }
      if (this.comparisonRows.invalid) {
        message += '\n- Revisa la comparativa';
      }

      const toast = await this.toastController.create({
        message: message,
        duration: 3000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    if (this.product.imgSlides.length === 0) {
      const toast = await this.toastController.create({
        message: 'Sube al menos una imagen del producto',
        duration: 3000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    await this.saveProduct();
  }

  async saveProduct() {
    const formValue = this.productForm.value;
    this.product.title = formValue.title;
    this.product.text = formValue.text;
    this.product.description = formValue.description;
    this.product.price = formValue.price;
    this.product.dPrice = formValue.dPrice;
    this.product.category.name = formValue.categoryName;
    this.product.featured = formValue.tags.includes('featured');
    this.product.new = formValue.tags.includes('new');
    this.product.sale = formValue.tags.includes('sale');
    this.product.variants = formValue.variants;

    this.product.subtitle = formValue.subtitle;
    this.product.badgeText = formValue.badgeText;
    this.product.urgencyText = formValue.urgencyText;
    this.product.shippingText = formValue.shippingText;
    this.product.ctaText = formValue.ctaText;
    this.product.ctaBackgroundColor = formValue.ctaBackgroundColor;
    this.product.ctaTextColor = formValue.ctaTextColor;
    this.product.ctaHoverColor = formValue.ctaHoverColor;
    this.product.deliveryText = formValue.deliveryText;
    this.product.ratingValue = formValue.ratingValue;
    this.product.reviewsCount = formValue.reviewsCount;
    this.product.primaryColor = formValue.primaryColor;
    this.product.secondaryColor = formValue.secondaryColor;
    this.product.secondaryTextColor = formValue.secondaryTextColor;
    this.product.youtubeUrl = formValue.youtubeUrl;
    this.product.priceGroups = formValue.priceGroups;
    this.product.sections = formValue.sections;
    this.product.benefits = formValue.benefits;
    this.product.highlightMessage = formValue.highlightMessage;
    this.product.comparisonRows = formValue.comparisonRows;
    this.product.faqTitle = formValue.faqTitle;
    this.product.faqSubtitle = formValue.faqSubtitle;
    this.product.faqs = formValue.faqs;
    this.product.legal = formValue.legal;
    this.product.seo = formValue.seo;

    try {
      if (this.isEditMode && this.productId) {
        await this.firestoreService.update('products', this.productId, this.product);
        this.product.id = this.productId;
      } else {
        const docRef = await this.firestoreService.create('products', this.product);
        this.product.id = docRef.id;
      }
      this.savedProduct = { ...this.product };
      this.showSuccess = true;
    } catch (error) {
      const toast = await this.toastController.create({
        message: this.isEditMode ? 'Error guardando los cambios' : 'Error creating product',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      console.error(error);
    }
  }

  get productLink(): string {
    if (!this.savedProduct?.id) { return ''; }
    return `${window.location.origin}/product-detail/${this.savedProduct.id}`;
  }

  async copyProductLink() {
    if (!this.productLink) { return; }
    try {
      await navigator.clipboard.writeText(this.productLink);
      const toast = await this.toastController.create({
        message: 'Link copiado al portapapeles',
        duration: 1800,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error copying link', error);
      const toast = await this.toastController.create({
        message: 'No se pudo copiar el link',
        duration: 1800,
        color: 'danger'
      });
      await toast.present();
    }
  }

  goToProductPreview() {
    this.navCtrl.navigateForward(`/product-detail/${this.savedProduct.id}`, { state: { product: this.savedProduct } });
  }

  goBackToList() {
    this.navCtrl.navigateBack('/product-list');
  }
}
