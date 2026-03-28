"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { StatsCards } from "@/components/StatsCards";
import { AppTable } from "@/components/AppTable";
import { SummaryView } from "@/components/SummaryView";
import { RefreshCw, LogOut, Users, Loader2, LayoutDashboard, UserCircle, History, X, Bell, CheckCircle2, AlertCircle as AlertIcon, Send, Clock, Mail } from "lucide-react";
import { App } from "@/generated/client";
import { cn, formatRelativeTime } from "@/lib/utils";
import { UserManagement } from "../components/UserManagement";
import MyProfile from "../components/MyProfile";
import { SystemConfig } from "../components/SystemConfig";

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
  const [view, setView] = useState<"dashboard" | "users" | "profile">("dashboard");
  const [isSyncing, setIsSyncing] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncInfo, setSyncInfo] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  // Lazy Sync Engine
  const checkLazySync = useCallback(async (currentSyncInfo: any) => {
    if (!currentSyncInfo) return;
    
    try {
      // Trigger background sync task
      // The API will check itself if it's overdue based on SystemConfig
      const res = await fetch('/api/sync?task=true');
      const data = await res.json();
      if (data.success) {
        console.log("[LazySync] Background synchronization triggered.");
        // Refresh local data if something changed
        loadSyncInfo();
        loadApps();
      }
    } catch (err) {
      console.error("[LazySync] Check failed:", err);
    }
  }, []);

  const loadApps = useCallback(async (forcedFilter?: string | null) => {
    const activeFilter = forcedFilter !== undefined ? forcedFilter : statusFilter;
    const url = activeFilter === 'FIREBASE' ? '/api/apps?type=firebase' : '/api/apps';
    const response = await fetch(url);
    const data = await response.json();
    
    // Normalize data for SummaryView if it's Firebase
    const normalizedData = activeFilter === 'FIREBASE' 
      ? data.map((app: any) => ({
          ...app,
          segment: app.segment === 'EMPRESAS' ? 'BEE' : app.segment === 'INDIVIDUOS' ? 'HBI' : app.segment,
          currentVersion: app.releases?.[0]?.version || app.releases?.[0]?.displayVersion || "N/A",
          buildNumber: app.releases?.[0]?.buildNumber || app.releases?.[0]?.buildVersion || "",
          status: "ACTION_REQUIRED", // Use a generic status for Firebase for now
        }))
      : data;

    setApps(normalizedData);
  }, [statusFilter]);

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

  const fetchAlerts = async () => {
    const user = session?.user as { id?: string } | undefined;
    if (!user) return;
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (e) {
      console.error("Error fetching alerts:", e);
    }
  };

  const markAlertAsRead = async (id: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true })
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all', isRead: true })
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  useEffect(() => {
    loadApps();
    loadSyncInfo().then(() => {
      // Check lazy sync after initial load
    });
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [loadApps, loadSyncInfo, session]);

  // Trigger lazy sync check when syncInfo is available
  useEffect(() => {
    if (syncInfo && !isSyncing) {
      checkLazySync(syncInfo);
    }
  }, [syncInfo, isSyncing, checkLazySync]);

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
    loadApps(status);
  };

  const stats = {
    total: apps.length,
    published: apps.filter(a => (a as any).status === 'PUBLISHED').length,
    inReview: apps.filter(a => (a as any).status === 'IN_REVIEW').length,
    pendingPublication: apps.filter(a => (a as any).status === 'PENDING_PUBLICATION').length,
    rejected: apps.filter(a => (a as any).status === 'REJECTED').length,
    actionRequired: statusFilter === 'FIREBASE' ? apps.length : 0, // Simplified for now
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="AppStatus Logo" width={36} height={36} className="drop-shadow shrink-0" />
              <span className="text-sm sm:text-lg font-bold tracking-tighter sm:tracking-tight text-slate-900 truncate">
                <span className="sm:hidden">AppStatus</span>
                <span className="hidden sm:inline">App Status</span>
              </span>
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
                  <span className="hidden sm:inline">Usuarios</span>
                </button>
              )}

              <div className="h-6 w-px bg-slate-200 mx-1" />

              <div className="flex items-center gap-3 bg-slate-100/50 rounded-full px-4 py-1.5 border border-slate-200">
                <div className="flex flex-col items-end mr-1">
                  <span className="text-xs font-bold text-slate-900 leading-none">{session?.user?.name || "User"}</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{userRole}</span>
                </div>
                
                {session && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={cn(
                        "p-2 rounded-xl transition-all relative",
                        showNotifications ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <h4 className="font-black text-slate-900 text-sm">Notificaciones</h4>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-[10px] font-bold text-blue-600 hover:underline">Marcar todas</button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {alerts.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell size={24} className="mx-auto text-slate-200 mb-2" />
                              <p className="text-xs text-slate-400 font-medium">No hay alertas nuevas</p>
                            </div>
                          ) : (
                            alerts.map((alert) => (
                              <div 
                                key={alert.id} 
                                onClick={() => !alert.isRead && markAlertAsRead(alert.id)}
                                className={cn(
                                  "p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50",
                                  !alert.isRead && "bg-blue-50/30"
                                )}
                              >
                                <div className="flex gap-3">
                                  <div className={cn(
                                    "h-8 w-8 shrink-0 rounded-full flex items-center justify-center",
                                    alert.type === 'STATUS_CHANGE' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                  )}>
                                    {alert.type === 'STATUS_CHANGE' ? <CheckCircle2 size={16} /> : <AlertIcon size={16} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-slate-800 leading-tight">{alert.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium italic">
                                      {new Date(alert.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                  {!alert.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 self-center" />}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => setView(view === "profile" ? "dashboard" : "profile")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ml-1",
                    view === "profile" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  )}
                  title="Mi Perfil"
                >
                  <UserCircle size={18} />
                  <span className="hidden sm:inline">Mi Perfil</span>
                </button>

                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all ml-1"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Salir</span>
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
                  <>
                    <button 
                      onClick={() => setShowConfig(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200"
                      title="Configuración de Sincronización"
                    >
                      <Clock size={18} />
                    </button>

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
                  </>
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
                    {syncInfo.triggeredBy && (syncInfo.triggeredBy === 'Automatizado' || !isReader) && ` por ${syncInfo.triggeredBy}`}
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
                      {statusFilter === 'FIREBASE' ? "Resumen Ejecutivo Firebase" : "Resumen Ejecutivo"}
                    </h2>
                  </div>
                  <SummaryView apps={apps} isFirebase={statusFilter === 'FIREBASE'} />
                </div>
              )}
              
              {isDeveloper && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {statusFilter === 'FIREBASE' 
                        ? 'Todas las Aplicaciones Firebase' 
                        : (statusFilter ? `${statusFilter.replace('_', ' ')} Applications` : 'Todas las Aplicaciones')}
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
                  <p className="text-slate-400 font-medium italic">Activa &quot;Ver Resumen&quot; para visualizar el tablero ejecutivo.</p>
                </div>
              )}
            </div>
          </>
        ) : view === "profile" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <MyProfile user={session?.user as any} onUpdate={() => setView("dashboard")} />
          </div>
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
          <p className="text-sm text-slate-500 whitespace-pre-line">
            v2.7.1
            &copy; {new Date().getFullYear()} Sistema de Gestión de Apps
          </p>
          <button 
            onClick={() => setShowSupportModal(true)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
          >
            Contactar soporte
          </button>
        </div>
      </footer>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Soporte by Algeiba</h3>
              
              <a 
                href="mailto:nfrance@algeiba.com?cc=gp.pasajes@algeiba.com&subject=Soporte%20GP%20App%20Status"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                onClick={() => setShowSupportModal(false)}
              >
                <Send size={18} />
                Enviar correo
              </a>
              
              <button 
                onClick={() => setShowSupportModal(false)}
                className="mt-4 w-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Configuration Modal */}
      {showConfig && (
        <SystemConfig 
          onClose={() => setShowConfig(false)} 
          onUpdate={() => {
            loadSyncInfo();
            loadApps();
          }}
        />
      )}
    </div>
  );
}
