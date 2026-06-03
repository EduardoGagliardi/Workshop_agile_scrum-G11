export function ConfigError() {
  return (
    <main
      className="auth-form-panel"
      style={{
        minHeight: '100vh',
        padding: '2rem',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ color: 'var(--blue-dark)', marginTop: 0 }}>Configuration manquante</h1>
      <p className="auth-form-subtitle">
        L&apos;application ne peut pas démarrer : les variables Supabase ne sont pas définies
        sur l&apos;hébergeur.
      </p>
      <p className="auth-form-subtitle">
        Sur <strong>Vercel</strong>, ajoutez dans{' '}
        <em>Project → Settings → Environment Variables</em> :
      </p>
      <ul className="auth-form-subtitle" style={{ lineHeight: 1.8 }}>
        <li>
          <code>VITE_SUPABASE_URL</code>
        </li>
        <li>
          <code>VITE_SUPABASE_ANON_KEY</code> (clé publishable / anon)
        </li>
      </ul>
      <p className="auth-form-subtitle">
        Cochez <strong>Production</strong> et <strong>Preview</strong>, puis redéployez le
        projet.
      </p>
    </main>
  )
}
