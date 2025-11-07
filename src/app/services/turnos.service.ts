import { Injectable } from '@angular/core';
import {supabase } from "../supabase.client";

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  constructor() {}

  
  async crearTurno(turno: any) {
    const { data, error } = await supabase
      .from('turno')
      .insert([turno]);

    if (error) {
      console.error('Error al crear el turno:', error.message);
      throw error;
    }

    return data;
  }

  async obtenerTurnosPaciente(idPaciente: number) {
  const { data, error } = await supabase
    .from('turno')
    .select(`
      id_turno,
      fecha,
      hora,
      estado,
      especialidad,
      id_especialista,
      usuarios!turno_id_especialista_fkey(nombre, apellido)
    `)
    .eq('id_paciente', idPaciente)
    .order('fecha', { ascending: true });

  if (error) {
    console.error('Error obteniendo turnos:', error.message);
    return [];
  }

  return data;
}


async cancelarTurno(idTurno: number) {
  const { error } = await supabase
    .from('turno')
    .update({ estado: 'cancelado' })
    .eq('id_turno', idTurno);

  if (error) throw error;
}

async obtenerTurnosEspecialista(idEspecialista: number) {
  const { data, error } = await supabase
    .from('turno')
    .select(`
      id_turno, fecha, hora, estado, especialidad,
      usuarios!turno_id_paciente_fkey(nombre, apellido, obra_social)
    `)
    .eq('id_especialista', idEspecialista)
    .order('fecha', { ascending: true });

  if (error) throw error;
  return data;
}

  async actualizarEstadoTurno(idTurno: number, nuevoEstado: string, comentario?: string) {
    const updateData: any = { estado: nuevoEstado };
    if (comentario) updateData.comentario_cancelacion = comentario;

    const { error } = await supabase
      .from('turno')
      .update(updateData)
      .eq('id_turno', idTurno);

    if (error) throw error;
  }

}

