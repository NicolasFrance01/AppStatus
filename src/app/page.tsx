"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { StatsCards } from "@/components/StatsCards";
import { AppTable } from "@/components/AppTable";
import { SummaryView } from "@/components/SummaryView";
import { RefreshCw, LogOut, Users, Loader2, LayoutDashboard } from "lucide-react";
import { App } from "@/generated/client";
import { cn, formatRelativeTime } from "@/lib/utils";
import { UserManagement } from "@/components/UserManagement";
import { History, X } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "READER";
  const isAdmin = userRole === "ADMIN";
  const isDeveloper = userRole === "DEVELOPER" || isAdmin;
  const isReader = userRole === "READER" && !isDeveloper;

  const [apps, setApps] = useState<App[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [showSummary, setShowSummary] = useState(false);
  const [view, setView] = useState<"dashboard" | "users">("dashboard");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncInfo, setSyncInfo] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);

  const loadApps = useCallback(async () => {
    const response = await fetch('/api/apps');
    const data = await response.json();
    setApps(data);
  }, []);

  const loadSyncInfo = useCallback(async () => {
    const response = await fetch('/api/sync-info');
    const data = await response.json();
    setSyncInfo(data);
    if (data?.status === 'IN_PROGRESS') {
      setIsSyncing(true);
    } else {
      setIsSyncing(false);
    }
  }, []);

  const loadSyncHistory = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await fetch('/api/sync/history');
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setSyncHistory(data);
      } else {
        console.error(`Failed to load sync history (Status ${response.status}):`, data);
        setSyncHistory([]);
      }
    } catch (error) {
      console.error("Error loading sync history:", error);
      setSyncHistory([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadApps();
    loadSyncInfo();
  }, [loadApps, loadSyncInfo]);

  // Poll sync status if syncing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSyncing) {
      interval = setInterval(() => {
        loadSyncInfo();
        loadApps();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSyncing, loadSyncInfo, loadApps]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error desconocido');
      setSyncMessage('✅ Sincronización finalizada.');
      await loadSyncInfo();
      await loadApps();
    } catch (err: any) {
      setSyncMessage(`❌ ${err.message}`);
    } finally {
      // isSyncing will be set to false by polling once status is COMPLETED
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleStatusChange = (status: string | null) => {
    setStatusFilter(status);
    setBankFilter("all");
  };

  const stats = {
    total: apps.length,
    published: apps.filter(a => a.status === 'PUBLISHED').length,
    inReview: apps.filter(a => a.status === 'IN_REVIEW').length,
    pendingPublication: apps.filter(a => a.status === 'PENDING_PUBLICATION').length,
    rejected: apps.filter(a => a.status === 'REJECTED').length,
    actionRequired: apps.filter(a => a.status === 'ACTION_REQUIRED').length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="AppStatus Logo" width={36} height={36} className="drop-shadow" />
              <span className="text-xl font-bold tracking-tight text-slate-900">GP-Pasajes AppStatus</span>
            </div>
            
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button 
                  onClick={() => setView(view === "dashboard" ? "users" : "dashboard")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    view === "users" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Users size={18} />
                  <span>Usuarios</span>
                </button>
              )}

              <div className="h-6 w-px bg-slate-200 mx-1" />

              <div className="flex items-center gap-3 bg-slate-100/50 rounded-full px-4 py-1.5 border border-slate-200">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 leading-none">{session?.user?.name || "User"}</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{userRole}</span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8 flex-1">
        {view === "dashboard" ? (
          <>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
                <p className="mt-1 text-slate-500">Estado de aplicaciones móviles en tiendas oficiales.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSummary(!showSummary)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all shadow-sm border",
                    showSummary 
                      ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800" 
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <LayoutDashboard size={18} />
                  <span>{showSummary ? "Ocultar Resumen" : "Ver Resumen"}</span>
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => {
                      loadSyncHistory();
                      setShowHistory(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200"
                    title="Ver Historial"
                  >
                    <History size={18} />
                  </button>
                )}

                {isDeveloper && (
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSyncing ? (
                      <><Loader2 size={18} className="animate-spin" /><span>Sincronizando...</span></>
                    ) : (
                      <><RefreshCw size={18} /><span>Sincronizar APIs</span></>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Sync Status Info and Progress Bar */}
            <div className="mb-8 flex flex-col gap-2">
              {syncInfo && (
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium ml-1">
                  <div className={cn("h-2 w-2 rounded-full", isSyncing ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                  <span>
                    Ultima actualización {formatRelativeTime(syncInfo.completedAt || syncInfo.startedAt)}
                    {!isReader && syncInfo.triggeredBy && ` por ${syncInfo.triggeredBy}`}
                  </span>
                  {syncMessage && (
                    <span className="ml-2 font-bold text-blue-600 animate-in fade-in duration-300">{syncMessage}</span>
                  )}
                </div>
              )}
              
              {isSyncing && syncInfo && syncInfo.totalApps > 0 && (
                <div className="w-full max-w-md bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner mt-1">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.round((syncInfo.processedApps / syncInfo.totalApps) * 100)}%` }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-10">
              <StatsCards 
                stats={stats} 
                selectedStatus={statusFilter}
                onStatusChange={handleStatusChange}
              />

              {showSummary && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Resumen Ejecutivo
                    </h2>
                  </div>
                  <SummaryView apps={apps} />
                </div>
              )}
              
              {isDeveloper && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {statusFilter ? `${statusFilter.replace('_', ' ')} Applications` : 'Todas las Aplicaciones'}
                    </h2>
                  </div>
                  <AppTable 
                    apps={apps} 
                    statusFilter={statusFilter} 
                    bankFilter={bankFilter}
                    onBankChange={setBankFilter}
                  />
                </div>
              )}

              {isReader && !showSummary && (
                <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center animate-pulse">
                  <p className="text-slate-400 font-medium italic">Activa "Ver Resumen" para visualizar el tablero ejecutivo.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <UserManagement />
          </div>
        )}
      </main>

      {/* Sync History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <History size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Historial de Sincronización</h2>
                  <p className="text-xs text-slate-500 font-medium">Últimos 50 eventos registrados</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-0 flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha / Hora</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Apps</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!Array.isArray(syncHistory) || syncHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No hay registros aún.</td>
                    </tr>
                  ) : (
                    syncHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-700">{new Date(h.startedAt).toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400">{formatRelativeTime(h.startedAt)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-600">{h.triggeredBy}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {h.processedApps} / {h.totalApps}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset",
                            h.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-700 ring-emerald-100" :
                            h.status === 'FAILED' ? "bg-rose-50 text-rose-700 ring-rose-100" :
                            "bg-amber-50 text-amber-700 ring-amber-100"
                          )}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-right">
              <button 
                onClick={() => setShowHistory(false)}
                className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Sistema de Gestión de Apps Algeiba
          </p>
          <p className="mt-1 text-xs text-slate-400">
            GP-Pasaje - Algeiba - Nicolas France
          </p>
        </div>
      </footer>
    </div>
  );
}
