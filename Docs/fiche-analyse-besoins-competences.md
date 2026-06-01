# Fiche d'analyse des besoins — Compétences techniques & soft skills

**Document :** livrable Jour 1 — analyse des besoins en compétences  
**Projet :** SkillSwap — échange de compétences entre étudiants (campus)  
**Équipe :** G11  
**Références :** `Docs/justification-architecture.md`, `Docs/shema mcp_database.md`, sujet workshop SkillSwap

---

## 1. Objet et périmètre de l'analyse

Cette fiche identifie et formalise les **compétences techniques indispensables** et les **soft skills** nécessaires pour concevoir, développer et livrer SkillSwap dans le cadre du workshop (3 jours de production + soutenance).

Elle sert à :

- aligner la **répartition des rôles** MOA/MOE et le staffing sur le backlog Trello ;
- anticiper les **lacunes** de l'équipe et les actions de montée en compétence ;
- justifier le **plan de staffing technique** demandé aux groupes avec profil développeur ;
- nourrir le **budget estimatif** (TJM, charge en jours par profil).

**Stack retenue par l'équipe G11** (cf. note d'architecture) : **React + TypeScript + shadcn/ui + Tailwind**, **Supabase** (PostgreSQL, Auth, RLS, Edge Functions), **Git** — architecture découplée, évolutive vers le mobile, **sans serveur applicatif dédié**.

---

## 2. Synthèse du besoin métier → besoin technique

| Domaine fonctionnel (brief) | Besoin technique associé | Criticité |
|----------------------------|--------------------------|-----------|
| Profil étudiant (compétences, niveaux, dispos) | Modélisation relationnelle, CRUD sécurisé, formulaires complexes, JSON | **Indispensable** |
| Auth email académique (réseau de confiance) | Supabase Auth, validation domaine, gestion session JWT | **Indispensable** |
| Recherche & matching par catégories | Requêtes filtrées, index SQL, Edge Function de matching | **Indispensable** |
| Sessions (ateliers, cours, clubs) | CRUD sessions, statuts, contraintes d'inscription | **Indispensable** |
| Gamification (points, badges) | Triggers SQL ou Edge Functions, règles métier atomiques | **Indispensable** |
| Feed / feedbacks entre pairs | Relations N-N, modération implicite via RLS | **Important** |
| Évolutivité mobile | API/SDK unique, RLS côté serveur, UI responsive | **Indispensable** |
| Pilotage Agile (3 sprints) | Trello, Git, documentation, CR client | **Indispensable** (livrable) |

---

## 3. Compétences techniques indispensables

Les compétences ci-dessous sont classées par **domaine**, avec un **niveau minimum attendu** sur l'échelle : *Notions* → *Autonome* → *Référent*.

### 3.1 Frontend — React & interface

| Compétence | Description | Niveau min. | Justification SkillSwap |
|------------|-------------|-------------|-------------------------|
| **HTML / sémantique** | Structure accessible des pages | Autonome | Base de toute intégration ; formulaires profil, sessions |
| **CSS responsive & mobile-first** | Grilles, breakpoints, touch targets | Autonome | Contrainte brief : site prêt pour évolution mobile |
| **JavaScript ES6+** | Async/await, destructuring, modules | Autonome | Prérequis TypeScript et SDK Supabase |
| **React (composants, hooks)** | `useState`, `useEffect`, composition, routing | Autonome | Tous les écrans (profil, recherche, sessions, gamification) |
| **TypeScript** | Types, interfaces, génériques de base | Autonome | Typage client Supabase, réduction des bugs en 3 jours |
| **Tailwind CSS** | Utility-first, design responsive | Autonome | Stack shadcn ; cohérence visuelle rapide |
| **shadcn/ui & Radix** | Installation, composition, accessibilité | Notions → Autonome | Formulaires, dialogs, navigation (US 01–08) |
| **Gestion d'état serveur** | TanStack Query (cache, mutations, loading/error) | Notions → Autonome | Listes sessions, profil, matching sans sur-fetch |
| **Routing SPA** | React Router (ou équivalent) | Autonome | Parcours inscription → profil → sessions |
| **Intégration API client** | `@supabase/supabase-js`, gestion erreurs HTTP | Autonome | Point d'accès unique `lib/supabase.ts` |

