import { createContext } from "react";
import { User } from "@supabase/supabase-js";

// Definir el tipo del contexto de autenticación
interface AuthContextType {
    user: User | null;
    isAuthChecked: boolean;
    // setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Crear y exportar el contexto
export const AuthContext = createContext<AuthContextType | null>(null);
