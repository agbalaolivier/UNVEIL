import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { pool } from './db.js';

const TOKEN_TTL = '30d';
const RESET_CODE_TTL_MINUTES = 15;

async function sendResetCodeEmail(email, code) {
  const subject = 'Ton code de réinitialisation UNVEIL';
  const text = `Voici ton code de réinitialisation : ${code}\nCe code expire dans ${RESET_CODE_TTL_MINUTES} minutes.\nSi tu n’es pas à l’origine de cette demande, ignore cet e-mail.`;

  if (!process.env.RESEND_API_KEY) {
    console.warn(`⚠️ RESEND_API_KEY absente : code de réinitialisation pour ${email} = ${code}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || 'UNVEIL <onboarding@resend.dev>',
      to: [email],
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Envoi Resend échoué (${response.status}) : ${errorBody}`);
  }
}

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET est requis pour l’authentification.');
  }
  return process.env.JWT_SECRET;
}

function publicUser(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    emailVerified: user.email_verified,
  };
}

function validateUserInput({ firstName, lastName, email, password }) {
  if (![firstName, lastName, email, password].every((value) => typeof value === 'string' && value.trim())) {
    return 'Tous les champs sont obligatoires.';
  }
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Adresse e-mail invalide.';
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
  return null;
}

function createToken(user) {
  return jwt.sign({ sub: user.id }, getJwtSecret(), { expiresIn: TOKEN_TTL });
}

export function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Connexion requise.' });
    req.user = jwt.verify(token, getJwtSecret());
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Session expirée.' });
  }
}

export function registerAuthRoutes(app) {
  app.post('/api/auth/register', async (req, res) => {
    if (!pool) return res.status(503).json({ success: false, error: 'Authentification non configurée.' });

    try {
      const { firstName, lastName, email, password } = req.body;
      const validationError = validateUserInput({ firstName, lastName, email, password });
      if (validationError) return res.status(400).json({ success: false, error: validationError });

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
      if (existingUser.rowCount) return res.status(409).json({ success: false, error: 'Cette adresse e-mail est déjà utilisée.' });

      const passwordHash = await bcrypt.hash(password, 12);
      const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, first_name, last_name, email, email_verified`,
        [firstName.trim(), lastName.trim(), normalizedEmail, passwordHash],
      );
      const user = result.rows[0];

      return res.status(201).json({ success: true, token: createToken(user), user: publicUser(user) });
    } catch (error) {
      console.error('❌ ERREUR INSCRIPTION :', error);
      return res.status(500).json({ success: false, error: 'Inscription impossible pour le moment.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    if (!pool) return res.status(503).json({ success: false, error: 'Authentification non configurée.' });

    try {
      const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const password = typeof req.body.password === 'string' ? req.body.password : '';
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ success: false, error: 'E-mail ou mot de passe incorrect.' });
      }

      return res.json({ success: true, token: createToken(user), user: publicUser(user) });
    } catch (error) {
      console.error('❌ ERREUR CONNEXION :', error);
      return res.status(500).json({ success: false, error: 'Connexion impossible pour le moment.' });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    if (!pool) return res.status(503).json({ success: false, error: 'Authentification non configurée.' });

    try {
      const authorization = req.headers.authorization || '';
      const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
      if (!token) return res.status(401).json({ success: false, error: 'Session absente.' });

      const payload = jwt.verify(token, getJwtSecret());
      const result = await pool.query(
        'SELECT id, first_name, last_name, email, email_verified FROM users WHERE id = $1',
        [payload.sub],
      );
      if (!result.rowCount) return res.status(401).json({ success: false, error: 'Utilisateur introuvable.' });

      return res.json({ success: true, user: publicUser(result.rows[0]) });
    } catch {
      return res.status(401).json({ success: false, error: 'Session expirée.' });
    }
  });

  app.delete('/api/auth/account', requireAuth, async (req, res) => {
    if (!pool) return res.status(503).json({ success: false, error: 'Authentification non configurée.' });

    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.user.sub]);
      if (!result.rowCount) return res.status(404).json({ success: false, error: 'Compte introuvable.' });
      return res.json({ success: true });
    } catch (error) {
      console.error('❌ ERREUR SUPPRESSION COMPTE :', error);
      return res.status(500).json({ success: false, error: 'Suppression impossible pour le moment.' });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    if (!pool) return res.status(503).json({ success: false, error: 'Authentification non configurée.' });

    const genericResponse = { success: true, message: 'Si un compte existe avec cette adresse, un code de réinitialisation vient d’être envoyé.' };

    try {
      const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, error: 'Adresse e-mail invalide.' });

      const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (!result.rowCount) return res.json(genericResponse);

      const code = crypto.randomInt(100000, 1000000).toString();
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);

      await pool.query(
        'UPDATE users SET reset_code_hash = $1, reset_code_expires = $2 WHERE id = $3',
        [codeHash, expiresAt, result.rows[0].id],
      );

      await sendResetCodeEmail(email, code);
      return res.json(genericResponse);
    } catch (error) {
      console.error('❌ ERREUR MOT DE PASSE OUBLIÉ :', error);
      return res.status(500).json({ success: false, error: 'Envoi du code impossible pour le moment.' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    if (!pool) return res.status(503).json({ success: false, error: 'Authentification non configurée.' });

    try {
      const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
      const password = typeof req.body.password === 'string' ? req.body.password : '';

      if (!email || !code) return res.status(400).json({ success: false, error: 'E-mail et code requis.' });
      if (password.length < 8) return res.status(400).json({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' });

      const result = await pool.query(
        'SELECT id, reset_code_hash, reset_code_expires FROM users WHERE email = $1',
        [email],
      );
      const user = result.rows[0];

      if (!user?.reset_code_hash || !user.reset_code_expires || new Date(user.reset_code_expires) < new Date()) {
        return res.status(400).json({ success: false, error: 'Code invalide ou expiré.' });
      }

      const isCodeValid = await bcrypt.compare(code, user.reset_code_hash);
      if (!isCodeValid) return res.status(400).json({ success: false, error: 'Code invalide ou expiré.' });

      const passwordHash = await bcrypt.hash(password, 12);
      await pool.query(
        'UPDATE users SET password_hash = $1, reset_code_hash = NULL, reset_code_expires = NULL WHERE id = $2',
        [passwordHash, user.id],
      );

      return res.json({ success: true, message: 'Mot de passe mis à jour. Tu peux te connecter.' });
    } catch (error) {
      console.error('❌ ERREUR RÉINITIALISATION MOT DE PASSE :', error);
      return res.status(500).json({ success: false, error: 'Réinitialisation impossible pour le moment.' });
    }
  });
}
