import { Wish } from './../../../models/wish';
import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

@Component({
  templateUrl: 'detailsModal.html'
})
export class DetailsModal {
  producto: Wish;
  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {
    this.producto = this.params.get('producto');
  }

  dismiss(data: any) {
    this.viewCtrl.dismiss();
  }
}
