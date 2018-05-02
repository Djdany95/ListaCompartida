import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  itemsActive: Array<{ done: boolean; name: string; price: number }>;
  itemsDone: Array<Item>;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.itemsActive = [];
    this.itemsDone = [];
    for (let i = 1; i < 11; i++) {
      this.itemsActive.push({
        done: false,
        name: 'item' + i,
        price: Math.floor(Math.random() * i * 100)
      });
    }
  }

  moveItem(item) {
    if (item.done === true) {
      this.itemsActive.splice(this.itemsActive.indexOf(item), 1);
      this.itemsDone.push(item);
      this.itemsDone.sort();
    } else {
      this.itemsDone.splice(this.itemsDone.indexOf(item), 1);
      this.itemsActive.push(item);
      this.itemsActive.sort(function(a, b) {
        return a.name.localeCompare(b.name) === 1 ? a : b;
      });
    }
  }
}
