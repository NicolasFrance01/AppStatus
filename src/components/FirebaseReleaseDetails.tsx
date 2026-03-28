"use client";

import { X, Users as UsersIcon, FileText, Calendar, CheckCircle2, UserPlus, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FirebaseReleaseDetailsProps {
  app: any;
  onClose: () => void;
}

export function FirebaseReleaseDetails({ app: release, onClose }: FirebaseReleaseDetailsProps) {
  if (!release) return null;
  const appInfo = release.app || {};

  // Generate Firebase Console URL
  // Format: https://console.firebase.google.com/project/[PROJECT_ID]/appdistribution/app/[PLATFORM]:[PACKAGE_NAME]/releases
  const firebaseAppId = appInfo.firebaseAppId || "";
  const projectNumber = firebaseAppId.includes(':') ? firebaseAppId.split(':')[1] : "unknown";
  const platform = (appInfo.platform || "android").toLowerCase();
  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${projectNumber}/appdistribution/app/${appInfo.bundleId}/releases`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 truncate max-w-md">{appInfo.name}</h2>
              <p className="text-xs text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Versión {release.version} ({release.buildNumber})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
          <div className="space-y-6">
            {/* Release Notes section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText size={18} className="text-indigo-400" />
                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Notas de Lanzamiento</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-inner">
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed font-medium italic">
                  {release.releaseNotes || "No se incluyeron notas para esta distribución."}
                </p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex items-start gap-4">
              <div className="p-3 bg-white rounded-full text-indigo-600 shadow-sm shrink-0">
                <ExternalLink size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-indigo-900">Métricas Detalladas</h3>
                <p className="text-xs text-indigo-600/80 leading-relaxed">
                  Para ver las estadísticas de engagement (invitados, aceptados, descargas) y el seguimiento de testers individuales, visite la consola oficial.
                </p>
                <div className="pt-2">
                  <a 
                    href={firebaseConsoleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[10px] font-black bg-indigo-600 text-white px-4 py-2 rounded-full uppercase tracking-tighter hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    Abrir Firebase Console <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Publicado el {format(new Date(release.displayDate), "dd/MM/yyyy HH:mm")}</span>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
