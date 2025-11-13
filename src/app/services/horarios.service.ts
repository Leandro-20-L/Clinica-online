import { Injectable } from '@angular/core';
import {supabase } from "../supabase.client";

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  async obtenerPorEspecialista(id_especialista: number) {
    const { data, error } = await supabase
      .from('horarios')
      .select('*')
      .eq('id_especialista', id_especialista);
    if (error) throw error;
    return data;
  }

  async guardarDisponibilidad(id_especialista: number, horarios: any[]) {
    // Elimina los horarios anteriores
    await supabase.from('horarios').delete().eq('id_especialista', id_especialista);
    // Inserta los nuevos
    const { error } = await supabase.from('horarios').insert(horarios);
    if (error) throw error;
  }

  async obtenerEspecialidades(idEspecialista: number) {
  const { data, error } = await supabase
    .from('especialista_especialidad')
    .select('especialidad')
    .eq('id_especialista', idEspecialista);

  if (error) {
    console.error('Error al obtener especialidades:', error);
    return [];
  }

  return data || [];
}
}
