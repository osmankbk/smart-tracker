'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getCurrentUser, logout } from '@/lib/auth';
import type { AuthUser } from '@/types/auth';

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          router.push('/login');
          return;
        }

        setUser(currentUser);
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-slate-400">
              Welcome to your Smart Tracker workspace.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
            type="button"
          >
            Log out
          </button>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>

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
    </main>
  );
}