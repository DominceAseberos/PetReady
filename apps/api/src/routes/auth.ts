import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { signToken } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  timezone: z.string().default('UTC'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 12);

    const { rows } = await db.query(
      `INSERT INTO users (email, name, password_hash, timezone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, timezone`,
      [data.email, data.name, passwordHash, data.timezone],
    );

    const user = rows[0];
    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({ user, token });
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as { code: string }).code === '23505') {
      return next(new AppError('EMAIL_TAKEN', 409, 'This email already has an account — want to sign in?'));
    }
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const data = LoginSchema.parse(req.body);

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [data.email]);
    if (rows.length === 0) {
      return next(new AppError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect'));
    }

    const user = rows[0];
    if (!user.password_hash) {
      return next(new AppError('OAUTH_ONLY', 401, 'This account uses Google sign-in'));
    }

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) {
      return next(new AppError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect'));
    }

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      user: { id: user.id, email: user.email, name: user.name, timezone: user.timezone },
      token,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });

    const { config } = await import('../config.js');
    const jwtMod = await import('jsonwebtoken');
    const payload = jwtMod.default.verify(header.slice(7), config.jwt.secret) as { userId: string };

    const { rows } = await db.query(
      'SELECT id, email, name, timezone FROM users WHERE id = $1',
      [payload.userId],
    );
    if (rows.length === 0) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});
