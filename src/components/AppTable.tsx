"use client";

import { useState, useMemo } from "react";
import { App, AppStatus, Platform } from "../generated/client";
import { format } from "date-fns";
import { Apple, MoreVertical, ExternalLink, Filter, Building2, Users } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { FirebaseReleaseDetails } from "./FirebaseReleaseDetails";

interface AppTableProps {
  apps: any[]; // Changed from App[] to any[] to support FirebaseApp
  statusFilter: string | null;
  bankFilter: string;
  onBankChange: (bank: string) => void;
}

// Helper function to generate Firebase Console URL
// Format: https://console.firebase.google.com/project/[PROJECT_ID]/appdistribution/app/[PLATFORM]:[PACKAGE_NAME]/releases
function getFirebaseConsoleUrl(app: any): string {
  if (!app || !app.firebaseAppId || !app.bundleId || !app.platform) {
    return "";
  }
  const firebaseAppId = app.firebaseAppId;
  const projectNumber = firebaseAppId.includes(':') ? firebaseAppId.split(':')[1] : "unknown";
  const platform = (app.platform || "android").toLowerCase();
  return `https://console.firebase.google.com/project/${projectNumber}/appdistribution/app/${platform}:${app.bundleId}/releases`;
}

function getBankLogo(entity: string, appName: string = "") {
  const e = (entity || "").toLowerCase();
  const n = (appName || "").toLowerCase();
  const isEmpresas = n.includes("empresas") || e.includes("empresas");
  const suffix = isEmpresas ? "-empresas" : "";

  if (e.includes("santa fe") || e.includes("bsf")) return `/logos/santa-fe${suffix}.png`;
  if (e.includes("santa cruz") || e.includes("bsc")) return `/logos/santa-cruz${suffix}.png`;
  if (e.includes("san juan") || e.includes("bsj")) return `/logos/san-juan${suffix}.png`;
  if (e.includes("entre r") || e.includes("ber")) return `/logos/entre-rios${suffix}.png`;
  return `/logos/santa-fe${suffix}.png`;
}

