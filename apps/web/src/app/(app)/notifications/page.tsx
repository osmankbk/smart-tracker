'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  getNotifications,
  markNotificationAsRead,
} from '@/lib/notifications';
import type { Notification } from '@/types/notification';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load notifications',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();
  }, []);

  async function handleMarkAsRead(notification: Notification) {
    try {
      await markNotificationAsRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to mark notification as read',
      );
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Notifications
        </p>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="mt-2 text-slate-400">
          Mentions and important work updates that need your attention.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-slate-400">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
          <p className="font-medium">No notifications yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Mentions and alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-xl border p-5 ${
                notification.readAt
                  ? 'border-slate-800 bg-slate-900'
                  : 'border-slate-600 bg-slate-950'
              }`}
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{notification.title}</h2>
                  {notification.body ? (
                    <p className="mt-1 text-sm text-slate-400">
                      {notification.body}
                    </p>
                  ) : null}
                </div>

                <p className="text-xs text-slate-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>

              {notification.comment?.body ? (
                <p className="mb-4 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  {notification.comment.body}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {notification.orderId ? (
                  <Link
                    href={`/orders/${notification.orderId}`}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                  >
                    View order
                  </Link>
                ) : null}

                {!notification.readAt ? (
                  <button
                    onClick={() => handleMarkAsRead(notification)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900"
                    type="button"
                  >
                    Mark as read
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}