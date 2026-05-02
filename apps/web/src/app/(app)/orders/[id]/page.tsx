'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { getOrderById } from '@/lib/orders';
import { createOrderComment, getOrderComments } from '@/lib/comments';

import type { Order } from '@/types/order';
import type { OrderComment } from '@/types/comment';

import { OrderIntelligencePanel } from '@/components/orders/order-intelligence-panel';

import { formatSystemLabel } from '@/lib/format';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [comments, setComments] = useState<OrderComment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [errors, setErrors] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [data, commentList] = await Promise.all([
        getOrderById(id),
        getOrderComments(id),
      ]);

      setOrder(data);
      setComments(commentList);
      } catch (err) {
        setErrors(err instanceof Error ? err.message : 'Failed to load Order detail')
      }
    }

    load();
  }, [id]);

  async function handleCreateComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCommentError('');
    setIsCreatingComment(true);

    try {
      const newComment = await createOrderComment(id, {
        body: commentBody,
      });

      setComments((current) => [...current, newComment]);
      setCommentBody('');
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : 'Failed to create comment',
      );
    } finally {
      setIsCreatingComment(false);
    }
  }

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

      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Discussion
          </p>
          <h2 className="text-xl font-semibold">Comments</h2>
          <p className="mt-2 text-sm text-slate-400">
            Capture context, decisions, and blockers directly on this order.
          </p>
        </div>

        <form onSubmit={handleCreateComment} className="mb-6 space-y-3">
          <textarea
            className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-400"
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="Add a comment..."
            required
          />

          {commentError ? (
            <p className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
              {commentError}
            </p>
          ) : null}

          <button
            className="rounded-lg bg-white px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCreatingComment}
            type="submit"
          >
            {isCreatingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
            <p className="text-sm text-slate-400">
              No comments yet. Add context for the team.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-200">
                    {comment.author.name || comment.author.email}
                  </p>

                  <p className="text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>

                <p className="whitespace-pre-wrap text-sm text-slate-300">
                  {comment.body}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
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

            <p className="font-medium">{formatSystemLabel(log.action)}</p>

            {log.fromStatus && log.toStatus ? (
              <p className="text-sm text-slate-300">
                {formatSystemLabel(log.fromStatus)} → {formatSystemLabel(log.toStatus)}
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