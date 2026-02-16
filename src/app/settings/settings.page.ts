import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Configuration } from '../models/configuration.model';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone:false,
})
export class SettingsPage implements OnInit {

  configurations$: Observable<Configuration[]>;

  constructor(
    private firestoreService: FirestoreService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.configurations$ = this.firestoreService.getAll<Configuration>('configurations');
  }

  onItemClick(config: Configuration) {
    if (config.name && (config.name.toLowerCase().trim() === 'crear producto' || config.name.toLowerCase().trim() === 'create product')) {
      this.navCtrl.navigateForward('/create-product');
    }
  }

  onStatusChange(event: any, config: Configuration) {
    const newStatus = event.detail.checked;
    this.firestoreService.update('configurations', config.id, { status: newStatus });
  }

}
