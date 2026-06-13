import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';

interface JwtPayload {
  userId: string;
  role: string;
  name?: string;
  customerId?: string;
  customerName?: string;
}

export const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    const inviteToken = socket.handshake.auth.inviteToken || socket.handshake.query.inviteToken;

    if (token) {
      const decoded = jwt.verify(token as string, config.jwt.secret) as JwtPayload;
      
      socket.data.user = {
        id: decoded.userId,
        role: decoded.role,
        name: decoded.name || 'User'
      };
      
      return next();
    } else if (inviteToken) {
      const secret = config.jwt.inviteSecret || config.jwt.secret;
      const decoded = jwt.verify(inviteToken as string, secret) as JwtPayload;
      
      socket.data.user = {
        id: decoded.customerId || `cust_${Math.random().toString(36).substr(2, 9)}`,
        role: 'CUSTOMER',
        name: decoded.customerName || 'Guest'
      };
      
      return next();
    }

    return next(new Error('Authentication error: No token provided'));
  } catch (error) {
    logger.error(`Socket authentication failed: ${(error as Error).message}`);
    return next(new Error('Authentication error'));
  }
};
