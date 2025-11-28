import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ocultarParcial'
})
export class OcultarParcialPipe implements PipeTransform {

  transform(valor: string, visibles: number = 4): string {
    if (!valor) return '';
    const ocultos = valor.length - visibles;
    return '*'.repeat(Math.max(0, ocultos)) + valor.slice(-visibles);
  }

}
