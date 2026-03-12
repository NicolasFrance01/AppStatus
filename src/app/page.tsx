import prisma from "@/lib/db";
import { StatsCards } from "@/components/StatsCards";
import { AppTable } from "@/components/AppTable";
import { RefreshCw, Plus, LayoutDashboard } from "lucide-react";
import { seedMockData } from "@/lib/actions";

export default async function DashboardPage() {
  const apps = await prisma.app.findMany({
    orderBy: { updatedAt: 'desc' }
  });

  const stats = {
    total: apps.length,
    published: apps.filter(a => a.status === 'PUBLISHED').length,
    inReview: apps.filter(a => a.status === 'IN_REVIEW').length,
    rejected: apps.filter(a => a.status === 'REJECTED').length,
    actionRequired: apps.filter(a => a.status === 'ACTION_REQUIRED').length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-600 p-1.5 text-white">
                <LayoutDashboard size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">AppStatus</span>
            </div>
            <div className="flex items-center gap-4">
              <form action={seedMockData}>
                <button 
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
                >
                  <RefreshCw size={16} />
                  <span>Sync APIs</span>
                </button>
              </form>
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700">
                <Plus size={16} />
                <span>New App</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">Monitor your mobile applications status across App Store and Google Play.</p>
        </div>

        <div className="space-y-8">
          <StatsCards stats={stats} />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">All Applications</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Sort by:</span>
                <select className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer">
                  <option>Recently Updated</option>
                  <option>Status</option>
                  <option>Name</option>
                </select>
              </div>
            </div>
            <AppTable apps={apps} />
          </div>
        </div>
      </main>
    </div>
  );
}
