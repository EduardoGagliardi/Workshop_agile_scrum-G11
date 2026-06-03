# Seed SkillSwap

Fichier principal : **`seed_skillswap_data.sql`**

## Contenu

| Section | Description |
|---------|-------------|
| Compétences | ~40 skills (React, Figma, Python, langues, soft skills…) |
| Badges | 10 badges de **niveau** (1→10) + 6 badges d’**activité** |
| Utilisateurs existants | Attribution automatique des badges selon `users.level` |
| Démo | Sessions, `user_skills`, XP (3 200) si au moins 1 profil existe |

## Exécution

**Supabase Dashboard (production)**  
SQL Editor → coller / exécuter `seed_skillswap_data.sql`

**CLI locale**

```bash
cd web
supabase db execute -f supabase/seed/seed_skillswap_data.sql
```

Ou après reset avec migrations :

```bash
supabase db reset
```

(`config.toml` référence déjà ce fichier dans `[db.seed]`.)

## Prérequis

- Migration `20260602154716_setup_skillswap_database.sql` appliquée.
- Pour sessions / inscriptions de démo : au moins **un compte inscrit** via l’app (`public.users`).

## Règle XP (rappel)

Passer au niveau `n` coûte `(n-1) × 500` XP supplémentaires (500, puis 1000, puis 1500…).
