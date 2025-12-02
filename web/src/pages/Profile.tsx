import React, { useEffect, useState } from 'react';
import { getStoredToken, getStoredUser } from '../services/githubAuthService';
import type { GitHubUser } from '../services/githubAuthService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setToken(data.accessToken ?? null);
          if (data && data.login) {
            setUser({
              id: data.id,
              login: data.login,
              name: data.name ?? null,
              avatar_url: data.avatar_url ?? '',
              email: data.email ?? null,
            });
            return;
          }
        }
      } catch (err) {
        // fallback to client-side storage
        setToken(getStoredToken());
        setUser(getStoredUser());
      }
    };

    fetchMe();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/auth/signout', { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    logout();
    navigate('/');
  };

  return (
    <div className="prose">
      <h1>Profile</h1>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={user.avatar_url} alt={user.login} style={{ width: 64, height: 64, borderRadius: 8 }} />
          <div>
            <div><strong>Username:</strong> {user.login}</div>
            {user.name && <div><strong>Name:</strong> {user.name}</div>}
            {user.email && <div><strong>Email:</strong> {user.email}</div>}
          </div>
        </div>
      ) : (
        <div>You are not signed in with GitHub.</div>
      )}

      <section style={{ marginTop: 20 }}>
        <h2>Stored token</h2>
        {token ? (
          <div>
            <div><strong>Raw token:</strong></div>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxWidth: '100%' }}>{token}</pre>
            <div style={{ marginTop: 8 }}>
              <button onClick={handleSignOut} style={{ padding: '8px 12px' }}>Sign out</button>
            </div>
          </div>
        ) : (
          <div>No token stored.</div>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Stored user (raw JSON)</h2>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{user ? JSON.stringify(user, null, 2) : 'null'}</pre>
      </section>
    </div>
  );
}
