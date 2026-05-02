'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { acceptInvite, previewInvite } from '@/lib/invites';
import type { InvitePreview } from '@/types/invite';

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { setAuth } = useAuth();

  const token = params.token as string;

  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      try {
        const data = await previewInvite(token);
        setInvite(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invite');
      } finally {
        setIsLoadingInvite(false);
      }
    }

    loadInvite();
  }, [token]);

  async function handleAcceptInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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

  if (isLoadingInvite) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-md text-slate-400">
          Loading invite...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-bold">Accept Invite</h1>

        {invite ? (
          <p className="mb-8 text-slate-400">
            Create your account and join{' '}
            <span className="font-semibold text-white">
              {invite.organization.name}
            </span>{' '}
            as {invite.role}.
          </p>
        ) : (
          <p className="mb-8 text-slate-400">
            Create your account and join the organization.
          </p>
        )}

        {error ? (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {invite ? (
          <form
            onSubmit={handleAcceptInvite}
            className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              <p>
                Invited email:{' '}
                <span className="font-medium text-white">{invite.email}</span>
              </p>
              <p className="mt-1">
                Expires:{' '}
                <span className="font-medium text-white">
                  {new Date(invite.expiresAt).toLocaleDateString()}
                </span>
              </p>
            </div>

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
                minLength={8}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Confirm Password
              </label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-400"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                required
                minLength={8}
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
        ) : null}
      </div>
    </main>
  );
}