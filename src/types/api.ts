// API Types based on the vector database API structure

export interface Tenant {
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  name: string;
  tenant: string;
  created_at?: string;
  updated_at?: string;
}

export interface Collection {
  id: string;
  name: string;
  tenant: string;
  database: string;
  created_at?: string;
  updated_at?: string;
}

export interface Record {
  id?: string;
  metadata?: { [key: string]: any };
  vector?: number[];
  text?: string;
  distance?: number;
  uris?: string[];
}

export interface QueryRequest {
  query?: string;
  filter?: { [key: string]: any };
  limit?: number;
  offset?: number;
  vector?: number[];
  similarity_threshold?: number;
}

export interface GetRequest {
  ids?: string[];
  where?: { [key: string]: any };
  limit?: number;
  offset?: number;
  include?: string[];
}

export interface AddRequest {
  records: Record[];
}

export interface UpdateRequest {
  records: Record[];
}

export interface DeleteRequest {
  ids?: string[];
  filter?: { [key: string]: any };
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  category: 'system' | 'tenant' | 'database' | 'collection' | 'data';
  requiresAuth: boolean;
  parameters?: string[];
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SystemInfo {
  version: string;
  status: 'healthy' | 'unhealthy';
  timestamp: string;
}

export interface UserIdentity {
  user_id: string;
  tenant: string;
  databases: string[];
}



