import { createClient } from "@supabase/supabase-js";

// Estas variables las obtendrás del dashboard de Supabase más adelante.
// Para que Vercel y Vite las lean de forma segura, deben empezar con VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicializamos y exportamos el cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
