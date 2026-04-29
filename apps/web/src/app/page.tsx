import Link from 'next/link';

type ApiHealthResponse = {
  name: string;
  status: string;
  version: string;
  timestamp: string;
};

async function getApiHealth(): Promise<ApiHealthResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/health`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch API: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    return null;
  }
}

export default async function Home() {
  const apiHealth = await getApiHealth();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Smart Tracker
          </p>

          <h1 className="text-4xl font-bold mb-4">
            Track work through its full lifecycle.
          </h1>

          <p className="max-w-2xl text-slate-300">
            A full-stack project for managing operational work, ownership,
            priority, status, and eventually AI-generated summaries.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-white px-5 py-3 font-semibold text-slate-950"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-900"
          >
            Create account
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-900"
          >
            Dashboard
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-semibold mb-4">Backend Status</h2>

          {apiHealth ? (
            <div className="space-y-2 text-slate-300">
              <p>
                <span className="font-semibold text-white">API Name:</span>{' '}
                {apiHealth.name}
              </p>
              <p>
                <span className="font-semibold text-white">Status:</span>{' '}
                {apiHealth.status}
              </p>
              <p>
                <span className="font-semibold text-white">Version:</span>{' '}
                {apiHealth.version}
              </p>
              <p>
                <span className="font-semibold text-white">Timestamp:</span>{' '}
                {apiHealth.timestamp}
              </p>
            </div>
          ) : (
            <p className="text-red-400">
              Could not connect to the backend API.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}