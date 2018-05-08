export class Wish {
  constructor(
    public categoria: string,
    public nombre: string,
    public precio: number,
    public url: string,
    public image?: string,
    public _id?: string,
  ) {}
}
