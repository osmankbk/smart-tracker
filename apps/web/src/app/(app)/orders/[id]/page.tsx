'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { getOrderById } from '@/lib/orders';
import type { Order } from '@/types/order';

import { OrderIntelligencePanel } from '@/components/orders/order-intelligence-panel';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [errors, setErrors] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        setErrors(err instanceof Error ? err.message : 'Failed to load Order detail')
      }
    }

    load();
  }, [id]);

  if (errors) {
    return <p className="text-slate-800">{errors}</p>
    
  } else if (!order) {
    return <p className="text-slate-800">...Loading</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{order.title}</h1>

      <p className="text-slate-400 mb-6">{order.description}</p>

      <div className="mb-6">
        <p>Status: {order.status}</p>
        <p>Priority: {order.priority}</p>
      </div>

      {order.intelligence ? (
        <div className="mb-8">
          <OrderIntelligencePanel intelligence={order.intelligence} />
        </div>
      ) : null}

      <h2 className="text-xl font-semibold mb-3">Activity Timeline</h2>

      <div className="space-y-3">
        {order.activityLogs.map((log) => (
          <div
            key={log.id}
            className="border border-slate-800 rounded p-3"
          >
            <p className="text-sm text-slate-400">
              {new Date(log.createdAt).toLocaleString()}
            </p>

            <p className="font-medium">{log.action}</p>

            {log.fromStatus && log.toStatus ? (
              <p className="text-sm text-slate-300">
                {log.fromStatus} → {log.toStatus}
              </p>
            ) : null}

            {log.actor?.email ? (
              <p className="text-xs text-slate-500">
                by {log.actor.email}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}