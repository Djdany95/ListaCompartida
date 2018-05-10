import { DetailsModal } from './../pages/wish-list/modals/detailsModal';
import { EditModal } from './../pages/wish-list/modals/editModal';
import { AddModal } from './../pages/wish-list/modals/addModal';
import { WishListPage } from './../pages/wish-list/wish-list';
import { PipesModule } from './../pipes/pipes.module';
import { SlidesPage } from './../pages/slides/slides';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { ShoppingListPage } from '../pages/shopping-list/shopping-list';
import { TodoListPage } from '../pages/todo-list/todo-list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Market } from '@ionic-native/market';
import { AppRate } from '@ionic-native/app-rate';
import { ItemsShoppingProvider } from '../providers/items/items-shopping';
import { HttpClientModule } from '@angular/common/http';
import { SocialSharing } from '@ionic-native/social-sharing';
import { IonicStorageModule } from '@ionic/storage';
import { ItemsTodoProvider } from '../providers/items/items-todo';
import { ItemsWishProvider } from '../providers/items/items-wish';

@NgModule({
  declarations: [
    MyApp,
    ShoppingListPage,
    TodoListPage,
    WishListPage,
    SlidesPage,
    AddModal,
    EditModal,
    DetailsModal
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HttpClientModule,
    PipesModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ShoppingListPage,
    TodoListPage,
    WishListPage,
    SlidesPage,
    AddModal,
    EditModal,
    DetailsModal
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ItemsShoppingProvider,
    HttpClientModule,
    SocialSharing,
    ItemsTodoProvider,
    ItemsWishProvider,
    Market,
    AppRate
  ]
})
export class AppModule {}