### 3.2 Backend managé — Supabase & PostgreSQL

| Compétence | Description | Niveau min. | Justification SkillSwap |
|------------|-------------|-------------|-------------------------|
| **Modélisation relationnelle (MPD)** | Tables, FK, enums, cardinalités | Autonome | 8 entités : users, skills, sessions, badges, feedbacks… |
| **SQL PostgreSQL** | `SELECT`, `JOIN`, `INSERT`, contraintes, enums | Autonome | Migrations, seeds compétences, requêtes métier |
| **Migrations Supabase** | Fichiers SQL versionnés, `supabase db push` | Notions → Autonome | Implémentation du MPD en environnement partagé |
| **Supabase Auth** | Inscription, connexion, `auth.uid()`, sessions | Autonome | US 01 — email académique |
| **Row Level Security (RLS)** | Policies `SELECT`/`INSERT`/`UPDATE`/`DELETE` | Autonome | Sécurité pair-à-pair ; non négociable |
| **PostgREST / API auto** | Exposition tables, filtres, relations | Notions → Autonome | CRUD profil, sessions, inscriptions |
| **Edge Functions (Deno/TS)** | `serve`, validation, appels DB service role | Notions → Autonome | Matching (US 04), points/badges (US 07), inscription (US 06) |
| **Triggers / RPC SQL** | `updated_at`, compteurs, règles simples | Notions | Alternative aux Edge Functions pour règles atomiques |
| **Supabase Storage** (optionnel) | Buckets, policies, URLs signées | Notions | Avatars, icônes badges |
| **Realtime** (optionnel) | Subscriptions sur tables | Notions | Feed live, places restantes sur une session |

> **Compétence transversale critique :** ne jamais exposer la clé `service_role` dans le frontend ; comprendre la différence **publishable (anon)** vs **service**.

### 3.3 DevOps, outillage & qualité

| Compétence | Description | Niveau min. | Justification SkillSwap |
|------------|-------------|-------------|-------------------------|
| **Git & GitHub/GitLab** | Branches, PR, `.gitignore`, conflits | Autonome | Livrable Jour 1 ; travail parallèle en équipe |
| **Variables d'environnement** | `.env`, secrets non commités | Autonome | URL Supabase, clé publishable |
| **Déploiement front statique** | Vercel / Netlify / Pages (selon choix) | Notions → Autonome | Documentation technique Jour 3 |
| **CLI Supabase** | `login`, `link`, `db`, `functions deploy` | Notions → Autonome | Migrations et Edge Functions |
| **Tests manuels / parcours** | Scénarios bout-en-bout par US | Autonome | Délai court : prioriser tests E2E manuels documentés |
| **Lint / format** | ESLint, Prettier (si configuré) | Notions | Homogénéité du code en équipe |

### 3.4 Architecture & conception (transversal)

| Compétence | Description | Niveau min. | Justification SkillSwap |
|------------|-------------|-------------|-------------------------|
| **Architecture découplée (client / API / données)** | Séparation UI, règles serveur, persistance | Autonome | Contrainte jury : mobile-ready |
| **REST & ressources** | Verbes HTTP, codes statut, idempotence | Notions → Autonome | API PostgREST + Edge Functions |
| **Sécurité web de base** | XSS, CSRF (contexte SPA), auth par token | Notions → Autonome | Données étudiants, feedbacks |
| **Accessibilité (a11y)** | Labels, focus, contrastes (Radix/shadcn) | Notions | Profils variés sur campus |
| **Préparation mobile** | Réutilisation SDK, même schéma RLS | Notions | Phase 2 React Native / Expo |

### 3.5 Gestion de projet & documentation (technique)

