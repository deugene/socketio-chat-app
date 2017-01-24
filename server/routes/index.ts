import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// api

router.get('/api', (req: Request, res: Response, next: NextFunction): void => {
  res.json({ data: 'api works!' });
});

export default router;
