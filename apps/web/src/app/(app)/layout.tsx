'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { getNotifications } from '@/lib/notifications';
import type { Notification } from '@/types/notification';

import { useAuth } from '@/hooks/use-auth';

type AppLayoutProps = {
  children: ReactNode;
};

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
  },
  {
    href: '/orders',
    label: 'Orders',
  },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt,
  ).length;

  useEffect(() => {
    async function loadNotifications() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const notificationList = await getNotifications();
        setNotifications(notificationList);
      } catch {
        setNotifications([]);
      }
    }

    loadNotifications();
  }, [isAuthenticated]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-400">Loading workspace...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link href="/dashboard" className="text-lg font-bold">
              Smart Tracker
            </Link>
            <p className="text-sm text-slate-400">
              Operational work tracking
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-white text-slate-950'
                      : 'border border-slate-700 text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/invites"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
            >
             Invites
            </Link>
             
            <Link
              href="/notifications"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
            >
              Notifications
              {unreadCount > 0 ? ` (${unreadCount})` : ''}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium">{user.email}</p>
                <p className="text-slate-400">{user.role}</p>
              </div>
            ) : null}

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
              type="button"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </main>
  );
}