| Compétence | Description | Niveau min. | Justification SkillSwap |
|------------|-------------|-------------|-------------------------|
| **Scrum / Kanban (Trello)** | Backlog, sprints, DoD, assignation | Autonome | Outil imposé — 3 sprints / 3 jours |
| **Rédaction technique** | README, guide déploiement, CR | Autonome | Livrables Jour 1 et 3 |
| **Estimation (jours / points)** | Décomposition tâches, charge | Autonome | Budget, tableau de charge |
| **User stories → tâches techniques** | Découpage Epic → Dev tasks | Autonome | Lien backlog ↔ MPD ↔ stack |

---

## 4. Cartographie compétences ↔ user stories

| US | Intitulé | Compétences techniques clés |
|----|----------|----------------------------|
| **US 01** | Connexion email académique | Supabase Auth, React forms, RLS sur `profiles` |
| **US 02** | Profil (compétences, niveaux, dispos) | SQL / JSON, shadcn Form, multi-select, RLS update own |
| **US 03** | Recherche par catégories | SQL `WHERE`, filtres UI, index sur `skills.category` |
| **US 04** | Matching automatique | Edge Function, algorithme de scoring, TypeScript |
| **US 05** | Création de session | Insert `sessions`, enums, Calendar/Dialog shadcn |
| **US 06** | Inscription à une session | RLS, contrainte `max_participants`, Edge Function optionnelle |
| **US 07** | Points & badges | Trigger ou Edge Function, tables `badges` / `user_badges` |
| **US 08** | Feedback écrit | Insert `feedbacks`, validation note 1–5, Card/Textarea |

---

## 5. Profils à mobiliser (staffing technique)

Pour une équipe de **5 à 6 personnes** avec stack **React + Supabase**, répartition type recommandée :

| Profil | Rôle principal | Compétences dominantes | Charge indicative (3 j) |
|--------|----------------|------------------------|-------------------------|
| **Lead technique / architecte** | Choix stack, revue RLS, découpage technique | Architecture, PostgreSQL, RLS, Git | 20–30 % du temps équipe |
| **Développeur·se frontend** (×1–2) | Écrans React, shadcn, parcours utilisateur | React, TS, Tailwind, TanStack Query | 35–45 % |
| **Développeur·se data / Supabase** | Migrations, policies, Edge Functions | SQL, RLS, Auth, Deno | 25–35 % |
| **Intégrateur·rice / UI** | Responsive, cohérence visuelle, a11y de base | CSS, shadcn, composants | 15–25 % (peut fusionner avec front) |
| **Scrum Master / pilotage** | Trello, CR, planning, blocages | Agile, communication, rédaction | Transversal (10–20 %) |
| **MOA / produit** | Priorisation backlog, critères d'acceptation | User stories, tests métier | Transversal (10–15 %) |

### Matrice RACI simplifiée (volet technique)

| Activité | Lead tech | Front | Supabase | MOA | SM |
|----------|-----------|-------|----------|-----|-----|
| Schéma BDD + migrations | **A** | C | **R** | I | I |
| Policies RLS | **A** | I | **R** | C | I |
| Edge Functions (matching, points) | **A** | C | **R** | I | I |
| Écrans React (features) | C | **R** | I | C | I |
| Auth & profil | C | **R** | **R** | C | I |
| Déploiement & doc technique | **A** | **R** | C | I | C |
| Trello / sprints | I | C | C | C | **R** |

*Légende : **R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed*

---

## 6. Soft skills indispensables

| Soft skill | Manifestation attendue sur SkillSwap | Criticité |
|------------|--------------------------------------|-----------|
| **Communication claire** | CR client quotidiens, synchro courte matin/soir | Indispensable |
| **Travail en équipe** | Revues de code, pair programming sur RLS / Edge Functions | Indispensable |
| **Autonomie & prise d'initiative** | Débloquer une migration ou une policy sans attendre 24 h | Indispensable |
| **Rigueur documentaire** | README, guide déploiement, justification des choix | Indispensable (évaluation) |
| **Gestion du temps** | Respect des 3 sprints ; arbitrage scope si retard | Indispensable |
| **Esprit de synthèse** | Pitch jury : valeur SkillSwap + choix techniques en 30 s | Important |
| **Écoute du « client »** | Intégration retours formateurs après chaque RDV | Indispensable |
| **Résolution collaborative des conflits** | Note Jour 3 sur flux MOA/MOE et blocages | Important |
| **Curiosité technique** | Lecture doc Supabase / shadcn plutôt que réinvention | Important |