export function AppTable({ apps, statusFilter, bankFilter, onBankChange }: AppTableProps) {
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [localPlatformFilter, setLocalPlatformFilter] = useState<string>("all");
  const [selectedFirebaseApp, setSelectedFirebaseApp] = useState<any>(null);

  const entities = useMemo(() => {
    // Collect unique bank names from both App and FirebaseApp objects
    const list = Array.from(new Set(apps.map((a: any) => a.entity || a.bank).filter(Boolean)));
    return list.sort() as string[];
  }, [apps]);

  const filteredItems = useMemo(() => {
    if (statusFilter === 'FIREBASE') {
      const allReleases: any[] = [];
      apps.forEach((app: any) => {
        if (app.releases) {
          app.releases.forEach((rel: any) => {
            // Strict categorization based on version prefix and name
            const v = (rel.version || rel.displayVersion || "");
            const appName = (app.name || "").toLowerCase();
            const isIndividuoName = appName.includes("individuo");
            
            const isHbiVersion = v.startsWith("1.") || v.startsWith("11.");
            const isBeeVersion = v.startsWith("2.") || v.startsWith("22.") || v.startsWith("32.");
            
            // ABSOLUTE FILTER: Individuo apps MUST have 1.x or 11.x versions.
            // Business/UAT apps MUST have 2.x, 22.x, or 32.x versions.
            if (isIndividuoName && !isHbiVersion) return; 
            if (!isIndividuoName && isHbiVersion) return;

            let actualSegment = "OTHERS";
            if (app.segment === 'UAT' || appName.includes('uat')) {
              // For Android, UAT apps should be shown under EMPRESAS (BEE) as there's no UAT segment filter.
              actualSegment = app.platform === 'ANDROID' ? "BEE" : "UAT";
            }
            else if (isBeeVersion) actualSegment = "BEE";
            else if (isHbiVersion) actualSegment = "HBI";

            // Enforce segment filtering
            if (segmentFilter !== 'all' && actualSegment !== segmentFilter) return;

            allReleases.push({
              ...rel,
              app: app,
              calculatedSegment: actualSegment
            });
          });
        }
      });

      return allReleases
        .filter((rel: any) => {
          const bank = rel.app.entity || rel.app.bank;
          const matchesEntity = bankFilter === "all" || bank === bankFilter;
          const matchesPlatform = localPlatformFilter === 'all' || rel.app.platform === localPlatformFilter;
          return matchesEntity && matchesPlatform;
        })
        .sort((a, b) => new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime());
    }

    return apps.filter((app: any) => {
      const bank = app.entity || app.bank;
      const matchesEntity = bankFilter === "all" || bank === bankFilter;
      
      let matchesStatus = !statusFilter || app.status === statusFilter;
      
      // If filtering by "In Review", include both IN_REVIEW and PENDING_REVIEW
      if (statusFilter === 'IN_REVIEW') {
        matchesStatus = app.status === 'IN_REVIEW' || app.status === 'PENDING_REVIEW';
      }
      
      return matchesEntity && matchesStatus;
    });
  }, [apps, bankFilter, statusFilter, segmentFilter, localPlatformFilter]);

  // Sequential filter states
  const isBankSelected = bankFilter !== "all";
  const isPlatformSelected = localPlatformFilter !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 px-1">
          {/* 1. BANK FILTER (Always enabled) */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
              {statusFilter === 'FIREBASE' ? 'Bank:' : 'Filter by Bank:'}
            </span>
            <select 
              value={bankFilter}
              onChange={(e) => {
                onBankChange(e.target.value);
                setLocalPlatformFilter("all");
                setSegmentFilter("all");
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="all">All Banks</option>
              {entities.map(entity => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>

          {statusFilter === 'FIREBASE' && (
            <>
              {/* 2. PLATFORM FILTER (Enabled after Bank) */}
              <div className={cn("flex items-center gap-2 transition-opacity", !isBankSelected && "opacity-50 grayscale pointer-events-none")}>
                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Platform:</span>
                <select 
                  value={localPlatformFilter}
                  disabled={!isBankSelected}
                  onChange={(e) => {
                    setLocalPlatformFilter(e.target.value);
                    setSegmentFilter("all");
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="all">All Platforms</option>
                  <option value="IOS">iOS</option>
                  <option value="ANDROID">Android</option>
                </select>
              </div>

              {/* 3. SEGMENT FILTER (Enabled after Platform, Dynamic Options) */}
              <div className={cn("flex items-center gap-2 transition-opacity", (!isBankSelected || !isPlatformSelected) && "opacity-50 grayscale pointer-events-none")}>
                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Segment:</span>
                <select 
                  value={segmentFilter}
                  disabled={!isBankSelected || !isPlatformSelected}
                  onChange={(e) => setSegmentFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="all">All Segments</option>
                  <option value="HBI">Individuos (HBI)</option>
                  <option value="BEE">Empresas (BEE)</option>
                  {localPlatformFilter === 'IOS' && (
                    <option value="UAT">Empresas UAT (UAT)</option>
                  )}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="text-xs text-slate-400 pr-1">
          {statusFilter === 'FIREBASE' ? `Listado de últimas ${filteredItems.length} versiones` : `Mostrando ${filteredItems.length} de ${apps.length} aplicaciones`}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Application</th>
              <th className="px-6 py-4">Bank</th>
              <th className="px-6 py-4 text-center">Platform</th>
              {statusFilter !== 'FIREBASE' ? (
                <>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-xs">App Status</th>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">Last Update</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4">Versión (Build)</th>
                  <th className="px-6 py-4">Última Distribución</th>
                </>
              )}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item: any) => {
              const isFirebase = statusFilter === 'FIREBASE';
              const app = isFirebase ? item.app : item;
              const release = isFirebase ? item : null;

              return (
                <tr key={isFirebase ? `${item.app.id}-${item.id}` : item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 line-clamp-1">{app.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{app.bundleId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-md border border-slate-100 bg-white p-0.5">
                        <img 
                          src={getBankLogo(app.entity || app.bank || "", app.name)} 
                          alt={app.entity || app.bank || "Bank"} 
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="font-medium whitespace-nowrap">{app.entity || app.bank || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {app.platform === "IOS" ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Apple size={16} fill="currentColor" />
                          <span className="font-medium text-[10px] uppercase">iOS</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#3DDC84]">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                            <path d="M17.523 15.3414C18.1209 15.3414 18.6059 14.8564 18.6059 14.2585C18.6059 13.6606 18.1209 13.1756 17.523 13.1756C16.9251 13.1756 16.4401 13.6606 16.4401 14.2585C16.4401 14.8564 16.9251 15.3414 17.523 15.3414ZM6.47713 15.3414C7.07505 15.3414 7.56005 14.8564 7.56005 14.2585C7.56005 13.6606 7.07505 13.1756 6.47713 13.1756C5.8792 13.1756 5.39421 13.6606 5.39421 14.2585C5.39421 14.8564 5.8792 15.3414 6.47713 15.3414ZM17.8854 10.5821L19.8624 7.1574C20.0139 6.89437 19.9238 6.55928 19.6608 6.40776C19.3977 6.25625 19.0626 6.34631 18.9111 6.60934L16.9113 10.0733C15.4339 9.39572 13.7844 9.01185 12.0469 9.01185C10.3093 9.01185 8.65983 9.39572 7.18241 10.0733L5.18261 6.60934C5.03109 6.34631 4.69601 6.25625 4.43297 6.40776C4.16994 6.55928 4.07988 6.89437 4.2314 7.1574L6.20842 10.5821C3.39127 12.1643 1.49414 15.1181 1.49414 18.5283H22.5058C22.5058 15.1181 20.6087 12.1643 17.8854 10.5821Z" />
                          </svg>
                          <span className="font-medium text-slate-700 text-[10px] uppercase">Android</span>
                        </div>
                      )}
                    </div>
                  </td>
                  {!isFirebase ? (
                    <>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700 font-medium">{item.storeStatus || "-"}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {item.currentVersion || "-"} ({item.buildNumber || "-"})
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {item.lastUpdate ? format(new Date(item.lastUpdate), "MMM d, yyyy") : "Never"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-slate-600 font-bold">
                        {item.version || "-"} ({item.buildNumber || "-"})
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-mono text-[10px]">
                        {item.displayDate ? format(new Date(item.displayDate), "yyyy-MM-dd HH:mm:ss") : "-"}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isFirebase ? (
                        <button 
                          onClick={() => setSelectedFirebaseApp(item)}
                          className="text-xs font-black text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 uppercase tracking-tighter"
                        >
                          Ver Detalles
                        </button>
                      ) : (
                        item.storeUrl ? (
                          <a 
                            href={item.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="Open in Console"
                          >
                            <ExternalLink size={18} />
                          </a>
                        ) : (
                          <button className="rounded-md p-1.5 text-slate-300 cursor-not-allowed disabled">
                            <ExternalLink size={18} />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                  No se encontraron aplicaciones o versiones que coincidan con los criterios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedFirebaseApp && (
        <FirebaseReleaseDetails 
          app={selectedFirebaseApp} 
          onClose={() => setSelectedFirebaseApp(null)} 
        />
      )}
    </div>
  );
}
