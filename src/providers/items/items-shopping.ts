import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ItemsListProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ItemsShoppingProvider {
  public url: string;

  constructor(private _http: HttpClient) {
    this.url = 'http://localhost:3678/shopping/';
  }

  newList(lista: string, pass: string): any {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(
      this.url + 'list/',
      { lista: lista, pass: pass },
      { headers: headers }
    );
  }

  getList(lista: string, pass: string): any {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(
      this.url + 'getlist/',
      { lista: lista, pass: pass },
      { headers: headers }
    );
  }

  addItem(
    lista: string,
    pass: string,
    nombre: string,
    precio: number,
    tachado?: boolean
  ) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(
      this.url + 'item/',
      {
        lista: lista,
        pass: pass,
        tachado: tachado ? tachado : false,
        nombre: nombre,
        precio: precio
      },
      { headers: headers }
    );
  }

  delItem(lista: string, pass: string, itemId: string) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: { lista: lista, pass: pass, itemId: itemId }
    };
    return this._http.delete(this.url + 'item/', httpOptions);
  }

  delList(lista: string, pass: string) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: { lista: lista, pass: pass }
    };
    return this._http.delete(this.url + 'list/', httpOptions);
  }

  editList(listaOld: string, pass: string, listaNew: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(
      this.url + 'renamelist/',
      { listaOld: listaOld, pass: pass, listaNew: listaNew },
      { headers: headers }
    );
  }
}
