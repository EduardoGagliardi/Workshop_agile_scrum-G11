-- =============================================================================
-- SkillSwap — Données de démonstration (compétences, badges, sessions optionnelles)
-- =============================================================================
-- Exécuter dans : Supabase Dashboard → SQL Editor (rôle postgres)
-- Ou en local   : supabase db execute -f supabase/seed/seed_skillswap_data.sql
--
-- Réexécutable : ON CONFLICT DO NOTHING / DO UPDATE selon les tables.
-- Les profils users doivent exister dans auth.users + public.users (inscription app).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Compétences (catalogue global)
-- -----------------------------------------------------------------------------
insert into public.skills (name, category) values
  -- Développement
  ('React', 'Développement'),
  ('JavaScript', 'Développement'),
  ('TypeScript', 'Développement'),
  ('Python', 'Développement'),
  ('Java', 'Développement'),
  ('Node.js', 'Développement'),
  ('HTML/CSS', 'Développement'),
  ('Git', 'Développement'),
  ('SQL', 'Développement'),
  ('PHP', 'Développement'),
  ('C#', 'Développement'),
  ('Flutter', 'Développement'),
  -- Design
  ('Figma', 'Design'),
  ('UI/UX', 'Design'),
  ('Photoshop', 'Design'),
  ('Illustrator', 'Design'),
  ('Design System', 'Design'),
  ('Prototypage', 'Design'),
  -- Langues
  ('Anglais', 'Langues'),
  ('Espagnol', 'Langues'),
  ('Allemand', 'Langues'),
  ('Italien', 'Langues'),
  -- Bureautique & marketing
  ('Excel', 'Bureautique'),
  ('PowerPoint', 'Bureautique'),
  ('Marketing digital', 'Marketing'),
  ('SEO', 'Marketing'),
  ('Rédaction web', 'Marketing'),
  -- Soft skills & gestion
  ('Prise de parole', 'Soft skills'),
  ('Gestion de projet', 'Soft skills'),
  ('Scrum', 'Soft skills'),
  ('Travail en équipe', 'Soft skills'),
  ('Méthodologie agile', 'Soft skills'),
  -- Sciences & autres
  ('Mathématiques', 'Sciences'),
  ('Physique', 'Sciences'),
  ('Statistiques', 'Sciences'),
  ('Photographie', 'Créatif'),
  ('Montage vidéo', 'Créatif'),
  ('Musique / MAO', 'Créatif'),
  ('Cybersécurité', 'Informatique'),
  ('Linux', 'Informatique'),
  ('Réseaux', 'Informatique')
on conflict (name) do nothing;

-- -----------------------------------------------------------------------------
-- 2. Badges — progression par niveau (règle XP : niveau n → + n×500 XP)
-- -----------------------------------------------------------------------------
insert into public.badges (title, description, icon_url) values
  (
    'Bienvenue SkillSwap',
    'Vous avez rejoint la communauté — niveau 1.',
    'sparkles-outline'
  ),
  (
    'Explorateur',
    'Atteint le niveau 2 (500 XP cumulés).',
    'compass-outline'
  ),
  (
    'Apprenti actif',
    'Atteint le niveau 3 (1 500 XP cumulés).',
    'school-outline'
  ),
  (
    'Confirmé',
    'Atteint le niveau 4 (3 000 XP cumulés).',
    'ribbon-outline'
  ),
  (
    'Expert du campus',
    'Atteint le niveau 5 (5 000 XP cumulés).',
    'trophy-outline'
  ),
  (
    'Mentor étoile',
    'Atteint le niveau 6 (7 500 XP cumulés).',
    'star-outline'
  ),
  (
    'Vétéran',
    'Atteint le niveau 7 (10 500 XP cumulés).',
    'shield-checkmark-outline'
  ),
  (
    'Maître SkillSwap',
    'Atteint le niveau 8 (14 000 XP cumulés).',
    'medal-outline'
  ),
  (
    'Légende',
    'Atteint le niveau 9 (18 000 XP cumulés).',
    'flame-outline'
  ),
  (
    'Champion ultime',
    'Atteint le niveau 10 (22 500 XP cumulés).',
    'diamond-outline'
  ),
  -- Badges d''activité (hors niveau)
  (
    'Premier pas',
    'Inscription à votre première session.',
    'footsteps-outline'
  ),
  (
    'Premier cours donné',
    'Vous avez animé votre première session en tant qu''enseignant.',
    'megaphone-outline'
  ),
  (
    'Réseau actif',
    'Au moins 3 contacts acceptés sur la plateforme.',
    'people-outline'
  ),
  (
    'Marathonien',
    '10 sessions terminées (participant ou hôte).',
    'bar-chart-outline'
  ),
  (
    'Polyvalent',
    'Au moins 3 compétences différentes sur votre profil.',
    'library-outline'
  ),
  (
    'Bien noté',
    'Moyenne d''au moins 4,5/5 sur vos retours de session.',
    'thumbs-up-outline'
  )
