import { SlidesPage } from './../slides/slides';
import { Component, OnInit } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';

import {
  NavController,
  NavParams,
  AlertController,
  Platform,
  ActionSheetController,
  ToastController
} from 'ionic-angular';
import { Item } from '../../models/item';
import { ItemsListProvider } from '../../providers/items-list/items-list';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage implements OnInit {
  lista = '';
  pass = '';
  itemsActive: Array<Item>;
  itemsDone: Array<Item>;
  totalGastado = 0;
  totalActivos = 0;
  gastado = true;
  desktop = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public itemsListProvider: ItemsListProvider,
    public plt: Platform,
    public socialSharing: SocialSharing,
    public actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private storage: Storage
  ) {}

  ngOnInit() {
    if (this.plt.is('core')) {
      this.desktop = true;
    }
    this.storage.get('pass').then(data => {
      if (data !== null) {
        this.getList(data);
      } else {
        this.promptInit();
      }
    });
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
            this.itemsActive = [];
            this.itemsDone = [];
            this.totalGastado = 0;
            this.totalActivos = 0;
            this.lista = '';
            this.storage.get('pass').then(data => {
              if (data !== null) {
                this.storage.remove('pass');
              }
            });
            this.promptInit();
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

  getList(pass: string) {
    this.itemsActive = [];
    this.itemsDone = [];
    this.totalGastado = 0;
    this.totalActivos = 0;
    this.lista = '';
    this.itemsListProvider.getList(pass).subscribe(
      response => {
        if (response) {
          this.lista = response.data.lista;
          this.pass = pass;
          this.storage.get('pass').then(value => {
            this.storage.set('pass', pass);
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
        }
      },
      error => {
        this.handleErrors(error);
      }
    );
  }

  promptInit() {
    let prompt = this.alertCtrl.create({
      title: 'Bienvenido',
      subTitle: '¿Quieres crear una lista nueva o conectarte a una ya creada?',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Crear',
          handler: data => {
            this.promptCrear();
          }
        },
        {
          text: 'Entrar',
          handler: data => {
            this.promptEntrar();
          }
        }
      ]
    });
    prompt.present();
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
            this.itemsListProvider.editList(this.pass, data.lista).subscribe(
              response => {
                this.showInfoToast('Nombre de la lista cambiado!', 1000, 'top');
                this.getList(this.pass);
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
              this.itemsListProvider.delList(data.pass).subscribe(
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
              this.itemsListProvider.newList(data.nombre, data.pass).subscribe(
                response => {
                  if (response) {
                    this.showInfoToast('Lista creada!');
                    this.getList(response.data.pass);
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
      message: 'Para acceder introduce la contraseña de la lista.',
      inputs: [
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
              this.getList(data.pass);
            }
          }
        }
      ]
    });
    prompt.present();
  }

  editItem(e, item) {
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
              this.itemsListProvider
                .addItem(this.pass, data.nombre, data.precio)
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

  moveItem(item) {
    const tachado = !item.tachado;
    const precio = item.precio;
    const nombre = item.nombre;
    this.itemsListProvider.delItem(this.pass, item._id).subscribe(
      response => {
        this.itemsListProvider
          .addItem(this.pass, nombre, precio, tachado)
          .subscribe(
            response => {
              this.getList(this.pass);
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

  delItem(item) {
    console.log(item._id);
    this.itemsListProvider.delItem(this.pass, item._id).subscribe(
      response => {
        this.getList(this.pass);
      },
      error => {
        this.handleErrors(error);
      }
    );
  }

  promptItem() {
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

  addItem(nombre: string, precio: number, tachado?: boolean) {
    this.itemsListProvider
      .addItem(this.pass, nombre, precio, tachado ? tachado : false)
      .subscribe(
        response => {
          this.getList(this.pass);
        },
        error => {
          this.handleErrors(error);
        }
      );
  }

  share() {
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
        this.showAlertError('Error!', 'Una lista con esa contraseña ya existe.', 'init');
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

  exit() {
    this.storage.get('skipIntro').then(data => {
      if (data !== null) {
        this.storage.remove('skipIntro');
      }
    });
    this.storage.get('pass').then(data => {
      if (data !== null) {
        this.storage.remove('pass');
      }
    });
    this.navCtrl.push(SlidesPage);
  }
}
