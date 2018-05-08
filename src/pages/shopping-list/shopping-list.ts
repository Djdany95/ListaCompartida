import { Market } from '@ionic-native/market';
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
  ToastController
} from 'ionic-angular';
import { Shopping } from '../../models/shopping';
import { ItemsShoppingProvider } from '../../providers/items/items-shopping';
import { SlidesPage } from './../slides/slides';

@Component({
  selector: 'page-shopping-list',
  templateUrl: 'shopping-list.html'
})
export class ShoppingListPage implements OnInit {
  lista = '';
  pass = '';
  itemsActive: Array<Shopping>;
  itemsDone: Array<Shopping>;
  totalGastado = 0;
  totalActivos = 0;
  // Se usa en la vista
  gastado = true;
  desktop = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public itemsShoppingProvider: ItemsShoppingProvider,
    public plt: Platform,
    public socialSharing: SocialSharing,
    public actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    private market: Market
  ) {}

  ngOnInit() {
    if (this.plt.is('core')) {
      this.desktop = true;
    }

    this.storage.get('lista').then(data => {
      if (data !== null) {
        this.lista = data;
        this.storage.get('pass').then(data => {
          if (data !== null) {
            this.pass = data;
            this.getList(this.lista, this.pass);
          } else {
            this.promptInit();
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
        'Para crear una lista introduce el nombre y la contraseña con la que se accederá.',
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
              this.itemsShoppingProvider
                .newList(data.nombre, data.pass)
                .subscribe(
                  response => {
                    if (response) {
                      this.showInfoToast('Lista creada!');
                      this.getList(response.data.lista, response.data.pass);
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
      message: 'Para acceder introduce el nombre y la contraseña de la lista.',
      inputs: [
        {
          name: 'lista',
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
          text: 'Entrar',
          handler: data => {
            if (data.pass.length < 4) {
              this.showAlertError(
                'Error!',
                'La contraseña tiene que tener mínimo 4 caracteres.',
                'init'
              );
            } else {
              this.getList(data.lista, data.pass);
            }
          }
        }
      ]
    });
    prompt.present();
  }

  getList(lista: string, pass: string) {
    this.itemsActive = [];
    this.itemsDone = [];
    this.totalGastado = 0;
    this.totalActivos = 0;

    let loading = this.loadingCtrl.create({
      content: 'Cargando la lista...'
    });
    loading.present();

    this.itemsShoppingProvider.getList(lista, pass).subscribe(
      response => {
        if (response) {
          this.lista = lista;
          this.pass = pass;
          this.storage.get('pass').then(value => {
            this.storage.set('pass', pass);
          });
          this.storage.get('lista').then(value => {
            this.storage.set('lista', lista);
          });
          response.data.items.forEach(element => {
            if (element.tachado === false) {
              this.itemsActive.push(element);
              this.totalActivos += element.precio;
            } else {
              this.itemsDone.push(element);
              this.totalGastado += element.precio;
            }
          });
          loading.dismiss();
        }
      },
      error => {
        loading.dismiss();
        this.handleErrors(error);
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
    let prompt = this.alertCtrl.create({
      title: 'Cambiar nombre',
      message: 'Introduce el nuevo nombre de la lista.',
      inputs: [
        {
          name: 'lista',
          placeholder: 'Nombre',
          type: 'text',
          value: this.lista
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
            this.itemsShoppingProvider
              .editList(this.lista, this.pass, data.lista)
              .subscribe(
                response => {
                  this.showInfoToast(
                    'Nombre de la lista cambiado!',
                    1000,
                    'top'
                  );
                  this.getList(this.lista, this.pass);
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

  promptDelList() {
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
              this.itemsShoppingProvider
                .delList(this.lista, data.pass)
                .subscribe(
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

  addItem(nombre: string, precio: number, tachado?: boolean) {
    this.itemsShoppingProvider
      .addItem(this.lista, this.pass, nombre, precio, tachado ? tachado : false)
      .subscribe(
        response => {
          this.getList(this.lista, this.pass);
        },
        error => {
          this.handleErrors(error);
        }
      );
  }

  promptAddItem() {
    let prompt = this.alertCtrl.create({
      title: 'Añadir',
      message: 'Que añadimos?',
      inputs: [
        {
          name: 'nombre',
          placeholder: 'Nombre',
          type: 'text'
        },
        {
          name: 'precio',
          placeholder: 'Precio',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Añadir',
          handler: data => {
            if (data.nombre === '' || data.precio === '') {
              this.showAlertError(
                'Error!',
                'Nombre y precio son obligatorios.'
              );
            } else {
              this.addItem(data.nombre, data.precio);
            }
          }
        }
      ]
    });
    prompt.present();
  }

  editItem(item) {
    let prompt = this.alertCtrl.create({
      title: 'Editar',
      message: 'Editar ' + item.nombre + '?',
      inputs: [
        {
          name: 'nombre',
          placeholder: 'Nombre',
          value: item.nombre,
          type: 'text'
        },
        {
          name: 'precio',
          placeholder: 'Precio',
          value: item.precio,
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Editar',
          handler: data => {
            if (data.nombre === '' || data.precio === '') {
              this.showAlertError(
                'Error!',
                'Nombre y precio son obligatorios.'
              );
            } else {
              this.itemsShoppingProvider
                .addItem(this.lista, this.pass, data.nombre, data.precio)
                .subscribe(
                  response => {
                    this.delItem(item);
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

  delItem(item) {
    this.itemsShoppingProvider
      .delItem(this.lista, this.pass, item._id)
      .subscribe(
        response => {
          this.getList(this.lista, this.pass);
        },
        error => {
          this.handleErrors(error);
        }
      );
  }

  moveItem(item) {
    const tachado = !item.tachado;
    const precio = item.precio;
    const nombre = item.nombre;
    this.itemsShoppingProvider
      .delItem(this.lista, this.pass, item._id)
      .subscribe(
        response => {
          this.itemsShoppingProvider
            .addItem(this.lista, this.pass, nombre, precio, tachado)
            .subscribe(
              response => {
                this.getList(this.lista, this.pass);
              },
              error => {
                this.handleErrors(error);
              }
            );
        },
        error => {
          this.handleErrors(error);
        }
      );
  }

  share() {
    //Pasamos el link de la aplicacion en la url del share() con el plugin del Market
    //Android app Package
    //IOS app id
    console.log(this.market.open('name'));

    if (this.desktop) {
      this.showInfoToast('No se puede compartir desde PC!');
      return;
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
    this.itemsDone = [];
    this.totalGastado = 0;
    this.totalActivos = 0;
    this.lista = '';
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
