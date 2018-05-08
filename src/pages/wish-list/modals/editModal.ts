import { Wish } from './../../../models/wish';
import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

@Component({
  templateUrl: 'editModal.html'
})
export class EditModal {
  producto: Wish;
  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {
    this.producto = this.params.get('producto');
    console.log(this.producto);
  }

  dismiss(data: any) {
    data.precio ? (data.precio = data.precio) : (data.precio = 0);
    this.viewCtrl.dismiss(data);
  }
}
