import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js';
Deno.serve(async (req)=>{
  const method = req.method;
  // CORS: manejar preflight request
  if (method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return new Response(JSON.stringify({
      error: 'Token no proporcionado'
    }), {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  const supabaseUserClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
  const supabaseAdminClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
  try {
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({
        error: 'Usuario no autenticado'
      }), {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    const { data: userRow, error: roleError } = await supabaseUserClient.from('users').select('role').eq('auth_id', user.id).single();
    if (roleError || !userRow || userRow.role !== 'admin') {
      return new Response(JSON.stringify({
        error: 'Acceso denegado'
      }), {
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (method === 'POST') {
      const { email, password } = await req.json();
      const { data: newUser, error: createUserError } = await supabaseAdminClient.auth.admin.createUser({
        email,
        password
      });
      if (createUserError) {
        console.error('Error al crear usuario:', createUserError);
        const mensaje = createUserError.message.includes('already registered') ? 'Este correo ya está registrado' : createUserError.message;
        return new Response(JSON.stringify({
          error: mensaje
        }), {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      return new Response(JSON.stringify({
        id: newUser.user.id,
        message: 'Usuario creado correctamente'
      }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (method === 'DELETE') {
      const { auth_user_id } = await req.json();
      // Verificar si el usuario a eliminar es el primero (protegido)
      const { data: userToDelete, error: userToDeleteError } = await supabaseAdminClient.from('users').select('is_protected').eq('auth_id', auth_user_id).single();
      if (userToDeleteError) {
        console.error('Error al obtener usuario:', userToDeleteError);
        return new Response(JSON.stringify({
          error: 'Error al verificar el usuario'
        }), {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      // Si es el primer usuario y está protegido, no permitir eliminación
      if (userToDelete?.is_protected) {
        return new Response(JSON.stringify({
          error: 'No se puede eliminar el primer usuario protegido'
        }), {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      const { error: deleteError } = await supabaseAdminClient.auth.admin.deleteUser(auth_user_id);
      if (deleteError) {
        console.error('Error al eliminar usuario:', deleteError);
        return new Response(JSON.stringify({
          error: deleteError.message
        }), {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      return new Response(JSON.stringify({
        message: 'Usuario eliminado correctamente'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (method === 'PATCH') {
      const { auth_user_id, email, password } = await req.json();
      const updates = {};
      if (email) updates['email'] = email;
      if (password) updates['password'] = password;
      const { data: updatedUser, error: updateError } = await supabaseAdminClient.auth.admin.updateUserById(auth_user_id, updates);
      if (updateError) {
        console.error('Error al actualizar usuario:', updateError);
        return new Response(JSON.stringify({
          error: updateError.message
        }), {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      return new Response(JSON.stringify({
        id: updatedUser.user.id,
        message: 'Usuario actualizado correctamente'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Si llega aquí, es un método no soportado
    return new Response(JSON.stringify({
      error: 'Método no permitido'
    }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    return new Response(JSON.stringify({
      error: 'Error interno del servidor'
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
