import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaLocal'
})
export class FechaLocalPipe implements PipeTransform {

    transform(
    fecha: string | Date,
    modo: 'fecha' | 'hora' | 'ambos' = 'ambos',
    offsetHoras: number = -3  
  ): string {

    const f = new Date(fecha);

    if (!isNaN(f.getTime())) {
      f.setHours(f.getHours() + offsetHoras); 
    }

    const fechaStr = f.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const horaStr = f.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    if (modo === 'fecha') return fechaStr;
    if (modo === 'hora')  return horaStr;

    return `${fechaStr} ${horaStr}`;
  }


}
