"use client";

import { useState, useMemo } from "react";
import { App, AppStatus, Platform } from "../generated/client";
import { format } from "date-fns";
import { Apple, MoreVertical, ExternalLink, Filter, Building2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface AppTableProps {
  apps: App[];
  statusFilter: string | null;
  bankFilter: string;
  onBankChange: (bank: string) => void;
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
  const entities = useMemo(() => {
    const list = Array.from(new Set(apps.map(a => a.entity).filter(Boolean)));
    return list as string[];
  }, [apps]);

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesEntity = bankFilter === "all" || app.entity === bankFilter;
      const matchesStatus = !statusFilter || app.status === statusFilter;
      return matchesEntity && matchesStatus;
    });
  }, [apps, bankFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-1">
          <Filter size={18} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Filter by Bank:</span>
          <select 
            value={bankFilter}
            onChange={(e) => onBankChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Banks</option>
            {entities.map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-400 pr-1">
          Showing {filteredApps.length} of {apps.length} apps
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Application</th>
              <th className="px-6 py-4">Bank</th>
              <th className="px-6 py-4">Platform</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-xs">App Status</th>
              <th className="px-6 py-4">Version</th>
              <th className="px-6 py-4">Last Update</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredApps.map((app) => (
              <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{app.name}</span>
                    <span className="text-xs text-slate-500">{app.bundleId}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-md border border-slate-100 bg-white p-0.5">
                      <img 
                        src={getBankLogo(app.entity || "", app.name)} 
                        alt={app.entity || "Bank"} 
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="font-medium">{app.entity || "-"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {app.platform === "IOS" ? (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Apple size={16} fill="currentColor" />
                        <span className="font-medium">iOS</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[#3DDC84]">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                          <path d="M17.523 15.3414C18.1209 15.3414 18.6059 14.8564 18.6059 14.2585C18.6059 13.6606 18.1209 13.1756 17.523 13.1756C16.9251 13.1756 16.4401 13.6606 16.4401 14.2585C16.4401 14.8564 16.9251 15.3414 17.523 15.3414ZM6.47713 15.3414C7.07505 15.3414 7.56005 14.8564 7.56005 14.2585C7.56005 13.6606 7.07505 13.1756 6.47713 13.1756C5.8792 13.1756 5.39421 13.6606 5.39421 14.2585C5.39421 14.8564 5.8792 15.3414 6.47713 15.3414ZM17.8854 10.5821L19.8624 7.1574C20.0139 6.89437 19.9238 6.55928 19.6608 6.40776C19.3977 6.25625 19.0626 6.34631 18.9111 6.60934L16.9113 10.0733C15.4339 9.39572 13.7844 9.01185 12.0469 9.01185C10.3093 9.01185 8.65983 9.39572 7.18241 10.0733L5.18261 6.60934C5.03109 6.34631 4.69601 6.25625 4.43297 6.40776C4.16994 6.55928 4.07988 6.89437 4.2314 7.1574L6.20842 10.5821C3.39127 12.1643 1.49414 15.1181 1.49414 18.5283H22.5058C22.5058 15.1181 20.6087 12.1643 17.8854 10.5821Z" />
                        </svg>
                        <span className="font-medium text-slate-700">Android</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-700 font-medium">{app.storeStatus || "-"}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {app.currentVersion || "-"} ({app.buildNumber || "-"})
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {app.lastUpdate ? format(new Date(app.lastUpdate), "MMM d, yyyy") : "Never"}
                </td>
                <td className="px-6 py-4 text-right">
                  {app.storeUrl ? (
                    <a 
                      href={app.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors inline-block"
                      title="Open in Console"
                    >
                      <ExternalLink size={18} />
                    </a>
                  ) : (
                    <button 
                      className="rounded-md p-1.5 text-slate-300 cursor-not-allowed"
                      disabled
                      title="No URL configured"
                    >
                      <ExternalLink size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredApps.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  No applications found matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
