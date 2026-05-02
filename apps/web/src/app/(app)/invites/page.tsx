'use client';

import { FormEvent, useEffect, useState } from 'react';

import { createInvite, getInvites } from '@/lib/invites';
import { getOrganizationMembers } from '@/lib/organizations';
import type { OrganizationMember } from '@/types/organization';
import type { OrganizationInvite, UserRole } from '@/types/invite';

export default function InvitesPage() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('MEMBER');
  const [latestInviteUrl, setLatestInviteUrl] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadTeamData() {
      try {
        const [membersData, invitesData] = await Promise.all([
          getOrganizationMembers(),
          getInvites(),
        ]);

        setMembers(membersData);
        setInvites(invitesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team data');
      } finally {
        setIsLoading(false);
      }
    }

    loadTeamData();
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

  const pendingInvites = invites.filter((invite) => invite.status === 'PENDING');
  const acceptedInvites = invites.filter((invite) => invite.status === 'ACCEPTED');

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Organization
        </p>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="mt-2 text-slate-400">
          Manage your organization members and teammate invites.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Members" value={members.length} />
        <SummaryCard label="Pending Invites" value={pendingInvites.length} />
        <SummaryCard label="Accepted Invites" value={acceptedInvites.length} />
      </section>

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
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold">
                  Temporary invite link
                </p>
                <p className="break-all text-sm text-slate-300">
                  {latestInviteUrl}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Email sending comes later. For now, copy this link manually.
                </p>
              </div>

              <button
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                type="button"
                onClick={() => navigator.clipboard.writeText(latestInviteUrl)}
              >
                Copy
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Members</h2>

        {isLoading ? (
          <p className="text-slate-400">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-slate-400">No members found.</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.email}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-300">
                      {member.role}
                    </p>
                    <p className="text-xs text-slate-500">
                      Joined {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                    <StatusBadge status={invite.status} />
                    <p className="mt-1 text-xs text-slate-500">
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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: OrganizationInvite['status'] }) {
  const classNameByStatus: Record<OrganizationInvite['status'], string> = {
    PENDING: 'border-yellow-800 bg-yellow-950 text-yellow-300',
    ACCEPTED: 'border-green-800 bg-green-950 text-green-300',
    EXPIRED: 'border-slate-700 bg-slate-900 text-slate-300',
    CANCELED: 'border-red-800 bg-red-950 text-red-300',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classNameByStatus[status]}`}
    >
      {status}
    </span>
  );
}