on conflict (title) do update set
  description = excluded.description,
  icon_url = excluded.icon_url;

-- -----------------------------------------------------------------------------
-- 3. Attribuer les badges de niveau aux utilisateurs existants
-- -----------------------------------------------------------------------------
insert into public.user_badges (user_id, badge_id)
select user_row.id, badge_row.id
from public.users as user_row
cross join public.badges as badge_row
where
  (badge_row.title = 'Bienvenue SkillSwap' and user_row.level >= 1)
  or (badge_row.title = 'Explorateur' and user_row.level >= 2)
  or (badge_row.title = 'Apprenti actif' and user_row.level >= 3)
  or (badge_row.title = 'Confirmé' and user_row.level >= 4)
  or (badge_row.title = 'Expert du campus' and user_row.level >= 5)
  or (badge_row.title = 'Mentor étoile' and user_row.level >= 6)
  or (badge_row.title = 'Vétéran' and user_row.level >= 7)
  or (badge_row.title = 'Maître SkillSwap' and user_row.level >= 8)
  or (badge_row.title = 'Légende' and user_row.level >= 9)
  or (badge_row.title = 'Champion ultime' and user_row.level >= 10)
on conflict (user_id, badge_id) do nothing;

-- Badge « Polyvalent » si ≥ 3 compétences sur le profil
insert into public.user_badges (user_id, badge_id)
select user_skill_counts.user_id, polyvalent_badge.id
from (
  select user_id, count(*) as skill_count
  from public.user_skills
  group by user_id
  having count(*) >= 3
) as user_skill_counts
cross join (
  select id from public.badges where title = 'Polyvalent'
) as polyvalent_badge
on conflict (user_id, badge_id) do nothing;

-- -----------------------------------------------------------------------------
-- 4. Données de démo pour utilisateurs déjà inscrits (sessions + compétences)
-- -----------------------------------------------------------------------------
do $$
declare
  demo_host_id uuid;
  demo_learner_id uuid;
  skill_react_id bigint;
  skill_figma_id bigint;
  skill_python_id bigint;
  session_one_id uuid;
