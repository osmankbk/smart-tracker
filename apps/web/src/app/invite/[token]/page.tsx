'use client';

import { FormEvent, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { acceptInvite } from '@/lib/invites';

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { setAuth } = useAuth();

  const token = params.token as string;

  const [name, setName] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  async function handleAcceptInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setIsAccepting(true);

    try {
      const authResponse = await acceptInvite(token, {
        name,
        password,
      });

      setAuth(authResponse);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-bold">Accept Invite</h1>
        <p className="mb-8 text-slate-400">
          Create your account and join the organization.
        </p>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleAcceptInvite}
          className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-400"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-400"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </div>

          <button
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isAccepting}
            type="submit"
          >
            {isAccepting ? 'Joining...' : 'Join Organization'}
          </button>
        </form>
      </div>
    </main>
  );
}