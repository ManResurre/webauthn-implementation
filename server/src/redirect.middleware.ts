import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.baseUrl.startsWith('/auth')) {
      next();
      return;
    }

    if (req.baseUrl.includes('.')) {
      res.sendFile(join(__dirname, '..', 'client'));
      return;
    }

    res.sendFile(join(__dirname, '..', 'client', 'index.html'));
  }
}
