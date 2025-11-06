import { Injectable } from '@angular/core';
import {supabase } from "../supabase.client";

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {

  constructor() {}

  
  async obtenerEspecialidades(): Promise<string[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('especialidad')
      .eq('rol', 'especialista')
      .eq('habilitado', true)
      .eq('verificado', true);

    if (error) {
      console.error('Error obteniendo especialidades:', error.message);
      return [];
    }

    
    const especialidadesLimpias = [...new Set(
      data
        .map(e => e.especialidad?.trim())
        .filter(e => e && e !== '')
    )];

    return especialidadesLimpias;
  }

 
  async obtenerEspecialistasPorEspecialidad(especialidad: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, imagen1, mail')
      .eq('rol', 'especialista')
      .eq('especialidad', especialidad)
      .eq('habilitado', true)
      .eq('verificado', true);

    if (error) {
      console.error('Error obteniendo especialistas:', error.message);
      return [];
    }

    return data;
  }
}
