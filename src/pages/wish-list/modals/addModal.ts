import { Wish } from './../../../models/wish';
import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

@Component({
  templateUrl: 'addModal.html'
})
export class AddModal {
  categoria: string;
  nombre: string;
  precio: number;
  url: string;
  image: string = '';

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {
    this.categoria = this.params.get('categoria');
  }

  dismiss(cancel?: any) {
    if (!cancel) {
      cancel = new Wish(
        this.categoria,
        this.nombre,
        this.precio ? this.precio : 0,
        this.url,
        this.image
      );
    }
    console.log(cancel);
    this.viewCtrl.dismiss(cancel);
  }
}
