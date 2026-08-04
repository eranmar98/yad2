import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUsersStore from '../store/usersStore';
import FormField from '../components/FormField';
import PillButton from '../components/PillButton';

export default function Login() {
  const navigate = useNavigate();
  const login = useUsersStore((state) => state.login);
  const isLoading = useUsersStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'משהו השתבש. נסו שוב.';
      setError(message);
    }
  };

  return (
    <section className="animate-fade-in-up mx-auto max-w-md px-6 py-16 md:py-24">
      <h1 className="text-center font-display text-3xl font-extrabold text-ink">התחברות</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <FormField
          label="אימייל"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
        <FormField
          label="סיסמה"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        {error && <p className="font-sans text-sm text-red-600">{error}</p>}

        <PillButton type="submit" variant="primary" className="mt-2 w-full" disabled={isLoading}>
          {isLoading ? 'מתחברים…' : 'התחברות'}
        </PillButton>
      </form>

      <p className="mt-6 text-center font-sans text-sm text-ink/60">
        אין לכם חשבון?{' '}
        <Link
          to="/register"
          className="rounded-sm font-semibold text-ink underline decoration-ink/30 underline-offset-4 outline-none transition-colors duration-150 ease-out hover:decoration-ink focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2"
        >
          הרשמה
        </Link>
      </p>
    </section>
  );
}
