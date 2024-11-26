export const expiresTimeTokenMilliseconds = 7 * 24 * 60 * 60 * 1000;

export const COOKIE_NAMES = {
  JWT: 'jwt',
};

export interface AdminFromJwt {
  id: string;
  sub: {
    email: string;
  };
}
