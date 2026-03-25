import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodePayload(token: string): User | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64);
    const payload = JSON.parse(json);
    return {
      id: payload.sub,
      email: payload.email,
      ...(typeof payload.name === 'string' && payload.name
        ? { name: payload.name }
        : {}),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token'),
  );

  // Derive user from token on every render so login + navigate to /dashboard
  // never sees stale null user (useEffect ran too late before).
  const user = token ? decodePayload(token) : null;

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (t: string) => setToken(t);
  const logout = () => setToken(null);

  return (
    <AuthContext value={{ user, token, login, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
