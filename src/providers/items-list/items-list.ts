import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ItemsListProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ItemsListProvider {
  public url: string;

  constructor(private _http: HttpClient) {
    this.url = 'PRIVATE';
  }

  newList(lista: string, pass: string): any {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(
      this.url + 'list/',
      { lista: lista, pass: pass },
      { headers: headers }
    );
  }

  getList(pass: string): any {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(
      this.url + 'getlist/',
      { pass: pass },
      { headers: headers }
    );
  }

  addItem(pass: string, nombre: string, precio: number, tachado?: boolean) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(
      this.url + 'item/',
      {
        pass: pass,
        tachado: tachado ? tachado : false,
        nombre: nombre,
        precio: precio
      },
      { headers: headers }
    );
  }

  delItem(pass: string, itemId: string) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: { pass: pass, itemId: itemId }
    };
    return this._http.delete(this.url + 'item/', httpOptions);
  }

  delList(pass: string) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: { pass: pass }
    };
    return this._http.delete(this.url + 'list/', httpOptions);
  }

  editList(pass: string, lista: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(
      this.url + 'renamelist/',
      { pass: pass, lista: lista },
      { headers: headers }
    );
  }
}
