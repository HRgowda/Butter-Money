import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'my_super_secret_key';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }

  try {

    const decoded = jwt.verify(token, SECRET_KEY);

    (req as any).user = decoded;

    next();

  } catch (error) {

    console.log("Error", error)

    res.status(403).json({ message: 'Invalid token' });
    
    return
  }
};
