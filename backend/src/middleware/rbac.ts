import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { Role } from '@prisma/client';

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };
};
