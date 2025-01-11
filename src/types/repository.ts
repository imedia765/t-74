export interface Repository {
  id: string;
  url: string;
  name?: string;
  nickname?: string;
  is_master?: boolean;
  last_sync?: string;
  status?: string;
  last_commit?: string;
  last_commit_date?: string;
}

export interface ConsoleLog {
  message: string;
  type: 'error' | 'success' | 'info';
  timestamp: string;
}

export interface VerificationStatus {
  checking: boolean;
  success?: boolean;
  message?: string;
}