import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor() {}

 
  async insertar(usuario: any): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .insert([usuario]);

    if (error) throw error;
  }


  async obtenerTodos(): Promise<any[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*');
    if (error) throw error;
    return data || [];
  }

 
  async obtenerPorUID(uid: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('uid', uid)
      .single();

    if (error) return null;
    return data;
  }


  async actualizar(uid: string, cambios: any): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .update(cambios)
      .eq('uid', uid);

    if (error) throw error;
  }

  
  async eliminar(uid: string): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('uid', uid);

    if (error) throw error;
  }

  async subirFoto(ruta: string, foto: Blob): Promise<string> {
  try {
   
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.warn('No se pudo obtener la sesión actual.');
    } else {
      console.log('Sesión activa:', session?.session?.user?.email);
    }

    console.log('Ruta destino:', ruta);
    console.log('Archivo (Blob):', foto);

    const { data, error } = await supabase.storage
      .from('usuarios')
      .upload(ruta, foto, { upsert: true }); //  sobrescribe si ya existe

    if (error) throw error;

    
    const { data: publicData } = supabase.storage
      .from('usuarios')
      .getPublicUrl(ruta);

    const publicUrl = publicData.publicUrl;
    console.log('URL pública generada:', publicUrl);

    return publicUrl;
  } catch (error: any) {
    console.error('Error al subir la imagen:', error.message);
    throw error;
  }
}
}
