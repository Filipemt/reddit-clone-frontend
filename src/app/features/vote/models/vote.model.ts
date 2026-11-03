export type VoteValue = -1 | 0 | 1;

export interface VoteRequest {
  value: VoteValue;
}

export interface VoteResponse {
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  value: number;
  score: number;
}
