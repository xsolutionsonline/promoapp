import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, query, where, orderBy, limit, getDocs } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.page.html',
  styleUrls: ['./thankyou.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
})
export class ThankyouPage implements OnInit {

  order: any;
  items = 0;
  orderId: string;

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  constructor() { }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const ordersCollection = collection(this.firestore, 'orders');
        const q = query(ordersCollection,
          where('userUid', '==', user.uid),
          where('status', '==', 'confirmed'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        getDocs(q).then(querySnapshot => {
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            this.order = doc.data();
            this.orderId = doc.id;
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
    });
  }
}
