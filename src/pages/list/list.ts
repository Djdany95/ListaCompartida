import { Component, OnInit } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';

import {
  NavController,
  NavParams,
  AlertController,
  Platform
} from 'ionic-angular';
import { Item } from '../../models/item';
import { ItemsListProvider } from '../../providers/items-list/items-list';
//import { Storage } from '@ionic/storage';

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
    public socialSharing: SocialSharing //private storage: Storage
  ) {}

  ngOnInit() {
    if (this.plt.is('core')) {
      this.desktop = true;
    }

    this.promptInit();
  }

  getList(pass: string) {
    this.itemsActive = [];
    this.itemsDone = [];
    this.totalGastado = 0;
    this.totalActivos = 0;
    this.itemsListProvider.getList(pass).subscribe(
      response => {
        if (response) {
          this.lista = response.data.lista;
          this.pass = pass;
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

  editList(e) {
    console.log('cambiar nombre');
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
            //Ir a otro sitio, se salio de la app sin entrar
            console.log('Cambiar de pantalla, se salio de la app sin entrar');
          }
        },
        {
          text: 'Crear',
          handler: data => {
            this.itemsListProvider.newList(data.nombre, data.pass).subscribe(
              response => {
                if (response) {
                  this.getList(response.data.pass);
                }
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
            //Ir a otro sitio, se salio de la app sin entrar
            console.log('Cambiar de pantalla, se salio de la app sin entrar');
          }
        },
        {
          text: 'Entrar',
          handler: data => {
            this.getList(data.pass);
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
      console.log('No se puede compartir en PC');
      return;
    }

    this.socialSharing
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
            this.showAlertError('BIEN!', result);
          })
          .catch(err => {
            this.showAlertError('Error!', 'No se puede compartir por whatsapp');
          });
      })
      .catch(() => {
        // Sharing via whatsapp is not possible
        this.showAlertError('Error!', 'No se encuentra whatsapp');
      });
  }

  handleErrors(error) {
    if (error != null) {
      console.log(error);
      if (error.status === 500) {
        this.showAlertError('Error!', 'La contraseña ya existe.');
      } else if (error.status === 404) {
        this.showAlertError('Error!', 'No existe la lista.');
      } else if (error.status === 0) {
        this.showAlertError('Error!', 'No hay conexión a la red.');
      }
    }
  }

  showAlertError(title: string, subTitle: string, button?: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: button ? button : 'OK',
          handler: data => {
            this.promptInit();
          }
        }
      ]
    });
    alert.present();
  }
}
