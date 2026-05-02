'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { getDashboardBrief } from '@/lib/intelligence';
import type { DashboardIntelligence } from '@/types/order';

export default function DashboardPage() {
  const { user } = useAuth();

  const [brief, setBrief] = useState<DashboardIntelligence | null>(null);
  const [isLoadingBrief, setIsLoadingBrief] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBrief() {
      try {
        const dashboardBrief = await getDashboardBrief();
        setBrief(dashboardBrief);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load intelligence brief',
        );
      } finally {
        setIsLoadingBrief(false);
      }
    }

    loadBrief();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Intelligence Brief
        </p>
        <h1 className="text-3xl font-bold">What matters today?</h1>
        <p className="mt-2 text-slate-400">
          Smart Tracker highlights operational risk, stuck work, and recommended
          next actions.
        </p>
      </div>

      {user ? (
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
          Signed in as <span className="font-semibold text-white">{user.email}</span>
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {isLoadingBrief ? (
        <p className="text-slate-400">Loading intelligence brief...</p>
      ) : brief ? (
        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="mb-2 text-sm text-slate-500">
              Generated {new Date(brief.generatedAt).toLocaleString()}
            </p>
            <h2 className="text-2xl font-semibold">{brief.summary}</h2>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Total" value={brief.metrics.totalOrders} />
            <MetricCard label="Stuck" value={brief.metrics.stuckOrders} />
            <MetricCard label="High Risk" value={brief.metrics.highRiskOrders} />
            <MetricCard
              label="Critical"
              value={brief.metrics.criticalRiskOrders}
            />
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Total" value={brief.metrics.totalOrders} />
            <MetricCard label="Stuck" value={brief.metrics.stuckOrders} />
            <MetricCard label="High Risk" value={brief.metrics.highRiskOrders} />
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Critical"
              value={brief.metrics.criticalRiskOrders}
            />
            <MetricCard
              label="Unassigned"
              value={brief.metrics.unassignedOrders}
            />
            <MetricCard
              label="High Risk Unassigned"
              value={brief.metrics.highRiskUnassignedOrders}
            />
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Team Workload</h2>

            {brief.workload.length === 0 ? (
              <p className="text-slate-400">No assigned work yet.</p>
            ) : (
              <div className="space-y-3">
                {brief.workload.map((w) => (
                  
                  <div
                    key={w.assigneeId}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
                  >
                    {w.assigneeName ?? w.assigneeEmail} — {w.count} order(s)
                  </div>
                )
                )}
              </div>
            )}

            {brief.workloadStats.isImbalanced && (
              <div className="mt-4 rounded-xl border border-yellow-800 bg-yellow-950 px-4 py-3 text-sm text-yellow-300">
                ⚠️ Workload is unevenly distributed across the team.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Smart Assignment Suggestions</h2>

            {brief.assignmentSuggestions.length === 0 ? (
              <p className="text-slate-400">
                No assignment suggestions right now.
              </p>
            ) : (
              <div className="space-y-3">
                {brief.assignmentSuggestions.map((suggestion) => (
                  <Link
                    key={suggestion.orderId}
                    href={`/orders/${suggestion.orderId}`}
                    className="block rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 hover:border-slate-600"
                  >
                    <p className="font-semibold text-slate-200">
                      {suggestion.orderTitle}
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      Suggested owner:{' '}
                      <span className="font-medium text-white">
                        {suggestion.suggestedAssigneeName}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {suggestion.reason}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Recommended Actions</h2>

            <div className="space-y-3">
              {brief.recommendedActions.map((action) => (
                <div
                  key={action}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
                >
                  {action}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Focus Orders</h2>
              <Link
                href="/orders"
                className="text-sm font-semibold text-slate-200 underline-offset-4 hover:underline"
              >
                View all orders
              </Link>
            </div>

            {brief.focusOrders.length === 0 ? (
              <p className="text-slate-400">
                No urgent focus orders right now.
              </p>
            ) : (
              <div className="space-y-4">
                {brief.focusOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block rounded-xl border border-slate-800 bg-slate-950 p-5 hover:border-slate-600"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{order.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {order.status} · {order.priority}
                        </p>
                      </div>

                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                        {order.intelligence.riskLevel} ·{' '}
                        {order.intelligence.riskScore}/100
                      </span>
                    </div>

                    <p className="text-sm text-slate-400">
                      {order.intelligence.reasons[0]}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}