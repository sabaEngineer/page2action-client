import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      login(token);
      navigate('/books', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [params, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
      Signing you in…
    </div>
  );
}
