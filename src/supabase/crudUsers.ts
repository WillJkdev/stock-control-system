import { getAuthIdSupabase } from '@/supabase/globalSupabase';
import { supabase } from '@/supabase/supabase.config';
import { Assignments, AuthUser, Permissions, Users, dataUser } from '@/types/types';

export const insertUsers = async (params: dataUser) => {
  const { data, error } = await supabase.from('users').insert(params).select('*').maybeSingle();

  if (error) {
    console.error('Error al registrar el usuario:', error.message);

    throw error;
  }

  if (data) return data;
};

export const showUsers = async () => {
  const auth_id_supabase = await getAuthIdSupabase();
  const { data, error } = await supabase.from('users').select('*').eq('auth_id', auth_id_supabase).maybeSingle();

  if (error) {
    console.error('Error al mostrar el usuario:', error.message);
  }

  if (data) return data;
};

export const ShowAllUsers = async (params: { _company_id: number }): Promise<Users[]> => {
  const { data, error } = await supabase.rpc('show_staff', params);

  if (error) {
    console.error('Error al mostrar el usuario:', error.message);
  }

  return data;
};

export async function DeleteUser(params: { id: number }): Promise<boolean> {
  const { error } = await supabase.from('users').delete().eq('id', params.id);
  if (error) {
    console.error('Error al eliminar marca:', error.message);
    return false;
  }
  return true;
}

export async function EditUser(params: { id: number; data: Partial<Users> }): Promise<boolean> {
  const { error } = await supabase.from('users').update(params.data).eq('id', params.id);
  if (error) {
    console.error('Error al editar marca:', error.message);
    return false;
  }
  return true;
}
export async function SearchUser(params: { company_id: number; name: string }): Promise<Users[]> {
  // Primero buscamos los IDs de usuarios asignados a esa compañía
  const { data: assignmentData, error: assignmentError } = await supabase
    .from('company_assignment')
    .select('user_id')
    .eq('company_id', params.company_id);

  if (assignmentError) {
    console.error('Error al buscar asignaciones de compañía:', assignmentError.message);
    return [];
  }

  const userIds = assignmentData?.map((assignment) => assignment.user_id) || [];

  if (userIds.length === 0) {
    return []; // No hay usuarios asignados
  }

  // Ahora buscamos usuarios filtrando por los IDs encontrados
  let query = supabase.from('users').select('*').in('id', userIds); // 👈 Aquí usamos IN en lugar de eq

  if (params.name && params.name.trim() !== '') {
    query = query.ilike('name', `%${params.name}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al buscar usuarios:', error.message);
    return [];
  }

  return data ?? [];
}

//tabla asignaciones
export const InsertAssignments = async (params: Pick<Assignments, 'user_id' | 'company_id'>): Promise<boolean> => {
  await supabase.from('company_assignment').delete().eq('user_id', params.user_id);
  const { error } = await supabase.from('company_assignment').insert(params);
  if (error) {
    console.error('Error al asignar empresa:', error.message);
    return false;
  }
  return true;
};

//tabla permisos
export async function InsertPermission(params: Partial<Permissions>) {
  const { error } = await supabase.from('permissions').insert(params);

  if (error) {
    console.error('Error al registrar el permiso:', error.message);
    return false;
  }
  return true;
}
export async function ShowPermissions(params: Pick<Users, 'id'>) {
  const { data, error } = await supabase.from('permissions').select(`id, user_id, module_id, modules(name)`).eq('user_id', params.id);

  if (error) {
    console.error('Error al mostrar el usuario:', error.message);
  }
  return data;
}
export async function DeletePermission(params: Pick<Users, 'id'>) {
  const { error } = await supabase.from('permissions').delete().eq('user_id', params.id);

  if (error) {
    console.error('Error al eliminar marca:', error.message);
    return false;
  }
  return true;
}

export async function ShowModules() {
  const { data, error } = await supabase.from('modules').select();
  if (error) {
    console.error('Error al mostrar el usuario:', error.message);
  }
  return data;
}

//funciones de supabase para crear usuarios
export async function manageUserFunction({
  method, // 'POST', 'DELETE' o 'PATCH'
  params, // los datos correspondientes para cada método
}: {
  method: 'POST' | 'DELETE' | 'PATCH';
  params: { email?: string; password?: string; auth_user_id?: string };
}): Promise<AuthUser | null> {
  try {
    // Validar parámetros antes de enviar la solicitud a Supabase
    if ((method === 'DELETE' || method === 'PATCH') && !params.auth_user_id) {
      console.error('El ID del usuario es obligatorio para esta operación');
      return null;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch('https://jtifguyneohrpblvxqpz.supabase.co/functions/v1/create-user', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    const responseData = await response.json();

    // Manejar el caso en que la respuesta no sea 200 OK
    if (!response.ok) {
      console.error(`Error desde la función ${method.toLowerCase()}:`, responseData.error || 'Error inesperado');
      throw new Error(responseData.error || `Error inesperado en ${method.toLowerCase()}`);
    }

    // Si la respuesta es exitosa
    if (method === 'POST') {
      // Respuesta exitosa de creación de usuario
      return {
        id: responseData.id, // Asumiendo que la respuesta tiene el ID del usuario
        message: responseData.message,
      };
    } else if (method === 'DELETE') {
      // Respuesta exitosa de eliminación de usuario
      return {
        id: params.auth_user_id as string, // El ID del usuario eliminado
        message: responseData.message,
      };
    } else if (method === 'PATCH') {
      // Respuesta exitosa de actualización de usuario
      return {
        id: responseData.id, // Asumiendo que la respuesta tiene el ID del usuario actualizado
        message: responseData.message,
      };
    }

    // Si el método no se maneja explícitamente
    return null;
  } catch (err) {
    console.error(`Error al llamar a ${method.toLowerCase()}:`, err);
    return null;
  }
}
