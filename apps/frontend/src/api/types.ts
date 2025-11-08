// API Response Types
export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: PaginationInfo;
}

// Schema Types
export interface Schema {
  id: number;
  address: string;
  name: string;
  schema: string;
  revokable: boolean;
  resolver: string;
  creator: string;
  created_at: string;
  tx_hash: string;
  attestation_cnt?: number;
}

// Attestation Types
export interface Attestation {
  id: number;
  address: string;
  schema: string;
  ref_attestation: string;
  time: string;
  expiration_time: string;
  revocation_time: string;
  attestor: string;
  recipient: string;
  data: string;
  tx_hash: string;
}

export interface AttestationWithSchema extends Attestation {
  schema_id?: number;
  schema_name?: string;
  schema_address?: string;
  schema_data?: string;
}

// Count Types
export interface CountResult {
  count: number;
}

// API Parameter Types
export interface PaginationParams {
  offset?: number;
  limit?: number;
}

export interface SearchParams {
  searchInput: string;
}

// Chain Types
export type ChainType = 'aptos' | 'movement' | 'sui';
export type NetworkType = 'testnet' | 'mainnet' | 'devnet';