begin
  select id into demo_host_id
  from public.users
  where account_type = 'Formateur'
  order by created_at
  limit 1;

  if demo_host_id is null then
    select id into demo_host_id
    from public.users
    order by created_at
    limit 1;
  end if;

  if demo_host_id is null then
    raise notice 'Aucun utilisateur dans public.users — sessions de démo ignorées. Inscrivez-vous via l''app puis réexécutez ce script.';
    return;
  end if;

  select id into demo_learner_id
  from public.users
  where id <> demo_host_id
  order by created_at
  limit 1;

  select id into skill_react_id from public.skills where name = 'React';
  select id into skill_figma_id from public.skills where name = 'Figma';
  select id into skill_python_id from public.skills where name = 'Python';

  -- Compétences du formateur / hôte
  insert into public.user_skills (user_id, skill_id, role, level) values
    (demo_host_id, skill_react_id, 'Enseignant', 'Avancé'),
    (demo_host_id, skill_python_id, 'Enseignant', 'Intermédiaire')
  on conflict (user_id, skill_id) do update set
    role = excluded.role,
    level = excluded.level;

  if demo_learner_id is not null then
    insert into public.user_skills (user_id, skill_id, role, level) values
      (demo_learner_id, skill_figma_id, 'Apprenant', 'Débutant'),
      (demo_learner_id, skill_react_id, 'Apprenant', 'Intermédiaire')
    on conflict (user_id, skill_id) do update set
      role = excluded.role,
      level = excluded.level;
  end if;

  -- Sessions à venir (évite les doublons par titre + hôte)
  insert into public.sessions (
    title,
    description,
    type,
    status,
    scheduled_at,
    location,
    max_participants,
    host_id,
    skill_id
  )
  select
    seed.title,
    seed.description,
    seed.type::public.session_type,
    seed.status::public.session_status,
    seed.scheduled_at,
    seed.location,
    seed.max_participants,
    demo_host_id,
    seed.skill_id
  from (
    values
      (
        'Initiation React — Hooks & composants',
        'Session découverte : état, effets et composition de composants. Idéal après les bases HTML/CSS.',
        'Cours rapide',
        'Planifiée',
        (now() + interval '3 days')::timestamptz,
        'Salle B12 — Campus numérique',
        8,
        skill_react_id
      ),
      (
        'Atelier Figma — maquettes mobile',
        'Création d''un parcours utilisateur et prototypage cliquable en 2 h.',
        'Atelier collectif',
        'Planifiée',
        (now() + interval '7 days')::timestamptz,
        'En ligne — lien envoyé aux inscrits',
        12,
        skill_figma_id
      ),
      (
        'Club Python — scripts utiles',
        'Automatisation de tâches étudiantes (fichiers, CSV, petits outils).',
        'Club thématique',
        'Planifiée',
        (now() + interval '14 days')::timestamptz,
        'Bibliothèque — espace coworking',
        10,
        skill_python_id
      )
  ) as seed (title, description, type, status, scheduled_at, location, max_participants, skill_id)
  where not exists (
    select 1
    from public.sessions existing
    where existing.title = seed.title
      and existing.host_id = demo_host_id
  );

  -- Inscrire l''apprenant à la session React si possible
  if demo_learner_id is not null then
    select id into session_one_id
    from public.sessions
    where host_id = demo_host_id
      and title = 'Initiation React — Hooks & composants'
    limit 1;

    if session_one_id is not null then
      insert into public.session_registrations (session_id, user_id)
      values (session_one_id, demo_learner_id)
      on conflict (session_id, user_id) do nothing;

      insert into public.user_badges (user_id, badge_id)
      select demo_learner_id, id from public.badges where title = 'Premier pas'
      on conflict (user_id, badge_id) do nothing;
    end if;
  end if;

  -- XP de démo sur le premier utilisateur (recalcule le niveau via trigger)
  update public.users
  set experience_points = greatest(experience_points, 3200)
  where id = demo_host_id
    and experience_points < 3200;

  -- Réattribuer les badges de niveau après mise à jour XP
  insert into public.user_badges (user_id, badge_id)
  select demo_host_id, badge_row.id
  from public.badges as badge_row
  join public.users as user_row on user_row.id = demo_host_id
  where
    (badge_row.title = 'Bienvenue SkillSwap' and user_row.level >= 1)
    or (badge_row.title = 'Explorateur' and user_row.level >= 2)
    or (badge_row.title = 'Apprenti actif' and user_row.level >= 3)
    or (badge_row.title = 'Confirmé' and user_row.level >= 4)
    or (badge_row.title = 'Expert du campus' and user_row.level >= 5)
    or (badge_row.title = 'Mentor étoile' and user_row.level >= 6)
  on conflict (user_id, badge_id) do nothing;

  raise notice 'Données de démo appliquées pour l''utilisateur hôte %', demo_host_id;
end $$;

commit;

-- -----------------------------------------------------------------------------
-- Vérification rapide
-- -----------------------------------------------------------------------------
-- select count(*) as skills from public.skills;
-- select count(*) as badges from public.badges;
-- select title, level, experience_points from public.users order by created_at;
-- select u.first_name, b.title from public.user_badges ub join public.users u on u.id = ub.user_id join public.badges b on b.id = ub.badge_id;
