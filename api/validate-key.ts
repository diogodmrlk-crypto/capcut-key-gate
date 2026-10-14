import type { VercelRequest, VercelResponse } from '@vercel/node';

const MOCKAPI_KEYS_URL = 'https://6acfc53303feaa52b21eece9.mockapi.io/apionline';
type License = { id?: string; key?: string; username?: string; used?: boolean; device?: string; expire?: number; type?: string; createdAt?: number; activatedAt?: number; expiresAt?: number; onlineAt?: number; status?: 'active' | 'blocked' | 'revoked' };
const now = () => Math.floor(Date.now() / 1000);
const durationSeconds = (license: License) => { const amount = Number(license.expire ?? 0); if (!amount || license.type === 'perm') return 0; if (license.type === 'hourly') return amount * 60 * 60; if (license.type === 'weekly') return amount * 7 * 24 * 60 * 60; return amount * 24 * 60 * 60; };
const json = (res: VercelResponse, status: number, body: object) => res.status(status).json(body);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { valid: false, message: 'Método não permitido.' });
  const submitted = String(req.body?.key ?? '').trim();
  const device = String(req.body?.deviceId ?? '').trim().slice(0, 160);
  if (!submitted || submitted.length > 128) return json(res, 400, { valid: false, message: 'Informe uma key válida.' });
  if (device.length < 8) return json(res, 400, { valid: false, message: 'Não foi possível identificar este dispositivo.' });
  try {
    const response = await fetch(MOCKAPI_KEYS_URL);
    if (!response.ok) return json(res, 502, { valid: false, message: 'Não foi possível consultar a MockAPI.' });
    const licenses = await response.json() as License[];
    const license = licenses.find(item => String(item.key ?? '').trim() === submitted);
    if (!license?.id) return json(res, 401, { valid: false, message: 'Chave de acesso inválida.' });
    if ((license.status ?? 'active') !== 'active') return json(res, 403, { valid: false, message: license.status === 'blocked' ? 'Esta chave foi bloqueada.' : 'Esta chave foi revogada.' });
    const timestamp = now();
    if (Number(license.expiresAt ?? 0) > 0 && Number(license.expiresAt) <= timestamp) return json(res, 403, { valid: false, message: 'Esta chave expirou.' });
    if (license.device && license.device !== device) return json(res, 403, { valid: false, message: 'Esta chave já está vinculada a outro dispositivo.' });
    const activatedAt = Number(license.activatedAt ?? 0) || timestamp;
    const expiresAt = Number(license.expiresAt ?? 0) || (durationSeconds(license) ? activatedAt + durationSeconds(license) : 0);
    const update = { device, used: true, activatedAt, expiresAt, onlineAt: timestamp };
    const updated = await fetch(`${MOCKAPI_KEYS_URL}/${license.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(update) });
    if (!updated.ok) return json(res, 502, { valid: false, message: 'A key foi encontrada, mas não foi possível ativá-la.' });
    return json(res, 200, { valid: true, message: 'Key validada.' });
  } catch { return json(res, 502, { valid: false, message: 'Não foi possível validar agora. Verifique a conexão com a MockAPI.' }); }
}
