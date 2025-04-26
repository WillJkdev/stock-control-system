export interface dataUser {
  name?: string;
  nro_doc?: string;
  phone?: string;
  address?: string;
  reg_date: string;
  status?: string;
  role?: string;
  auth_id: string;
  type_doc?: string;
  email?: string;
  avatar?: string;
  created_at?: string;
}

export interface Company {
  id: number;
  name: string;
  currency_symbol: string;
  user_admin_id: number;
  created_at: string;
}
export type CompanyData = Pick<Company, 'id' | 'name' | 'currency_symbol'>;

export interface Brands {
  id: number;
  description: string;
  company_id: number;
  created_at: string;
}

export interface Categories {
  id: number;
  description: string;
  color: string;
  company_id: number;
  created_at: string;
}

export interface Products {
  id?: number;
  description: string;
  brand_id: number;
  stock: number;
  stock_min: number;
  barcode: number;
  internal_code: string;
  purchase_price: number;
  sale_price: number;
  category_id: number;
  company_id: number;
  created_at?: Date;
}
export type ProductsView = Products & {
  brand: string;
  categories: string;
  color: string;
};

export interface ProductReport extends Products {
  total: number;
}

export interface functionProduct {
  _description: string;
  _brand_id: number;
  _stock: number;
  _stock_min: number;
  _barcode: number;
  _internal_code: string;
  _purchase_price: number;
  _sale_price: number;
  _category_id: number;
  _company_id: number;
}

export interface Users {
  id: number;
  email: string;
  name: string;
  nro_doc: string;
  phone: string;
  address: string;
  reg_date: string;
  status: string;
  role: string;
  auth_id: string;
  type_doc: string;
  created_at: string;
  company_id: number;
}

export interface AuthUser {
  id: string;
  message: string;
}

export interface InsertAuthUser extends Users {
  password: string;
}

export interface Assignments {
  id: number;
  company_id: number;
  user_id: number;
  created_at: string;
}
export interface Permissions {
  id: number;
  user_id: number;
  module_id: number;
  created_at: string;
}

export interface PermissionsView extends Permissions {
  modules: { name: string }[];
}

export interface Modules {
  id: number;
  name: string;
  check: boolean;
  created_at: string;
}

export interface EditUserData extends Users {
  password: string;
  modules?: { id: number; check: boolean }[];
}

export interface Kardex {
  id: number;
  date: string;
  movement_type: 'input' | 'output';
  quantity: number;
  details: string;
  user_id: number;
  product_id: number;
  company_id: number;
  created_at: string;
  status: boolean;
}

export interface KardexView extends Kardex {
  description: string;
  user_name: string;
  stock: number;
  details: string;
}

export interface Movement {
  id: string;
  date: string;
  product: string;
  type: 'input' | 'output';
  quantity: number;
  stock: number;
  usuario: string;
  details: string;
}
