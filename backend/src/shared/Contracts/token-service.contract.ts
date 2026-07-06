export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

/** Claims carried by a verified access token. */
export interface AccessClaims {
  sub: string;
  role: string;
  dig: string;
  sit: number;
  type: 'access';
  iat?: number;
  exp?: number;
}

/** Identity context returned after a valid access + refresh pair is verified. */
export interface RefreshPairResult {
  userId: string;
  role: string;
  sit: number;
}

export interface ITokenService {
  verifyAccess(token: string): AccessClaims;

  verifyRefreshPair(
    expiredAccessToken: string,
    refreshToken: string,
  ): RefreshPairResult;

  decodeRefresh(token: string): { userId: string; sit: number };
}
