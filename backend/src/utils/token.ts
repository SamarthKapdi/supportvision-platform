import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { UserPayload } from '../types';

export const generateToken = (user: UserPayload): string => {
  return jwt.sign(user, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, env.jwt.secret) as UserPayload;
};

export const generateInviteToken = (): string => {
  return uuidv4();
};
