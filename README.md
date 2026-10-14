# Auxílio Studio

Conversão do protótipo Scriptable para TypeScript/Vite. O painel só é liberado após validação da key no endpoint serverless da Vercel; os botões de login não pulam essa etapa.

## Rodar

```bash
npm install
npm run dev
```

## Vercel

1. Importe o repositório na Vercel.
2. Configure a variável de ambiente `AUXILIO_ACCESS_KEY` em Preview e Production.
3. Execute o build padrão (`npm run build`).

O manifesto PWA permite instalar o site na tela inicial pelo menu do navegador. Um perfil DNS/MDM não deve ser usado para forçar a instalação de apps; a instalação varia por sistema e exige ação do usuário.

## Escopo seguro

Este projeto é apenas uma interface demonstrativa. Não contém injeção, bypass, automação de login ou manipulação de jogos/contas.
