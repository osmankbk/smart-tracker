'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';
import { createOrder, getOrders } from '@/lib/orders';
import type { AuthUser } from '@/types/auth';
import type { Order, OrderPriority } from '@/types/order';

const priorities: OrderPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

export default function OrdersPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<OrderPriority>('MEDIUM');

  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPageData() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          router.push('/login');
          return;
        }

        setUser(currentUser);

        const orderList = await getOrders();
        setOrders(orderList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setIsLoadingUser(false);
        setIsLoadingOrders(false);
      }
    }

    loadPageData();
  }, [router]);

  async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setIsCreating(true);

    try {
      const newOrder = await createOrder({
        title,
        description: description || undefined,
        priority,
      });

      setOrders((currentOrders) => [newOrder, ...currentOrders]);

      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoadingUser) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-400">Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Smart Tracker
            </p>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="mt-2 text-slate-400">
              Create and track operational work through its lifecycle.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
            >
              Dashboard
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
            >
              Home
            </Link>
          </div>
        </div>

        {user ? (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
            Signed in as{' '}
            <span className="font-semibold text-white">{user.email}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Create Order</h2>

            <form onSubmit={handleCreateOrder} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Title</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-400"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Inventory audit"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-400"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add extra context..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Priority
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-400"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as OrderPriority)
                  }
                >
                  {priorities.map((priorityOption) => (
                    <option key={priorityOption} value={priorityOption}>
                      {priorityOption}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCreating}
                type="submit"
              >
                {isCreating ? 'Creating...' : 'Create Order'}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Order List</h2>
              <p className="text-sm text-slate-400">
                {orders.length} total
              </p>
            </div>

            {isLoadingOrders ? (
              <p className="text-slate-400">Loading order list...</p>
            ) : orders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
                <p className="font-medium">No orders yet</p>
                <p className="mt-2 text-sm text-slate-400">
                  Create your first order to start tracking work.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {order.title}
                        </h3>

                        {order.description ? (
                          <p className="mt-1 text-sm text-slate-400">
                            {order.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex gap-2">
                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                          {order.status}
                        </span>
                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                          {order.priority}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-400 md:grid-cols-2">
                      <p>
                        Created by:{' '}
                        <span className="text-slate-200">
                          {order.createdBy?.email ?? 'Unknown'}
                        </span>
                      </p>

                      <p>
                        Assignee:{' '}
                        <span className="text-slate-200">
                          {order.assignee?.email ?? 'Unassigned'}
                        </span>
                      </p>

                      <p>
                        Created:{' '}
                        <span className="text-slate-200">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </p>

                      <p>
                        Updated:{' '}
                        <span className="text-slate-200">
                          {new Date(order.updatedAt).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}