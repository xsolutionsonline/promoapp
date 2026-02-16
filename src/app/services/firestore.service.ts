import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, doc, updateDoc, deleteDoc, getDoc, setDoc, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore: Firestore = inject(Firestore);

  constructor() { }

  create<T>(collectionName: string, data: T) {
    const dataCollection = collection(this.firestore, collectionName);
    return addDoc(dataCollection, data);
  }

  createWithId<T>(collectionName: string, id: string, data: T) {
    const docRef = doc(this.firestore, `${collectionName}/${id}`);
    return setDoc(docRef, data);
  }

  getAll<T>(collectionName: string) {
    const dataCollection = collection(this.firestore, collectionName);
    return collectionData(dataCollection, { idField: 'id' }) as Observable<T[]>;
  }

  getById<T>(collectionName: string, id: string) {
    const docRef = doc(this.firestore, `${collectionName}/${id}`);
    return getDoc(docRef);
  }

  getByAttribute<T>(collectionName: string, attribute: string, value: string) {
    const dataCollection = collection(this.firestore, collectionName);
    const q = query(dataCollection, where(attribute, '==', value));
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  async findDocByAttribute<T>(collectionName: string, attribute: string, value: string) {
    const dataCollection = collection(this.firestore, collectionName);
    const q = query(dataCollection, where(attribute, '==', value));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0]; // Devuelve el primer documento encontrado
    }
    return null;
  }

  update<T>(collectionName: string, id: string, data: T) {
    const docRef = doc(this.firestore, `${collectionName}/${id}`);
    return updateDoc(docRef, data as { [key: string]: any });
  }

  delete(collectionName: string, id: string) {
    const docRef = doc(this.firestore, `${collectionName}/${id}`);
    return deleteDoc(docRef);
  }
}
