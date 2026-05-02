'use client';

import { FormEvent, useEffect, useState } from 'react';

import { createInvite, getInvites } from '@/lib/invites';
import type { OrganizationInvite, UserRole } from '@/types/invite';

export default function InvitesPage() {
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('MEMBER');
  const [latestInviteUrl, setLatestInviteUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadInvites() {
      try {
        const data = await getInvites();
        setInvites(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invites');
      } finally {
        setIsLoading(false);
      }
    }

    loadInvites();
  }, []);

  async function handleCreateInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setLatestInviteUrl('');
    setIsCreating(true);

    try {
      const invite = await createInvite({
        email,
        role,
      });

      const { token, inviteUrl, ...inviteListItem } = invite;

      setInvites((current) => [inviteListItem, ...current]);
      setLatestInviteUrl(`${window.location.origin}${inviteUrl}`);
      setEmail('');
      setRole('MEMBER');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Organization
        </p>
        <h1 className="text-3xl font-bold">Invites</h1>
        <p className="mt-2 text-slate-400">
          Invite teammates into your Smart Tracker organization.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Create Invite</h2>

        <form
          onSubmit={handleCreateInvite}
          className="grid gap-4 md:grid-cols-[1fr_180px_auto]"
        >
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-400"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@company.com"
            type="email"
            required
          />

          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-400"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            <option value="MEMBER">MEMBER</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <button
            className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCreating}
            type="submit"
          >
            {isCreating ? 'Creating...' : 'Invite'}
          </button>
        </form>

        {latestInviteUrl ? (
          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4">
            <p className="mb-2 text-sm font-semibold">Temporary invite link</p>
            <p className="break-all text-sm text-slate-300">
              {latestInviteUrl}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Email sending comes later. For now, copy this link manually.
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Invites</h2>

        {isLoading ? (
          <p className="text-slate-400">Loading invites...</p>
        ) : invites.length === 0 ? (
          <p className="text-slate-400">No invites yet.</p>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{invite.email}</p>
                    <p className="text-sm text-slate-400">{invite.role}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-300">
                      {invite.status}
                    </p>
                    <p className="text-xs text-slate-500">
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}