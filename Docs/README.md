# Documentation SkillSwap — G11

Index des documents du projet **SkillSwap** (workshop agile / Scrum).

## Documentation technique (application)

| Fichier | Description |
|---------|-------------|
| [**documentation-technique.md**](./documentation-technique.md) | Guide technique complet : stack, architecture, auth, Supabase, BDD, setup, build, état d’avancement |

## Architecture et données

| Fichier | Description |
|---------|-------------|
| [justification-architecture.md](./justification-architecture.md) | Justification stack (React, Supabase, mobile-ready) |
| [shema mcp_database.md](./shema%20mcp_database.md) | MPD, user stories, règles métier |
| [fiche-analyse-besoins-competences.md](./fiche-analyse-besoins-competences.md) | Analyse des besoins en compétences |

## Maquettes et schémas

| Ressource | Description |
|-----------|-------------|
| `MAQUETTES SKILLSWAP.fig` | Fichier Figma |
| `Shema_Skills.png`, `Shema_mcp.png`, `User Stories.png` | Schémas projet |

## Code source

L’application web se trouve dans [`../web/`](../web/). Point d’entrée développement :

```bash
cd web
npm install
npm run dev
```

Variables requises : voir [documentation-technique.md §11](./documentation-technique.md#11-configuration-et-variables-denvironnement).
