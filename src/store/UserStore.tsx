import {
  DeletePermission,
  EditUser,
  InsertAssignments,
  InsertPermission,
  insertUsers,
  // createUserFunction,
  manageUserFunction,
  SearchUser,
  ShowAllUsers,
  ShowModules,
  ShowPermissions,
  showUsers,
} from '@/supabase/crudUsers';
import { supabase } from '@/supabase/supabase.config';
import { dataUser, EditUserData, Modules, PermissionsView, Users } from '@/types/types';
import { showErrorToast, showSuccessToast } from '@/utils/customToasts';
import { DataModulesConfig } from '@/utils/staticData';
import { create } from 'zustand';

interface signOutParams {
  email: string;
  password: string;
  role?: string;
}

interface insertUserParams {
  email: string;
  password: string;
  userParams: Partial<Users>;
  dataCheckPermissions: Pick<Modules, 'id' | 'check'>[];
}
interface UserStore {
  authUser: dataUser | null;
  insertUserAdmin: (params: signOutParams) => Promise<dataUser | undefined>;
  userId: number;
  showUsers: () => Promise<void>;

  searcher: string;
  setSearcher: (params: string) => void;
  dataUsers: Users[];
  dataModules: Modules[];
  dataPermissions: Partial<PermissionsView>[];
  dataPermissionsEdit: Partial<PermissionsView>[];
  brandItemSelect: Users | null;
  parameters: { _company_id: number };
  showAllUsers: (params: { _company_id: number }) => Promise<Users[]>;
  selectUser: (params: Users | null) => void;
  insertUser: (params: insertUserParams) => Promise<void>;
  deleteUser: (params: { uuid_user_id: string }) => Promise<void>;
  editUserId: (params: { id: number; data: Partial<EditUserData> }) => Promise<void>;
  searchUser: (params: { company_id: number; name: string }) => Promise<Users[]>;
  showModules: () => Promise<Modules[] | null>;
  showPermissions: (params: Pick<Users, 'id'>) => Promise<Partial<PermissionsView>[] | null>;
  showPermissionsEdit: (params: Pick<Users, 'id'>) => Promise<Partial<PermissionsView>[] | null>;
  dataModulesConfigWithState: ModuleConfig[];
}
interface ModuleConfig {
  title: string;
  subtitle: string;
  icon: string;
  link: string;
  state?: boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  insertUserAdmin: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error('Error al registrar el usuario:', error.message);
      throw error;
    }
    if (!data.user) {
      console.warn('Registro incompleto: no se devolvió el usuario de Auth', data);
      return;
    }
    const dataUser = await insertUsers({
      email: data.user.email,
      auth_id: data.user.id,
      reg_date: new Date().toISOString(),
    });
    return dataUser;
  },
  userId: 0,
  showUsers: async () => {
    const response = await showUsers();
    set({ userId: response.id, authUser: response });
    return response;
  },

  //--------------------------------------
  authUser: null,
  searcher: '',
  setSearcher: (params) => {
    set({ searcher: params });
  },
  dataUsers: [],
  brandItemSelect: null,
  parameters: { _company_id: 0 },

  showAllUsers: async (params) => {
    const response = await ShowAllUsers(params);
    set({
      parameters: params,
      dataUsers: response ?? [],
      brandItemSelect: response?.[0] ?? null,
    });
    return response;
  },
  selectUser: (params: Users | null) => {
    set({ brandItemSelect: params });
  },
  insertUser: async ({ email, password, userParams, dataCheckPermissions }: insertUserParams) => {
    try {
      // Crear en Auth
      // const newUserAuth = await createUserFunction({ email, password });
      const newUserAuth = await manageUserFunction({
        method: 'POST',
        params: { email, password },
      });
      if (!newUserAuth) {
        console.error('No se pudo crear el usuario en Auth');
        showErrorToast('Error', 'No se pudo crear el usuario en Auth');
        return;
      }

      // Crear en users
      const newUserData = await insertUsers({
        name: userParams.name,
        nro_doc: userParams.nro_doc,
        phone: userParams.phone,
        address: userParams.address,
        reg_date: new Date().toISOString(),
        status: 'active',
        role: userParams.role ?? 'user',
        auth_id: newUserAuth.id,
        type_doc: userParams.type_doc,
        email: userParams.email,
      });

      if (!newUserData) {
        console.error('Fallo la inserción en la tabla users');
        showErrorToast('Error', 'No se pudo guardar el usuario en la base de datos');
        return;
      }

      // Asignar empresa
      const successAssign = await InsertAssignments({
        company_id: userParams.company_id ?? 0,
        user_id: newUserData.id,
      });
      if (!successAssign) {
        console.error('Fallo la asignación de empresa');
        showErrorToast('Error', 'No se pudo asignar la empresa al usuario');
        return;
      }

      // Asignar permisos (módulos)
      for (const item of dataCheckPermissions) {
        if (item.check) {
          const res = await InsertPermission({
            user_id: newUserData.id,
            module_id: item.id,
          });
          if (!res) console.warn('Fallo asignar permiso al módulo', item.id);
        }
      }

      // Refrescar usuarios
      const { showAllUsers, parameters } = get();
      const response = await showAllUsers(parameters);
      set({ dataUsers: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se guardaron correctamente');
    } catch (err) {
      console.error('Error en insertUser:', err);
      showErrorToast('Operación fallida', 'Ocurrió un error inesperado');
    }
  },

  deleteUser: async (params: { uuid_user_id: string }) => {
    try {
      // 1. Eliminar en Supabase Auth vía Edge Function
      const result = await manageUserFunction({
        method: 'DELETE',
        params: { auth_user_id: params.uuid_user_id },
      });

      if (!result) {
        console.error('No se pudo eliminar el usuario en Auth');
        showErrorToast('Operación fallida', 'No se pudo eliminar el usuario');
        return;
      }

      // 2. Refrescar lista
      const { showAllUsers, parameters } = get();
      const response = await showAllUsers(parameters);
      set({ dataUsers: response ?? [] });

      showSuccessToast('Operación exitosa', 'Usuario eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      showErrorToast('Operación fallida', 'Ocurrió un error inesperado');
    }
  },
  editUserId: async (params: { id: number; data: Partial<EditUserData> }) => {
    try {
      // 1. Actualizar en tabla users
      const { modules, password, auth_id, ...userData } = params.data;
      const shouldUpdateUserTable = Object.keys(userData).length > 0;

      if (shouldUpdateUserTable) {
        const success = await EditUser({ id: params.id, data: userData });
        if (!success) throw new Error('Falló la actualización en tabla users');
      }

      // 2. Si hay `auth_id` y se modificó el email o password, actualizar en Auth
      if (auth_id && (params.data.email || password)) {
        const updates: { email?: string; password?: string } = {};
        if (params.data.email) updates.email = params.data.email;
        if (password) updates.password = password;

        const updated = await manageUserFunction({
          method: 'PATCH',
          params: { auth_user_id: auth_id, ...updates },
        });

        if (!updated) throw new Error('Falló la actualización en Supabase Auth');
      }

      // 3. Actualizar empresa (si cambia)
      if (params.data.company_id) {
        await InsertAssignments({ company_id: params.data.company_id, user_id: params.id });
      }

      // 4. Actualizar permisos si hay modules
      if (modules) {
        // 1. Eliminar permisos anteriores
        await DeletePermission({ id: params.id });

        // 2. Insertar nuevos permisos
        const inserts = modules.filter((mod) => mod.check).map((mod) => InsertPermission({ user_id: params.id, module_id: mod.id }));

        await Promise.all(inserts);
      }

      // 5. Refrescar vista
      const { showAllUsers, parameters } = get();
      const response = await showAllUsers(parameters);
      set({ dataUsers: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se editaron correctamente');
    } catch (err) {
      console.error('Error al editar usuario:', err);
      showErrorToast('Operación fallida', 'Ocurrió un error inesperado');
    }
  },

  searchUser: async (params: { company_id: number; name: string }) => {
    if (!params.name.trim()) {
      const { showAllUsers } = get();
      const response = await showAllUsers({ _company_id: params.company_id });
      return response;
    }
    const response = await SearchUser(params);
    set({ dataUsers: response ?? [] });
    return response;
  },
  //--------------------------------------
  dataModules: [],
  showModules: async () => {
    const response = await ShowModules();
    set({ dataModules: response ?? [] });
    return response;
  },
  dataPermissions: [],
  dataPermissionsEdit: [],

  dataModulesConfigWithState: [],
  showPermissions: async (params) => {
    const response = await ShowPermissions(params);
    set({ dataPermissions: response ?? [] });
    const allDocs: ModuleConfig[] = [];
    DataModulesConfig.map((element) => {
      const statePermission =
        response?.some((obj) => {
          const moduleName = (obj.modules as { name?: string })?.name;
          return moduleName === element.title;
        }) ?? false;

      if (statePermission) {
        allDocs.push({ ...element, state: true });
      } else {
        allDocs.push({ ...element, state: false });
      }
    });

    set({ dataModulesConfigWithState: allDocs });
    return response;
  },
  showPermissionsEdit: async (params) => {
    const response = await ShowPermissions(params);
    set({ dataPermissionsEdit: response ?? [] });
    return response;
  },
}));
