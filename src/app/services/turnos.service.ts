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
      id_paciente,
      id_especialista,
      especialidad,
      fecha,
      hora,
      estado,
      comentario_cancelacion,
      resena,
      calificacion,
      completo_encuesta,
      usuarios:usuarios!turno_id_especialista_fkey (nombre, apellido)
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
      id_turno,id_paciente,id_especialista, fecha, hora, estado, especialidad,comentario_cancelacion,resena,
      usuarios!turno_id_paciente_fkey(id,nombre, apellido, obra_social)
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

  actualizarTurno(id_turno: number, campos: any) {
  return supabase
    .from('turno')
    .update(campos)
    .eq('id_turno', id_turno);
}

async guardarHistoriaClinica(historia: any) {
  const { data, error } = await supabase
    .from('historia_clinica')
    .insert(historia);

  if (error) throw error;

  return data;
}

async obtenerPacientesDeEspecialista(idEspecialista: number) {
  const { data, error } = await supabase
    .from('turno')
    .select(`
      id_paciente,
      usuarios:usuarios!turno_id_paciente_fkey(id, nombre, apellido, imagen1)
    `)
    .eq('id_especialista', idEspecialista)
    .eq('estado', 'realizado');

  if (error) throw error;

  
  const mapa = new Map();
  data.forEach(t => mapa.set(t.id_paciente, t.usuarios));
  return Array.from(mapa.values());
}

async obtenerHistoriasClinicasPaciente(idPaciente: number) {
  const { data, error } = await supabase
    .from('historia_clinica')
    .select(`
      *,
      turno!inner(
        fecha,
        hora,
        especialidad
      )
    `)
    .eq('id_paciente', idPaciente)
    .order('id_historia', { ascending: false });

  if (error) throw error;

  return data;
}

async obtenerPacientePorId(id: number) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener paciente:', error);
    return null;
  }

  return data;
}

}

