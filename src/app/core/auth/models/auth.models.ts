export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenData {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}