---

## 7. Analyse des écarts (template équipe G11)

À compléter en équipe lors du Jour 1 :

| Compétence | Niveau requis | Niveau actuel équipe (1–3) | Écart | Action |
|------------|---------------|----------------------------|-------|--------|
| RLS PostgreSQL | Autonome | _à remplir_ | | Pairing avec lead / tuto Supabase RLS |
| Edge Functions Deno | Notions → Autonome | _à remplir_ | | PoC `match-students` en 2 h |
| shadcn/ui | Autonome | _à remplir_ | | Copier patterns doc officielle |
| TanStack Query | Notions → Autonome | _à remplir_ | | 1 écran pilote (liste sessions) |
| … | | | | |

**Échelle suggérée :** 1 = Notions, 2 = Autonome, 3 = Référent.

---

## 8. Compétences secondaires (souhaitables, non bloquantes)

| Compétence | Intérêt pour SkillSwap |
|------------|------------------------|
| React Native / Expo | Phase mobile post-workshop |
| Tests automatisés (Vitest, Playwright) | Régression si maintenance prolongée |
| CI/CD (GitHub Actions) | Déploiement automatique front + functions |
| Figma / prototypage | Groupes mixtes MOA ; optionnel si intégration directe |
| PHP/Symfony ou WordPress | Alternatives du brief — **non retenues** par G11 (cf. justification architecture) |

---

## 9. Plan de montée en compétence express (workshop 3 jours)

| Jour | Focus compétences | Livrable associé |
|------|-------------------|------------------|
| **Jour 1** | Git, Supabase projet, schéma + RLS de base, init React/shadcn | Ce document, Trello, note architecture |
| **Jour 2** | Features cœur (auth, profil, sessions), Edge Function matching | Budget technique, RACI à jour |
| **Jour 3** | Gamification, feedbacks, déploiement, doc workflows | Guide technique, note flux MOA/MOE |

**Ressources prioritaires :**

- [Supabase Docs](https://supabase.com/docs) — Auth, Database, RLS, Edge Functions  
- [shadcn/ui](https://ui.shadcn.com) — Composants et exemples  
- [TanStack Query](https://tanstack.com/query) — Fetching et cache  
- Documents projet : `Docs/justification-architecture.md`, `Docs/shema mcp_database.md`

---

## 10. Synthèse exécutive

Pour livrer SkillSwap avec la stack **React + Supabase** dans le délai du workshop, l'équipe doit disposer au minimum de :

1. **Un référent data/sécurité** maîtrisant **PostgreSQL + RLS + Auth** — sans quoi les données étudiants ne sont pas protégées correctement.  
2. **Un ou deux développeurs frontend** autonomes sur **React, TypeScript et intégration SDK** — pour couvrir les 8 user stories côté interface.  
3. **Des notions solides en Edge Functions** pour le **matching** et la **gamification** — logique métier non déléguable au seul client.  
4. **Des soft skills de pilotage Agile** — Trello, CR, communication client — au même titre que les compétences code.

Les compétences **PHP/Symfony ou CMS** mentionnées dans le sujet générique ne sont **pas requises** pour G11 : elles ont été écartées au profit d'une stack API-first et mobile-ready, comme documenté dans la note d'architecture.

---

## 11. Références

- Sujet workshop — *SkillSwap* (livrable : fiche compétences techniques et soft skills).  
- `Docs/justification-architecture.md` — stack et répartition des responsabilités.  
- `Docs/shema mcp_database.md` — backlog, MPD, epics.  
- `Docs/Sujet Workshop - SkillSwap.pdf` — périmètre fonctionnel et livrables groupe développeur.

---

*Document rédigé dans le cadre du livrable Jour 1 — fiche d'analyse des besoins en compétences techniques et soft skills (équipe G11).*
