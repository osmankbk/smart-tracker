'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

import { createOrder, getOrders, updateOrder, cancelOrder } from '@/lib/orders';
import type { Order, OrderPriority, OrderStatus } from '@/types/order';

import { getDefaultWorkflow } from '@/lib/workflows';
import type { WorkflowStatus } from '@/types/workflow';

const statusOptions: OrderStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE'];
const priorities: OrderPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [workflowStatuses, setWorkflowStatuses] = useState<WorkflowStatus[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<OrderPriority>('MEDIUM');

  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPageData() {
      try {
        const [orderList, workflow] = await Promise.all([
          getOrders(),
          getDefaultWorkflow(),
        ]);

        setOrders(orderList);
        setWorkflowStatuses(workflow.statuses);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load orders and workflow data',
        );
      } finally {
        setIsLoadingOrders(false);
      }
    }

    loadPageData();
  }, []);

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

      setOrders((current) => [newOrder, ...current]);

      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create order',
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleStatusChange(orderId: string, statusId: string) {
    setError('');

    try {
      const updatedOrder = await updateOrder(orderId, {
        statusId,
      });

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? updatedOrder : order,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    }
  }

  async function handleCancelOrder(orderId: string) {
    const shouldCancel = window.confirm(
      'Are you sure you want to cancel this order?',
    );

    if (!shouldCancel) {
      return;
    }

    setError('');

    try {
      const updatedOrder = await cancelOrder(orderId);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? updatedOrder : order,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    }
  }

  function getStatusLabel(status: OrderStatus) {
    return status.replace('_', ' ');
  }

  function getCategoryLabel(category?: string) {
    if (!category) return 'Unknown';

    return category.replace('_', ' ');
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Orders
        </p>

        <h1 className="text-3xl font-bold">Orders</h1>

        <p className="mt-2 text-slate-400">
          Create and track operational work through its lifecycle.
        </p>
      </div>

      {/* Error State */}
      {error ? (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Create Order */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Create Order</h2>

          <form onSubmit={handleCreateOrder} className="space-y-5">
            {/* Title */}
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

            {/* Description */}
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

            {/* Priority */}
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

            {/* Submit */}
            <button
              className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isCreating}
              type="submit"
            >
              {isCreating ? 'Creating...' : 'Create Order'}
            </button>
          </form>
        </section>

        {/* Orders List */}
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
              {orders.map((order) => {
                const isLocked =
                order.statusRef?.isTerminal ||
                order.status === 'CANCELED' ||
                order.status === 'DONE';

                return (
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
                      {order.statusRef?.name ?? getStatusLabel(order.status)}
                    </span>

                    {order.statusRef?.category ? (
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-400">
                        {getCategoryLabel(order.statusRef.category)}
                      </span>
                    ) : null}

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
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-semibold text-slate-200 underline-offset-4 hover:underline"
                  >
                    View intelligence
                  </Link>
                  
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                        Status
                      </label>

                      <select
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                        value={order.statusId ?? ''}
                        disabled={isLocked}
                        onChange={(event) => handleStatusChange(order.id, event.target.value)}
                      >
                        {workflowStatuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="mt-5 rounded-lg border border-red-800 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={order.status === 'CANCELED' || order.status === 'DONE'}
                      type="button"
                    >
                      Cancel Order
                    </button>
                  </div>
                </article>
              )})}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}