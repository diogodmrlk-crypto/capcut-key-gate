import type { VercelRequest, VercelResponse } from '@vercel/node';

// Fallback temporário solicitado. Em repositório público, esta key fica visível.
const TEMPORARY_ACCESS_KEY = 'PURPOU-DAY-BRAZILIAN8FKZ5@';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ valid: false, message: 'Método não permitido.' });
  const submitted = String(req.body?.key ?? '').trim();
  const expected = process.env.AUXILIO_ACCESS_KEY?.trim() || TEMPORARY_ACCESS_KEY;
  if (!expected) return res.status(503).json({ valid: false, message: 'A chave ainda não foi configurada no servidor.' });
  if (!submitted || submitted.length > 128) return res.status(400).json({ valid: false, message: 'Informe uma key válida.' });
  return res.status(200).json({ valid: submitted === expected, message: submitted === expected ? 'Key validada.' : 'Key inválida.' });
}
