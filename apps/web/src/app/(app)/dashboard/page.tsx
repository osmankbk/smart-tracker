'use client';

import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-slate-400">
          Track operational work, ownership, and progress from one workspace.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Current User</h2>

        {user ? (
          <div className="space-y-2 text-slate-300">
            <p>
              <span className="font-semibold text-white">ID:</span> {user.id}
            </p>
            <p>
              <span className="font-semibold text-white">Email:</span>{' '}
              {user.email}
            </p>
            <p>
              <span className="font-semibold text-white">Role:</span>{' '}
              {user.role}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}