# Calculadora / Auxílio

PWA em Vite + React + TypeScript. A tela inicial é uma calculadora; o painel de auxílio abre após quatro toques rápidos com três dedos e uma key válida.

## Keys pela MockAPI

A validação consulta exclusivamente esta coleção:

```text
https://6acfc53303feaa52b21eece9.mockapi.io/apionline
```

Não existe mais key fixa no código. Cada licença deve ter, no mínimo, estes campos:

```json
{
  "key": "IOSPRIVATE-DAILY-ABC123DEF456",
  "username": "jogador_01",
  "used": false,
  "device": "",
  "expire": 7,
  "type": "daily",
  "createdAt": 0,
  "activatedAt": 0,
  "expiresAt": 0,
  "onlineAt": 0,
  "status": "active"
}
```

Tipos aceitos pelo painel Scriptable: `hourly`, `daily`, `weekly`, `monthly` e `perm`. As keys são geradas no formato `IOSPRIVATE-<TIPO>-<12 caracteres aleatórios>`.

No primeiro acesso, a API vincula a licença ao identificador persistente do navegador e inicia o prazo. A mesma key não pode ser usada em outro dispositivo. Keys bloqueadas, revogadas e expiradas são recusadas.

## Painel administrativo Scriptable

O painel administrativo é separado do site. Abra o arquivo [scriptable/admin-keys.js](scriptable/admin-keys.js) no Scriptable. Ele permite:

- Criar keys com usuário, tipo e duração;
- Listar licenças;
- Bloquear e reativar;
- Desvincular o dispositivo e reiniciar a ativação;
- Excluir registros;
- Abrir a coleção MockAPI.

A MockAPI fornecida não possui autenticação própria. Portanto, qualquer pessoa que conheça a URL da coleção pode fazer requisições REST diretamente. Para produção, use um backend autenticado/proxy e não exponha operações administrativas no cliente.

## Desenvolvimento e Vercel

```bash
npm install
npm run dev
npm run build
```

A Vercel detecta `/api/validate-key.ts` automaticamente. O endpoint serverless consulta a MockAPI no servidor; a URL da coleção é pública porque foi fornecida pelo usuário.
