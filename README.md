# App Copa do Mundo 2026 (Híbrido + Backend)

Projeto fullstack pronto para uso em web e base para empacotar como app híbrido (Android/iOS via Capacitor).

## Funcionalidades
- Cenário atualizado para **fev/2026**: 48 vagas totais, com 42 seleções já confirmadas.
- Exibição por continente das seleções confirmadas.
- Exibição das 6 vagas pendentes via playoffs de março/2026 (UEFA e repescagem mundial).
- Jogos da fase de grupos organizados por 3 rodadas (12 grupos, total de 72 partidas).
- Backend com endpoint admin para atualizar resultados, datas e estádio.

## Estrutura
- `backend`: API REST em Node.js + Express.
- `frontend`: app React/Vite (responsivo e pronto para empacotamento híbrido).

## Como rodar
```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000`

## Segurança básica admin
A atualização de partidas usa header `x-admin-key`.

Valor padrão:
- `admin-2026`

Você pode mudar no backend com variável de ambiente:
```bash
ADMIN_KEY=sua-chave npm --prefix backend run dev
```

## Endpoints
- `GET /api/world-cup` - retorna participantes, seleções confirmadas por confederação, vagas pendentes e jogos.
- `PUT /api/world-cup/matches/:id` - atualiza jogo (requer `x-admin-key`).

Exemplo de payload:
```json
{
  "date": "2026-06-11T19:00:00-06:00",
  "stadium": "Estadio Azteca",
  "homeScore": 2,
  "awayScore": 1,
  "status": "encerrado"
}
```
