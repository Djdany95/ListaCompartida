import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the PrioridadesPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'prioridades'
})
export class PrioridadesPipe implements PipeTransform {

  transform(value: number) {
    switch (value) {
      case 1:
      case 2:
      case 3:
      case 4:
        return 'green';
      case 5:
      case 6:
        return 'orange';
      case 7:
      case 8:
        return 'blue';
      case 9:
      case 10:
        return 'red';
    }
  }
}
