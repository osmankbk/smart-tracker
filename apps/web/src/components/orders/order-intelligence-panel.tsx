import type { OrderIntelligence, RiskLevel } from '@/types/order';

type OrderIntelligencePanelProps = {
  intelligence: OrderIntelligence;
};

function getRiskLabelClass(riskLevel: RiskLevel) {
  if (riskLevel === 'CRITICAL') {
    return 'border-red-700 bg-red-950 text-red-200';
  }

  if (riskLevel === 'HIGH') {
    return 'border-orange-700 bg-orange-950 text-orange-200';
  }

  if (riskLevel === 'MEDIUM') {
    return 'border-yellow-700 bg-yellow-950 text-yellow-200';
  }

  return 'border-emerald-700 bg-emerald-950 text-emerald-200';
}

export function OrderIntelligencePanel({
  intelligence,
}: OrderIntelligencePanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Intelligence
          </p>
          <h2 className="text-xl font-semibold">What matters right now</h2>
          <p className="mt-2 text-sm text-slate-400">
            Risk, lifecycle signals, and recommended next actions.
          </p>
        </div>

        <div
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${getRiskLabelClass(
            intelligence.riskLevel,
          )}`}
        >
          {intelligence.riskLevel} Risk · {intelligence.riskScore}/100
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-500">Time in status</p>
          <p className="mt-2 text-2xl font-bold">
            {intelligence.timeInCurrentStatusHours}h
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-500">Stuck</p>
          <p className="mt-2 text-2xl font-bold">
            {intelligence.isStuck ? 'Yes' : 'No'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-500">Activity count</p>
          <p className="mt-2 text-2xl font-bold">
            {intelligence.signals.activityCount}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold">Why this matters</h3>
          <ul className="space-y-2">
            {intelligence.reasons.map((reason) => (
              <li
                key={reason}
                className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
              >
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">Recommended actions</h3>
          <ul className="space-y-2">
            {intelligence.recommendedActions.map((action) => (
              <li
                key={action}
                className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
              >
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}