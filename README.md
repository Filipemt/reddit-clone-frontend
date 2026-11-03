# reddit-clone-frontend

SPA Angular 20 que consome a API do Clone Reddit.

## Stack

- Angular 20 (standalone components)
- TypeScript + SCSS
- SPA (sem SSR)
- Proxy de desenvolvimento → `http://localhost:8080`

## Estrutura

```
src/app/
  core/        # auth, interceptors, guards, layout
  shared/      # UI/pipes/directives/models reutilizáveis
  features/    # auth, user, community, post, comment, vote, search, notification
```

## Desenvolvimento

```bash
npm start
```

Abre em `http://localhost:4200`. Chamadas para `/api/*` são reescritas para a API em `:8080`.

```bash
npm run build
npm test
```

## Environments

- `src/environments/environment.ts` — produção (`apiUrl: '/api'`)
- `src/environments/environment.development.ts` — desenvolvimento
