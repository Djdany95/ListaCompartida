import { AppRate } from '@ionic-native/app-rate';
import { WishListPage } from './../wish-list/wish-list';
import { TodoListPage } from './../todo-list/todo-list';
import { Storage } from '@ionic/storage';
import { ShoppingListPage } from './../shopping-list/shopping-list';
import { Component } from '@angular/core';
import { NavController, ActionSheetController } from 'ionic-angular';

@Component({
  selector: 'page-slides',
  templateUrl: 'slides.html'
})
export class SlidesPage {
  constructor(
    public navCtrl: NavController,
    public storage: Storage,
    public actionSheetCtrl: ActionSheetController,
    public appRate: AppRate
  ) {
    this.appRate.preferences = {
      usesUntilPrompt: 3,
      storeAppURL: {
        ios: '<app_id>',
        android: 'market://details?id=<package_name>',
        windows: 'ms-windows-store://review/?ProductId=<store_id>'
      }
    };

    this.appRate.promptForRating(false);
  }

  goToShoppingList() {
    this.storage.get('skipIntro').then(data => {
      if (data === null) {
        this.storage.set('skipIntro', 'shopping');
      }
    });
    this.navCtrl.push(ShoppingListPage);
  }

  goToTodoList() {
    this.storage.get('skipIntro').then(data => {
      if (data === null) {
        this.storage.set('skipIntro', 'todo');
      }
    });
    this.navCtrl.push(TodoListPage);
  }

  goToWishList() {
    this.storage.get('skipIntro').then(data => {
      if (data === null) {
        this.storage.set('skipIntro', 'wish');
      }
    });
    this.navCtrl.push(WishListPage);
  }

  slides = [
    {
      title: 'Bienvenido a ListasCompartidas!',
      description:
        'Aquí podrás crear <b>listas de la compra</b> y compartirlas con quien y cuantos quieras.',
      image: '../../assets/imgs/ica-slidebox-img-1.png'
    },
    {
      title: 'Cómo empezar?',
      description:
        'Tan simple como ponerle un nombre a la lista y una contraseña para acceder, y ya podrás empezar a añadir cosas y compartir tu lista.',
      image: '../../assets/imgs/ica-slidebox-img-2.png'
    }
  ];

  selectList() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Elige el tipo de lista',
      buttons: [
        {
          text: 'Lista de Compras',
          handler: () => {
            this.goToShoppingList();
          }
        },
        {
          text: 'Lista de Tareas',
          handler: () => {
            this.goToTodoList();
          }
        },
        {
          text: 'Lista de Deseos',
          handler: () => {
            this.goToWishList();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Clicked cancel.');
          }
        }
      ]
    });

    actionSheet.present();
  }

  exit() {
    this.storage.get('skipIntro').then(data => {
      if (data !== null) {
        this.storage.remove('skipIntro');
      }
    });
    this.navCtrl.push(SlidesPage);
  }
}
