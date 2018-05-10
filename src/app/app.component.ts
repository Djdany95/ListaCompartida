import { WishListPage } from './../pages/wish-list/wish-list';
import { Component, ViewChild } from '@angular/core';

import { Platform, Nav } from 'ionic-angular';

import { ShoppingListPage } from '../pages/shopping-list/shopping-list';
import { TodoListPage } from '../pages/todo-list/todo-list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SlidesPage } from '../pages/slides/slides';
import { Storage } from '@ionic/storage';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private storage: Storage
  ) {
    this.storage.get('skipIntro').then(data => {
      if (data != null) {
        if (data === 'shopping') {
          this.rootPage = ShoppingListPage;
        } else if (data === 'todo') {
          this.rootPage = TodoListPage;
        } else if (data === 'wish') {
          console.log(data);
          this.rootPage = WishListPage;
        }
      } else {
        this.rootPage = SlidesPage;
      }
    });

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.show();
    });
  }
}
