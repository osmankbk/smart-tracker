type ApiHealthResponse = {
  name: string;
  status: string;
  version: string;
  timestamp: string;
};

async function getApiHealth(): Promise<ApiHealthResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/`,
      {
        cache: 'no-store',
      }
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
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Smart Tracker</h1>
        <p className="text-slate-300 mb-8">
          Section 0: Monorepo + Next.js + NestJS setup
        </p>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Backend Connection Test</h2>

          {apiHealth ? (
            <div className="space-y-2 text-slate-200">
              <p>
                <span className="font-semibold">API Name:</span> {apiHealth.name}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {apiHealth.status}
              </p>
              <p>
                <span className="font-semibold">Version:</span> {apiHealth.version}
              </p>
              <p>
                <span className="font-semibold">Timestamp:</span> {apiHealth.timestamp}
              </p>
            </div>
          ) : (
            <p className="text-red-400">
              Could not connect to the backend API.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}