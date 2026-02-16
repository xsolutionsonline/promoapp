import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Product, ProductVariant } from '../../models/product.model';
import { NavController, ToastController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.page.html',
  styleUrls: ['./create-product.page.scss'],
  standalone:false,
})
export class CreateProductPage implements OnInit {

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
    private navCtrl: NavController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      text: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      dPrice: [''],
      tags: [[]],
      categoryName: ['', Validators.required],
      variants: this.fb.array([])
    });

    this.variantForm = this.fb.group({
      color: [''],
      size: [''],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get f() { return this.productForm.controls; }
  get variants() { return this.productForm.get('variants') as FormArray; }

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

  onImageUploaded(url: string) {
    this.product.imgSlides.push(url);
    if (this.product.imgSlides.length > 0 && !this.product.img) {
      this.product.img = this.product.imgSlides[0];

    }
    this.cdr.detectChanges();
  }

  async validateAndSave() {
    if (this.productForm.invalid) {
      let message = 'Please fill all required fields:';
      if (this.f['title'].invalid) message += '\n- Name';
      if (this.f['text'].invalid) message += '\n- Text (Short Description)';
      if (this.f['description'].invalid) message += '\n- Description';
      if (this.f['price'].invalid) message += '\n- Price';
      if (this.f['categoryName'].invalid) message += '\n- Category Name';

      // Check variants validity
      if (this.variants.invalid) {
         message += '\n- All variants must have stock';
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

    if (this.variants.length === 0) {
      const toast = await this.toastController.create({
        message: 'Please add at least one variant',
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

    try {
      await this.firestoreService.create('products', this.product);
      const toast = await this.toastController.create({
        message: 'Product created successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      this.navCtrl.back();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error creating product',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      console.error(error);
    }
  }
}
