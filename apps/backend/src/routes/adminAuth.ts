import { Router } from 'express';

export const adminAuthRouter = Router();

// POST /api/admin/login
adminAuthRouter.post('/login', (req, res) => {
  const { username, email, password } = req.body;

  const cleanUser = String(username || email || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  // Accept admin@taraluxe.in, Admin@TaraLuxe (case-insensitive)
  const isUserValid = cleanUser === 'admin@taraluxe.in' || cleanUser === 'admin@taraluxe' || cleanUser === 'admin';
  const isPassValid = cleanPass === 'TaraLuxe@2026';

  if (!isUserValid || !isPassValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Please enter the authorized Tara Luxe Admin email and password.'
    });
  }

  const token = `tlx-auth-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  res.json({
    success: true,
    message: 'Welcome to Tara Luxe Admin Center',
    token,
    user: {
      name: 'Tara Luxe Admin',
      email: 'admin@taraluxe.in',
      role: 'SuperAdmin'
    }
  });
});

// GET /api/admin/verify
adminAuthRouter.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer tlx-auth-')) {
    return res.json({ success: true, authorized: true });
  }
  res.status(401).json({ success: false, authorized: false });
});
