import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';
import { switchMap, take, map } from 'rxjs/operators';
import { from, of } from 'rxjs';

// Blocks the admin area (settings, create-product, product-list, orders)
// unless the signed-in user's customers/{uid} doc has role: 'admin'.
// To promote someone to admin today: open Firestore console and set
// role: 'admin' on their document in the "customers" collection.
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);
  const toastController = inject(ToastController);

  return authState(auth).pipe(
    take(1),
    switchMap(user => {
      if (!user) {
        return of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
      }

      const customerDocRef = doc(firestore, `customers/${user.uid}`);
      return from(getDoc(customerDocRef)).pipe(
        map(snap => {
          const role = snap.exists() ? (snap.data() as any).role : null;
          if (role === 'admin') {
            return true;
          }
          toastController.create({
            message: 'No tienes permisos para acceder a esta sección.',
            duration: 2500,
            color: 'danger'
          }).then(toast => toast.present());
          return router.createUrlTree(['/home']);
        })
      );
    })
  );
};
