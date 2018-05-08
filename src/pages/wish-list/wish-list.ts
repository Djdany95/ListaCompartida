import { Market } from '@ionic-native/market';
import { EditModal } from './modals/editModal';
import { AddModal } from './modals/addModal';
import { DetailsModal } from './modals/detailsModal';
import { Component, OnInit } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Storage } from '@ionic/storage';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  NavController,
  NavParams,
  Platform,
  ToastController,
  ModalController
} from 'ionic-angular';
import { Wish } from '../../models/wish';
import { ItemsWishProvider } from '../../providers/items/items-wish';
import { SlidesPage } from './../slides/slides';

@Component({
  selector: 'page-wish-list',
  templateUrl: 'wish-list.html'
})
export class WishListPage implements OnInit {
  lista = '';
  pass = '';
  itemsActive: Array<Wish>;
  total: number;
  totalCategorias: Array<number>;
  categorias: Array<string>;
  desktop = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public itemsWishProvider: ItemsWishProvider,
    public plt: Platform,
    public socialSharing: SocialSharing,
    public actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private market: Market
  ) {}

  ngOnInit() {
    if (this.plt.is('core')) {
      this.desktop = true;
    }

    this.storage.get('lista').then(data => {
      if (data !== null) {
        this.lista = data;
        this.getList(this.lista);
        this.storage.get('pass').then(data => {
          if (data !== null) {
            this.getPass(this.lista, data);
          }
        });
      } else {
        this.promptInit();
      }
    });
  }

  promptInit() {
    let prompt = this.alertCtrl.create({
      title: 'Bienvenido',
      subTitle: '¿Quieres crear una lista nueva o conectarte a una ya creada?',
      buttons: [
        {
          text: 'Crear',
          role: 'good',
          handler: data => {
            this.promptCrear();
          }
        },
        {
          text: 'Entrar',
          role: 'good',
          handler: data => {
            this.promptEntrar();
          }
        }
      ]
    });
    prompt.onDidDismiss((data, role) => {
      if (role !== 'good') this.exit();
    });
    prompt.present();
  }

  promptCrear() {
    let prompt = this.alertCtrl.create({
      title: 'Crear',
      message:
        'Para crear una lista introduce el nombre y la contraseña con la que accederás.',
      inputs: [
        {
          name: 'nombre',
          placeholder: 'Nombre',
          type: 'text'
        },
        {
          name: 'pass',
          placeholder: 'Contraseña',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Salir',
          role: 'cancel',
          handler: data => {
            this.promptInit();
          }
        },
        {
          text: 'Crear',
          handler: data => {
            if (data.nombre === '' || data.pass === '') {
              this.showAlertError(
                'Error!',
                'Nombre y contraseña son obligatorios.',
                'init'
              );
            } else if (data.pass.length < 4) {
              this.showAlertError(
                'Error!',
                'La contraseña tiene que tener mínimo 4 caracteres.',
                'init'
              );
            } else {
              this.itemsWishProvider.newList(data.nombre, data.pass).subscribe(
                response => {
                  if (response) {
                    this.showInfoToast('Lista creada!');
                    this.getList(response.data.lista);
                    this.share();
                  }
                },
                error => {
                  this.handleErrors(error);
                }
              );
            }
          }
        }
      ]
    });
    prompt.present();
  }

  promptEntrar() {
    let prompt = this.alertCtrl.create({
      title: 'Acceder',
      message:
        'Para acceder introduce el nombre de la lista.\nSi eres el propietario, también la contraseña.',
      inputs: [
        {
          name: 'lista',
          placeholder: 'Nombre',
          type: 'text',
          value: this.lista
        },
        {
          name: 'pass',
          placeholder: 'Contraseña (Opcional)',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Salir',
          role: 'cancel',
          handler: data => {
            this.promptInit();
          }
        },
        {
          text: 'Entrar',
          handler: data => {
            this.getList(data.lista);
            this.getPass(data.lista, data.pass);
          }
        }
      ]
    });
    prompt.present();
  }

  getList(lista: string) {
    this.itemsActive = [];
    this.total = 0;
    this.totalCategorias = [];
    this.categorias = [];

    let loading = this.loadingCtrl.create({
      content: 'Cargando la lista...'
    });
    loading.present();

    this.itemsWishProvider.getList(lista).subscribe(
      response => {
        if (response) {
          this.lista = lista;
          this.storage.get('lista').then(value => {
            this.storage.set('lista', lista);
          });
          response.data.items.forEach(element => {
            if (this.categorias.indexOf(element.categoria) === -1) {
              this.categorias.push(element.categoria);
              this.totalCategorias.push(element.precio);
            } else {
              this.totalCategorias[
                this.categorias.indexOf(element.categoria)
              ] +=
                element.precio;
            }
            this.itemsActive.push(element);
            this.total += element.precio;
          });
          console.log(this.categorias);
          loading.dismiss();
        }
      },
      error => {
        loading.dismiss();
        this.handleErrors(error);
      }
    );
  }

  getPass(lista: string, pass: string) {
    let loading = this.loadingCtrl.create({
      content: 'Cargando...'
    });
    loading.present();

    this.itemsWishProvider.getPass(lista, pass).subscribe(
      response => {
        if (response.data.lista === lista) {
          this.pass = pass;
          this.showInfoToast('Acceso total concedido.', 1000, 'bottom');
          this.storage.get('pass').then(value => {
            this.storage.set('pass', pass);
          });
          loading.dismiss();
        }
      },
      error => {
        loading.dismiss();
        this.showInfoToast(
          'Contraseña incorrecta, seguirás como invitado.',
          1000,
          'bottom'
        );
      }
    );
  }

  optionsListAS() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Opciones de la Lista',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.promptDelList();
          }
        },
        {
          text: 'Renombrar',
          handler: () => {
            this.promptEditList();
          }
        },
        {
          text: 'Administrar',
          handler: () => {
            this.promptEntrar();
          }
        },
        {
          text: 'Salir',
          handler: () => {
            this.exit();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }

  promptEditList() {
    if (this.pass === '') {
      this.showAlertError(
        'Acceso Denegado',
        'No puedes editar la lista como invitado.'
      );
    } else {
      let prompt = this.alertCtrl.create({
        title: 'Cambiar nombre',
        message: 'Introduce el nuevo nombre de la lista.',
        inputs: [
          {
            name: 'lista',
            placeholder: 'Nombre',
            type: 'text',
            value: this.lista
          },
          {
            name: 'pass',
            placeholder: 'Contraseña',
            type: 'text'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Cambiar',
            handler: data => {
              this.itemsWishProvider
                .editList(this.lista, this.pass, data.lista)
                .subscribe(
                  response => {
                    this.showInfoToast(
                      'Nombre de la lista cambiado!',
                      1000,
                      'top'
                    );
                    this.getList(this.lista);
                  },
                  error => {
                    this.handleErrors(error);
                  }
                );
            }
          }
        ]
      });
      prompt.present();
    }
  }

  promptDelList() {
    if (this.pass === '') {
      this.showAlertError(
        'Acceso Denegado',
        'No puedes borrar la lista como invitado.'
      );
    } else {
      let prompt = this.alertCtrl.create({
        title: 'Eliminar?',
        message: 'Introduce la contraseña para eliminar la lista.',
        inputs: [
          {
            name: 'pass',
            placeholder: 'Contraseña',
            type: 'password'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Eliminar',
            handler: data => {
              if (this.pass === data.pass) {
                this.itemsWishProvider.delList(this.lista, data.pass).subscribe(
                  response => {
                    this.showInfoToast('Lista eliminada!');
                    this.exit();
                  },
                  error => {
                    this.handleErrors(error);
                  }
                );
              } else {
                this.showAlertError('Error!', 'Contraseña incorrecta');
              }
            }
          }
        ]
      });
      prompt.present();
    }
  }

  addItem(
    categoria: string,
    nombre: string,
    precio: number,
    url: string,
    image: string
  ) {
    this.itemsWishProvider
      .addItem(this.lista, this.pass, categoria, nombre, precio, url, image)
      .subscribe(
        response => {
          this.getList(this.lista);
        },
        error => {
          this.handleErrors(error);
        }
      );
  }

  promptAddItem(categoria?: string) {
    if (this.pass === '') {
      this.showAlertError('Acceso Denegado', 'No puedes añadir como invitado.');
    } else {
      let modal = this.modalCtrl.create(
        AddModal,
        { categoria: categoria ? categoria : '' },
        { enableBackdropDismiss: false }
      );
      modal.onDidDismiss(data => {
        if (data !== 'cancel') {
          this.addItem(
            data.categoria,
            data.nombre,
            data.precio,
            data.url,
            data.image
          );
        } else {
          console.log('Clicked cancel.');
        }
      });
      modal.present();
    }
  }

  promptEditItem(item) {
    if (this.pass === '') {
      this.showAlertError('Acceso Denegado', 'No puedes editar como invitado.');
    } else {
      let modal = this.modalCtrl.create(
        EditModal,
        { producto: item },
        { enableBackdropDismiss: false }
      );
      modal.onDidDismiss(data => {
        if (data !== 'cancel') {
          this.itemsWishProvider
            .addItem(
              this.lista,
              this.pass,
              data.categoria,
              data.nombre,
              data.precio,
              data.url,
              data.image
            )
            .subscribe(
              response => {
                this.delItem(item);
              },
              error => {
                this.handleErrors(error);
              }
            );
        } else {
          console.log('Clicked cancel.');
        }
      });
      modal.present();
    }
  }

  promptDetailstItem(item) {
    let modal = this.modalCtrl.create(DetailsModal, { producto: item });
    modal.present();
  }

  delItem(item) {
    if (this.pass === '') {
      this.showAlertError('Acceso Denegado', 'No puedes borrar como invitado.');
    } else {
      this.itemsWishProvider.delItem(this.lista, this.pass, item._id).subscribe(
        response => {
          this.getList(this.lista);
        },
        error => {
          this.handleErrors(error);
        }
      );
    }
  }

  share(item?: Wish) {
    //Pasamos el link de la aplicacion en la url del share() con el plugin del Market
    //Android app Package
    //IOS app id
    console.log(this.market.open('name'));

    if (this.desktop) {
      this.showInfoToast('No se puede compartir desde PC!');
      return;
    } else {
      if (item) {
        this.socialSharing
          .shareWithOptions({
            message:
              item.nombre +
              ' está en mi lista de deseos, puedes mirarla con el nombre:' +
              this.lista,
            files: item.image,
            url: 'http://localhost:8100'
          })
          .then(() => {
            this.showInfoToast('Lista compartida!');
          })
          .catch(err => {
            console.log('Error compartiendo:', err);
          });
      } else {
        this.socialSharing
          .shareWithOptions({
            message: 'Entra en ' + this.lista + ' usando la clave ' + this.pass,
            files: '../../assets/imgs/whatsIMG.png',
            url: 'http://localhost:8100'
          })
          .then(() => {
            this.showInfoToast('Lista compartida!');
          })
          .catch(err => {
            console.log('Error compartiendo:', err);
          });
        /*this.socialSharing
      .canShareVia('Whatsapp')
      .then(() => {
        // Sharing via whatsapp is possible
        this.socialSharing
          .shareViaWhatsApp(
            'Entra en ' + this.lista,
            '../../assets/imgs/whatsIMG.png',
            'http://localhost:8100'
          )
          .then(result => {
            this.showInfoToast('Lista compartida!');
          })
          .catch(err => {
            this.showAlertError('Error!', 'No se puede compartir por whatsapp');
          });
      })
      .catch(() => {
        // Sharing via whatsapp is not possible
        this.showAlertError('Error!', 'No se encuentra whatsapp');
      });*/
      }
    }
  }

  handleErrors(error) {
    if (error != null) {
      console.log(error);
      if (error.status === 500) {
        this.showAlertError(
          'Error!',
          'Una lista con ese nombre y contraseña ya existe.',
          'init'
        );
      } else if (error.status === 404) {
        this.showAlertError('Error!', 'No existe la lista.', 'init');
      } else if (error.status === 0) {
        this.showAlertError('Error!', 'No hay conexión a la red.', 'exit');
      }
    }
  }

  showAlertError(title: string, subTitle: string, init?: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            if (init) {
              if (init === 'init') {
                this.promptInit();
              } else if (init === 'exit') {
                this.exit();
              }
            }
          }
        }
      ]
    });
    alert.present();
  }

  showInfoToast(msg: string, duration?: number, position?: string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: duration ? duration : 1000,
      position: position ? position : 'bottom'
    });

    toast.present();
  }

  deleteStorage() {
    this.storage.get('lista').then(data => {
      if (data !== null) {
        this.storage.remove('lista');
      }
    });
    this.storage.get('pass').then(data => {
      if (data !== null) {
        this.storage.remove('pass');
      }
    });
    this.itemsActive = [];
    this.lista = '';
    this.totalCategorias = [];
    this.categorias = [];
    this.pass = '';
    this.total = 0;
  }

  exit() {
    this.storage.get('skipIntro').then(data => {
      if (data !== null) {
        this.storage.remove('skipIntro');
      }
    });
    this.deleteStorage();
    this.navCtrl.push(SlidesPage);
  }
}
