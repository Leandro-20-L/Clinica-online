import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizar'
})
export class CapitalizarPipe implements PipeTransform {

  transform(valor: string): string {
    if (!valor) return '';
    return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
  }

}
