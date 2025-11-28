import { Injectable } from '@angular/core';
import {supabase } from "../supabase.client";

@Injectable({
  providedIn: 'root'
})
export class LogsService {

 async registrarIngreso(idUsuario: number) {
    const fecha = new Date();
    
    const { error } = await supabase
      .from('log_ingresos')
      .insert({
        id_usuario: idUsuario,
        fecha: fecha.toISOString().split('T')[0],
        hora: fecha.toTimeString().split(' ')[0],
        fecha_hora: fecha
      });

    if (error) throw error;
  }

   async obtenerLogIngresos() {
    const { data, error } = await supabase
      .from('log_ingresos')
      .select('id_usuario, fecha_hora')
      .order('fecha_hora', { ascending: false });

    if (error) throw error;
    return data; 
  }
}
