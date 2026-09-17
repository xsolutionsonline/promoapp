import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FirestoreService } from './firestore.service';

export interface CategoryItem {
  id?: string;
  text: string;
  img: string;
  active: boolean;
  order?: number;
}

const PLACEHOLDER_IMG = 'assets/images/other/category-header-uno.png';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private firestore: Firestore = inject(Firestore);

  constructor(private firestoreService: FirestoreService) { }

  getActive(): Observable<CategoryItem[]> {
    const categoriesRef = collection(this.firestore, 'category');
    const q = query(categoriesRef, where('active', '==', true));
    return collectionData(q, { idField: 'id' }) as Observable<CategoryItem[]>;
  }

  create(text: string) {
    const category: CategoryItem = {
      text: text.trim(),
      img: PLACEHOLDER_IMG,
      active: true,
      order: 999
    };
    return this.firestoreService.create<CategoryItem>('category', category);
  }
}
