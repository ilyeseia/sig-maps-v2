// @ts-nocheck
import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      path: req.path,
      method: req.method,
    },
  });
};
