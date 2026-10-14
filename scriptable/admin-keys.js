// Calculadora — Painel Admin de Keys para Scriptable
// Cole este arquivo em um novo script no Scriptable.
// Coleção usada: https://6acfc53303feaa52b21eece9.mockapi.io/apionline

const API = 'https://6acfc53303feaa52b21eece9.mockapi.io/apionline';
const PREFIX = 'IOSPRIVATE';

async function api(path = '', method = 'GET', body) {
  const request = new Request(API + path);
  request.method = method;
  request.headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (body !== undefined) request.body = JSON.stringify(body);
  const response = await request.loadJSON();
  if (request.response.statusCode < 200 || request.response.statusCode >= 300) {
    throw new Error(response?.message || `Erro HTTP ${request.response.statusCode}`);
  }
  return response;
}

function randomPart(length = 12) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let value = '';
  for (let i = 0; i < length; i++) value += alphabet[Math.floor(Math.random() * alphabet.length)];
  return value;
}

function makeKey(type) {
  // Formato: IOSPRIVATE-<tipo da key>-strings aleatórias
  return `${PREFIX}-${type.toUpperCase()}-${randomPart(12)}`;
}

function secondsFor(type, amount) {
  if (type === 'perm') return 0;
  if (type === 'hourly') return amount * 60 * 60;
  if (type === 'weekly') return amount * 7 * 24 * 60 * 60;
  return amount * 24 * 60 * 60;
}

function typeLabel(type, expire) {
  if (type === 'perm') return 'Permanente';
  if (type === 'hourly') return `${expire} hora(s)`;
  if (type === 'weekly') return `${expire} semana(s)`;
  if (type === 'monthly') return '1 mês';
  return `${expire} dia(s)`;
}

function dateLabel(seconds) {
  return seconds ? new Date(seconds * 1000).toLocaleString('pt-BR') : '—';
}

async function ask(title, message, placeholder = '') {
  const alert = new Alert();
  alert.title = title; alert.message = message;
  alert.addTextField(placeholder);
  alert.addAction('OK'); alert.addCancelAction('Cancelar');
  const index = await alert.presentAlert();
  return index === -1 ? null : alert.textFieldValue(0).trim();
}

async function choose(title, options) {
  const alert = new Alert(); alert.title = title;
  options.forEach(option => alert.addAction(option));
  alert.addCancelAction('Cancelar');
  const result = await alert.presentSheet();
  return result < 0 ? null : options[result];
}

async function notice(title, message) {
  const alert = new Alert(); alert.title = title; alert.message = message; alert.addAction('OK'); await alert.presentAlert();
}

async function createKey() {
  const username = await ask('Nova key', 'Nome do usuário:', 'jogador_01');
  if (!username) return;
  const type = await choose('Tipo da key', ['hourly', 'daily', 'weekly', 'monthly', 'perm']);
  if (!type) return;
  let amount = 1;
  if (!['monthly', 'perm'].includes(type)) {
    const raw = await ask('Duração', type === 'hourly' ? 'Quantidade de horas:' : type === 'weekly' ? 'Quantidade de semanas:' : 'Quantidade de dias:', '1');
    amount = Number(raw);
    if (!Number.isInteger(amount) || amount < 1 || amount > 3650) return notice('Erro', 'Informe uma duração inteira entre 1 e 3650.');
  }
  const key = makeKey(type);
  const createdAt = Math.floor(Date.now() / 1000);
  const record = { key, username, used: false, device: '', expire: type === 'monthly' ? 30 : type === 'perm' ? 0 : amount, type, createdAt, activatedAt: 0, expiresAt: 0, onlineAt: 0, status: 'active' };
  await api('', 'POST', record);
  await notice('Key criada', `${key}\n\nUsuário: ${username}\nPlano: ${typeLabel(type, record.expire)}`);
}

async function listKeys() {
  const keys = await api();
  if (!keys.length) return notice('Licenças', 'Nenhuma key cadastrada na MockAPI.');
  const lines = keys.map((item, index) => `${index + 1}. ${item.key}\n${item.username || 'sem nome'} · ${item.status || 'active'} · ${typeLabel(item.type, item.expire)}\n${item.device ? 'Dispositivo vinculado' : 'Aguardando primeiro acesso'}${item.expiresAt ? ` · expira ${dateLabel(item.expiresAt)}` : ''}`).join('\n\n');
  await notice('Licenças', lines);
}

async function selectKey(title = 'Selecione uma key') {
  const keys = await api();
  if (!keys.length) { await notice('Licenças', 'Nenhuma key cadastrada.'); return null; }
  const options = keys.map(item => `${item.username || 'sem nome'} · ${item.key.slice(0, 26)}`);
  const selected = await choose(title, options);
  return selected ? keys[options.indexOf(selected)] : null;
}

async function updateKey() {
  const item = await selectKey(); if (!item) return;
  const action = await choose('Ação administrativa', ['Bloquear', 'Reativar', 'Desvincular dispositivo', 'Excluir']);
  if (!action) return;
  if (action === 'Excluir') {
    const confirm = await choose('Confirmar exclusão?', ['Excluir definitivamente', 'Cancelar']);
    if (confirm !== 'Excluir definitivamente') return;
    await api(`/${item.id}`, 'DELETE');
    return notice('Concluído', 'Key excluída da MockAPI.');
  }
  if (action === 'Bloquear') { await api(`/${item.id}`, 'PUT', { ...item, status: 'blocked' }); return notice('Concluído', 'Key bloqueada.'); }
  if (action === 'Reativar') { await api(`/${item.id}`, 'PUT', { ...item, status: 'active' }); return notice('Concluído', 'Key reativada.'); }
  await api(`/${item.id}`, 'PUT', { ...item, device: '', used: false, activatedAt: 0, expiresAt: 0, onlineAt: 0 });
  await notice('Concluído', 'Vínculo do dispositivo resetado. A contagem começará no próximo acesso.');
}

async function main() {
  const action = await choose('IOSPRIVATE · Painel Admin', ['Criar key', 'Listar keys', 'Gerenciar key', 'Abrir MockAPI', 'Sair']);
  if (action === 'Criar key') await createKey();
  else if (action === 'Listar keys') await listKeys();
  else if (action === 'Gerenciar key') await updateKey();
  else if (action === 'Abrir MockAPI') Safari.open(API);
}

try { await main(); } catch (error) { await notice('Erro', String(error)); }
