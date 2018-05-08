export class Todo {
  constructor(
    public tachado: boolean,
    public nombre: string,
    public prioridad: number,
    public _id?: string,
  ) {}
}
