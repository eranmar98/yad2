import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUsersStore from '../store/usersStore';
import FormField from '../components/FormField';
import PillButton from '../components/PillButton';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
};

export default function Register() {
  const navigate = useNavigate();
  const register = useUsersStore((state) => state.register);
  const isLoading = useUsersStore((state) => state.isLoading);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await register(form);
      navigate('/login');
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
      <h1 className="text-center font-display text-3xl font-extrabold text-ink">הרשמה</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="שם פרטי" required value={form.firstName} onChange={updateField('firstName')} />
          <FormField label="שם משפחה" required value={form.lastName} onChange={updateField('lastName')} />
        </div>
        <FormField
          label="אימייל"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={updateField('email')}
        />
        <FormField
          label="טלפון"
          type="tel"
          required
          placeholder="05XXXXXXXX"
          autoComplete="tel"
          value={form.phone}
          onChange={updateField('phone')}
        />
        <FormField
          label="סיסמה"
          type="password"
          required
          autoComplete="new-password"
          value={form.password}
          onChange={updateField('password')}
        />

        {error && <p className="font-sans text-sm text-red-600">{error}</p>}

        <PillButton type="submit" variant="primary" className="mt-2 w-full" disabled={isLoading}>
          {isLoading ? 'נרשמים…' : 'הרשמה'}
        </PillButton>
      </form>

      <p className="mt-6 text-center font-sans text-sm text-ink/60">
        כבר יש לכם חשבון?{' '}
        <Link
          to="/login"
          className="rounded-sm font-semibold text-ink underline decoration-ink/30 underline-offset-4 outline-none transition-colors duration-150 ease-out hover:decoration-ink focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2"
        >
          התחברות
        </Link>
      </p>
    </section>
  );
}
