import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirestoreService } from './firestore.service';
import { DropiProduct } from '../models/product.model';

const COLLECTION = 'products-dropi';

@Injectable({
  providedIn: 'root'
})
export class DropiProductService {

  constructor(private firestoreService: FirestoreService) { }

  getAll(): Observable<(DropiProduct & { id: string })[]> {
    return this.firestoreService.getAll<DropiProduct>(COLLECTION);
  }

  create(product: DropiProduct) {
    return this.firestoreService.create<DropiProduct>(COLLECTION, product);
  }

  update(id: string, product: DropiProduct) {
    return this.firestoreService.update<DropiProduct>(COLLECTION, id, product);
  }
}
