import { App, AppStatus, Platform } from "@prisma/client";
import { format } from "date-fns";
import { Monitor, Smartphone, MoreVertical, ExternalLink } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface AppTableProps {
  apps: App[];
}

export function AppTable({ apps }: AppTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-6 py-4">Application</th>
            <th className="px-6 py-4">Platform</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Version</th>
            <th className="px-6 py-4">Last Update</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {apps.map((app) => (
            <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{app.name}</span>
                  <span className="text-xs text-slate-500">{app.bundleId}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {app.platform === "IOS" ? (
                    <Smartphone size={16} className="text-slate-400" />
                  ) : (
                    <Monitor size={16} className="text-slate-400" />
                  )}
                  <span className="capitalize">{app.platform.toLowerCase()}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={app.status} />
              </td>
              <td className="px-6 py-4 text-slate-600">
                {app.currentVersion || "-"} ({app.buildNumber || "-"})
              </td>
              <td className="px-6 py-4 text-slate-500">
                {app.lastUpdate ? format(new Date(app.lastUpdate), "MMM d, yyyy") : "Never"}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <ExternalLink size={18} />
                </button>
              </td>
            </tr>
          ))}
          {apps.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                No applications found. Add your first app to start monitoring.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
