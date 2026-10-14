import './style.css';

type Screen = 'calculator' | 'key' | 'panel';
let screen: Screen = 'calculator';
let validating = false;
let selectedGame = '';
const features = new Set<string>();
const history: string[] = [];
let display = '0';
let stored: number | null = null;
let operator = '';
let waitingForValue = false;
let justCalculated = false;
let historyOpen = false;

const app = document.querySelector<HTMLDivElement>('#app')!;
const number = (value: string) => Number(value.replace(',', '.'));
const formatted = (value: number) => {
  if (!Number.isFinite(value)) return 'Erro';
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8, useGrouping: false }).format(value);
};
function calculate(a: number, b: number, op: string) {
  if (op === '+') return a + b;
  if (op === '−') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return b === 0 ? NaN : a / b;
  return b;
}
function press(key: string) {
  if (/^\d$/.test(key)) {
    if (display === '0' || waitingForValue || justCalculated) display = key;
    else if (display.replace('-', '').length < 14) display += key;
    waitingForValue = false;
    justCalculated = false;
  } else if (key === ',') {
    if (waitingForValue || justCalculated) { display = '0,'; waitingForValue = false; justCalculated = false; }
    else if (!display.includes(',')) display += ',';
  } else if (key === 'AC') {
    display = '0'; stored = null; operator = ''; waitingForValue = false; justCalculated = false;
  } else if (key === '⌫') {
    display = display.length > 1 ? display.slice(0, -1) : '0';
  } else if (key === '%') {
    display = formatted(number(display) / 100);
  } else if (key === '±') {
    display = display.startsWith('-') ? display.slice(1) : display === '0' ? '0' : `-${display}`;
  } else if (['+', '−', '×', '÷'].includes(key)) {
    if (stored !== null && operator && !waitingForValue) stored = calculate(stored, number(display), operator);
    else stored = number(display);
    operator = key; waitingForValue = true; justCalculated = false;
  } else if (key === '=') {
    if (stored === null || !operator) return;
    const left = formatted(stored); const right = display; const result = formatted(calculate(stored, number(display), operator));
    history.unshift(`${left} ${operator} ${right} = ${result}`); history.splice(20);
    display = result; stored = null; operator = ''; waitingForValue = false; justCalculated = true;
  }
  render();
}
function calculatorView() {
  const deleteKey = display === '0' && !stored ? 'AC' : '⌫';
  return `<main class="calculator page"><header class="calc-head"><button class="history-button" data-action="history" aria-label="Histórico"><span></span><span></span><span></span></button><span class="calc-title">Calculadora</span><button class="calc-more" data-action="history">•••</button></header><section class="display" aria-live="polite"><div class="expression">${stored !== null ? `${formatted(stored)} ${operator}` : ''}</div><strong>${display}</strong></section><section class="keys" aria-label="Teclado da calculadora"><button class="key function" data-key="${deleteKey}">${deleteKey}</button><button class="key function" data-key="±">±</button><button class="key function" data-key="%">%</button><button class="key operator" data-key="÷">÷</button><button class="key number" data-key="7">7</button><button class="key number" data-key="8">8</button><button class="key number" data-key="9">9</button><button class="key operator" data-key="×">×</button><button class="key number" data-key="4">4</button><button class="key number" data-key="5">5</button><button class="key number" data-key="6">6</button><button class="key operator" data-key="−">−</button><button class="key number" data-key="1">1</button><button class="key number" data-key="2">2</button><button class="key number" data-key="3">3</button><button class="key operator" data-key="+">+</button><button class="key number zero" data-key="0">0</button><button class="key number" data-key=",">,</button><button class="key operator" data-key="=">=</button></section><p class="gesture-hint">Toque com três dedos ao mesmo tempo para abrir o acesso protegido</p>${historyOpen ? historyView() : ''}</main>`;
}
function historyView() { return `<div class="history-sheet"><div class="sheet-handle"></div><div class="sheet-head"><h2>Histórico</h2><button data-action="close-history">Fechar</button></div>${history.length ? `<div class="history-items">${history.map(item => `<p>${item}</p>`).join('')}</div><button class="clear-history" data-action="clear-history">Limpar Histórico</button>` : '<p class="empty-history">Nenhum cálculo recente.</p>'}</div>`; }
function keyView() { return `<main class="key page"><div class="topbar"><button class="ghost" data-action="calculator">‹</button><span class="top-title">VERIFICAÇÃO</span><button class="ghost close" data-action="calculator">×</button></div><div class="key-card"><div class="key-badge">KEY</div><p class="eyebrow">ACESSO PROTEGIDO</p><h1>Ative seu<br><em>workspace.</em></h1><p class="lede">Digite a chave fornecida pelo administrador para continuar.</p><form id="key-form"><label for="key">Sua key</label><input id="key" name="key" type="password" autocomplete="off" placeholder="Digite sua key" required/><button class="submit" ${validating ? 'disabled' : ''}>${validating ? 'VALIDANDO…' : 'VALIDAR KEY'} <span>→</span></button></form><p id="key-message" class="message" role="status"></p></div><p class="security-note">A validação acontece no servidor. A key não é armazenada no navegador.</p></main>`; }
function panelView() { return `<main class="panel page"><div class="panel-glow"></div><header class="panel-head"><div><p class="eyebrow">WORKSPACE ATIVO</p><h1>Auxílio <em>Studio</em></h1></div><button class="avatar" data-action="calculator">AS</button></header><section class="welcome"><span class="status-dot"></span><span>Key verificada com sucesso</span><strong>v1.0</strong></section><section class="feature-list"><button class="feature ${features.has('foco') ? 'on' : ''}" data-feature="foco"><span class="feature-icon">◎</span><span><b>Modo foco</b><small>Organize seu ambiente de edição</small></span><i></i></button><button class="feature ${features.has('atalhos') ? 'on' : ''}" data-feature="atalhos"><span class="feature-icon">✦</span><span><b>Atalhos rápidos</b><small>Ações frequentes ao seu alcance</small></span><i></i></button><button class="feature ${features.has('auxilio') ? 'on' : ''}" data-feature="auxilio"><span class="feature-icon">⌖</span><span><b>Auxílio inteligente</b><small>Ferramentas de apoio à criatividade</small></span><i></i></button></section><section class="mode-card"><div><p class="eyebrow">MODO DE TRABALHO</p><h2>Escolha sua versão</h2></div><div class="segmented"><button class="${selectedGame === 'studio' ? 'active' : ''}" data-game="studio">Studio</button><button class="${selectedGame === 'mobile' ? 'active' : ''}" data-game="mobile">Mobile</button></div></section><button class="launch" data-action="launch">ABRIR WORKSPACE <span>↗</span></button><p id="panel-message" class="message">${selectedGame ? `Modo ${selectedGame} selecionado.` : 'Selecione um modo para continuar.'}</p><footer>Auxílio Studio · Ferramentas demonstrativas</footer></main>`; }
function render() { app.innerHTML = screen === 'calculator' ? calculatorView() : screen === 'key' ? keyView() : panelView(); bindEvents(); }
function bindEvents() { document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button => button.addEventListener('click', () => press(button.dataset.key!))); document.querySelectorAll<HTMLElement>('[data-action]').forEach(el => el.addEventListener('click', () => { const action = el.dataset.action; if (action === 'history') { historyOpen = true; render(); } if (action === 'close-history') { historyOpen = false; render(); } if (action === 'clear-history') { history.length = 0; render(); } if (action === 'calculator') { screen = 'calculator'; historyOpen = false; render(); } if (action === 'launch') { const msg = document.querySelector('#panel-message'); if (!selectedGame) msg!.textContent = 'Escolha Studio ou Mobile antes de abrir.'; else msg!.textContent = `Workspace ${selectedGame} pronto para uso.`; } })); document.querySelectorAll<HTMLButtonElement>('[data-feature]').forEach(el => el.addEventListener('click', () => { const f = el.dataset.feature!; features.has(f) ? features.delete(f) : features.add(f); render(); })); document.querySelectorAll<HTMLButtonElement>('[data-game]').forEach(el => el.addEventListener('click', () => { selectedGame = el.dataset.game!; render(); })); document.querySelector<HTMLFormElement>('#key-form')?.addEventListener('submit', validateKey); }
async function validateKey(event: SubmitEvent) { event.preventDefault(); if (validating) return; const input = document.querySelector<HTMLInputElement>('#key')!; validating = true; render(); try { const response = await fetch('/api/validate-key', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ key: input.value.trim() }) }); const result = await response.json() as { valid: boolean; message: string }; validating = false; if (!result.valid) { render(); document.querySelector<HTMLParagraphElement>('#key-message')!.textContent = result.message; return; } screen = 'panel'; render(); } catch { validating = false; render(); document.querySelector<HTMLParagraphElement>('#key-message')!.textContent = 'Não foi possível validar agora. Tente novamente.'; } }
function setupThreeFingerGesture() { let active = new Set<number>(); let openedAt = 0; document.addEventListener('touchstart', event => { for (const touch of Array.from(event.changedTouches)) active.add(touch.identifier); if (active.size >= 3 && screen === 'calculator' && Date.now() - openedAt > 700) { openedAt = Date.now(); event.preventDefault(); screen = 'key'; historyOpen = false; render(); } }, { passive: false }); const release = (event: TouchEvent) => { for (const touch of Array.from(event.changedTouches)) active.delete(touch.identifier); }; document.addEventListener('touchend', release, { passive: true }); document.addEventListener('touchcancel', release, { passive: true }); }
setupThreeFingerGesture(); render();
