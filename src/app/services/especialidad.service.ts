import { Injectable } from '@angular/core';
import {supabase } from "../supabase.client";

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {

  constructor() {}

  
   async obtenerEspecialidades(): Promise<string[]> {
    const { data, error } = await supabase
      .from('especialista_especialidad')
      .select('especialidad');

    if (error) {
      console.error('Error al obtener especialidades:', error);
      return [];
    }

    // Elimina duplicados y devuelve solo nombres únicos
    const especialidadesUnicas = Array.from(
      new Set(data.map((row: any) => row.especialidad))
    );
    return especialidadesUnicas;
  }

 
   async obtenerEspecialistasPorEspecialidad(especialidad: string) {
    // Primero obtenemos todos los IDs de especialistas que tienen esa especialidad
    const { data: relaciones, error: err1 } = await supabase
      .from('especialista_especialidad')
      .select('id_especialista')
      .eq('especialidad', especialidad);

    if (err1 || !relaciones?.length) {
      console.error('Error al obtener relaciones o no hay especialistas:', err1);
      return [];
    }

    // Luego obtenemos los usuarios con esos IDs
    const ids = relaciones.map((r: any) => r.id_especialista);
    const { data: especialistas, error: err2 } = await supabase
      .from('usuarios')
      .select('*')
      .in('id', ids)
      .eq('rol', 'especialista')
      .eq('habilitado', true);

    if (err2) {
      console.error('Error al obtener especialistas:', err2);
      return [];
    }

    return especialistas;
  }

  async obtenerTodosLosEspecialistas() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('rol', 'especialista')
    .eq('habilitado', true);

  if (error) {
    console.error('Error al obtener especialistas:', error);
    return [];
  }

  return data;
}

async obtenerEspecialidadesDeEspecialista(idEspecialista: number) {
  const { data, error } = await supabase
    .from('especialista_especialidad')
    .select('especialidad')
    .eq('id_especialista', idEspecialista);

  if (error) {
    console.error('Error al obtener especialidades del especialista:', error);
    return [];
  }

  return data.map((e: any) => e.especialidad);
}
}
