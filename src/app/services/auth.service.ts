import { Injectable } from '@angular/core';
import { User, SupabaseClient } from '@supabase/supabase-js';
import {supabase } from "../supabase.client";
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

 private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable(); //para exponer el observable
  constructor() {
     supabase.auth.onAuthStateChange((_event, session) => {
      this.userSubject.next(session?.user || null);
    });
  }

  public async logIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

  
    return data.user;
  }

   async logOut() {
    await supabase.auth.signOut();
    this.userSubject.next(null); 
  }

  public async getUserUid(): Promise<string | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user?.id || null;
  }

  public async getUser(): Promise<User | null> {
    
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
    
  }

  async obtenerUsuarioPorUID(uid: string): Promise<any> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("uid", uid)
      .single();

    if (error) throw error;
    return data;
  }


  public getSupabaseInstance(): SupabaseClient {
    return supabase;
  }

  async  signUp(email: string ,password:string){
    const {data, error} = await supabase.auth.signUp({ email, password });
    

    return {data,error};
  }

  async isEmailVerified(): Promise<boolean> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return false;

  
  return !!data.user.email_confirmed_at;
}
}
