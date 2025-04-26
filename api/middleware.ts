import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.cookies['access_token'];

  if (!token) {
    res.status(302).setHeader('Location', '/login').end();
    return;
  }

  return;
}
