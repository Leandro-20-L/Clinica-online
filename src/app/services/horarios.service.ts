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
    
    await supabase.from('horarios').delete().eq('id_especialista', id_especialista);
    
    const { error } = await supabase.from('horarios').insert(horarios);
    if (error) throw error;
  }

  
}
