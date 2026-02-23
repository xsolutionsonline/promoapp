import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, orderBy, limit, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.page.html',
  styleUrls: ['./thankyou.page.scss'],
  standalone:false,
})
export class ThankyouPage implements OnInit {

  order: any;
  items = 0;
  orderId: string;

  constructor(private firestore: Firestore) { }

  ngOnInit() {
    const uid = localStorage.getItem('user_order_uid');
    if (uid) {
      const ordersCollection = collection(this.firestore, 'orders');
      const q = query(ordersCollection,
        where('userUid', '==', uid),
        limit(1)
      );

      getDocs(q).then(querySnapshot => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          this.order = doc.data();
          this.orderId = doc.id; // Capture the document ID as orderId
          if (this.order.products) {
            this.order.products.forEach(product => {
              if (product.variants) {
                product.variants.forEach(variant => {
                  this.items += variant.quantity;
                });
              }
            });
          }
        }
      });
    }
  }
}
