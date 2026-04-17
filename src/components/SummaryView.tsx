import { App, Platform } from "@/generated/client";
import { cn } from "@/lib/utils";
import { Apple } from "lucide-react";

interface SummaryViewProps {
  apps: any[];
  isFirebase?: boolean;
}

const BANKS = [
  { id: "BSF", label: "BSF", color: "bg-[#e8f5e9]", text: "text-emerald-800", match: ["Santa Fe", "SF"] },
  { id: "BER", label: "BERSA", color: "bg-[#ffebee]", text: "text-rose-800", match: ["Entre Ríos", "Entre Rios", "BER"] },
  { id: "BSJ", label: "BSJ", color: "bg-[#fff8e1]", text: "text-amber-800", match: ["San Juan", "BSJ"] },
  { id: "BSC", label: "BSC", color: "bg-[#e1f5fe]", text: "text-sky-800", match: ["Santa Cruz", "BSC"] },
];

const PLATFORMS: Platform[] = ["ANDROID", "IOS"];

function getBankLogoById(id: string, isBee: boolean) {
  const suffix = isBee ? "-empresas" : "";
  switch (id) {
    case "BSF": return `/logos/santa-fe${suffix}.png`;
    case "BSC": return `/logos/santa-cruz${suffix}.png`;
    case "BSJ": return `/logos/san-juan${suffix}.png`;
    case "BER": return `/logos/entre-rios${suffix}.png`;
    default: return `/logos/santa-fe${suffix}.png`;
  }
}

interface SummaryTableProps {
  title: "BEE" | "HBI";
  filteredApps: any[];
  isBee?: boolean;
  isFirebase?: boolean;
}

function SummaryTable({ title, filteredApps, isBee = false, isFirebase = false }: SummaryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-md">
      <div className="bg-slate-800 py-2.5 text-center font-bold text-white shadow-inner uppercase tracking-widest text-sm">
        {title === "BEE" ? "Empresas (BEE)" : "Individuos (HBI)"}
      </div>
      <div className={cn(
        "grid divide-slate-200",
        isFirebase ? "grid-cols-[1fr_minmax(100px,auto)_1fr]" : "grid-cols-[1fr_minmax(80px,auto)_1.5fr_1.5fr]"
      )}>
        <div className="bg-slate-100 border-r border-b border-slate-300 p-2 text-center text-[10px] font-black uppercase text-slate-500">Estado de Apps</div>
        <div className="bg-slate-100 border-r border-b border-slate-300 p-2 text-center text-[10px] font-black uppercase text-slate-500">Version</div>
        <div className="bg-slate-100 border-r border-b border-slate-300 p-2 text-center text-[10px] font-black uppercase text-slate-500">Platform</div>
        {!isFirebase && <div className="bg-slate-100 border-b border-slate-300 p-2 text-center text-[10px] font-black uppercase text-slate-500">Status</div>}

        {BANKS.map((bank) => (
          <div key={bank.id} className="contents">
            {/* Bank Name (Span 2 rows for Android/iOS) */}
            <div className={cn("row-span-2 border-r border-b border-slate-300 flex flex-col items-center justify-center gap-1 p-2 text-center", bank.color, bank.text)}>
              <div className="h-8 w-8 overflow-hidden rounded-md bg-white p-1 shadow-sm">
                <img src={getBankLogoById(bank.id, isBee)} alt={bank.label} className="h-full w-full object-contain" />
              </div>
              <span className="font-bold text-[10px] leading-tight">{bank.label}</span>
            </div>

            {PLATFORMS.map((platform) => {
              // Better matching logic
              const app = filteredApps.find((a) => {
                const nameMatches = bank.match.some(m => a.name.includes(m));
                const entityMatches = a.entity && bank.match.some(m => a.entity?.includes(m));
                return (nameMatches || entityMatches) && a.platform === platform;
              });

              const statusStyles = getStatusStyles(app?.status);
              const version = app?.currentVersion || "N/A";
              const build = app?.buildNumber ? ` (${app.buildNumber})` : "";

              return (
                <div key={`${bank.id}-${platform}`} className="contents text-[10px]">
                  <div className="bg-slate-50 border-r border-b border-slate-300 p-2 flex items-center justify-center text-slate-500 font-medium">
                    {platform === "ANDROID" ? (
                      <div className="flex items-center gap-1 text-[#3DDC84]">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                          <path d="M17.523 15.3414C18.1209 15.3414 18.6059 14.8564 18.6059 14.2585C18.6059 13.6606 18.1209 13.1756 17.523 13.1756C16.9251 13.1756 16.4401 13.6606 16.4401 14.2585C16.4401 14.8564 16.9251 15.3414 17.523 15.3414ZM6.47713 15.3414C7.07505 15.3414 7.56005 14.8564 7.56005 14.2585C7.56005 13.6606 7.07505 13.1756 6.47713 13.1756C5.8792 13.1756 5.39421 13.6606 5.39421 14.2585C5.39421 14.2585C5.8792 15.3414 5.39421 15.3414ZM17.8854 10.5821L19.8624 7.1574C20.0139 6.89437 19.9238 6.55928 19.6608 6.40776C19.3977 6.25625 19.0626 6.34631 18.9111 6.60934L16.9113 10.0733C15.4339 9.39572 13.7844 9.01185 12.0469 9.01185C10.3093 9.01185 8.65983 9.39572 7.18241 10.0733L5.18261 6.60934C5.03109 6.34631 4.69601 6.25625 4.43297 6.40776C4.16994 6.55928 4.07988 6.89437 4.2314 7.1574L6.20842 10.5821C3.39127 12.1643 1.49414 15.1181 1.49414 18.5283H22.5058C22.5058 15.1181 20.6087 12.1643 17.8854 10.5821Z" />
                        </svg>
                        <span>Android</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-700">
                        <Apple size={12} fill="currentColor" />
                        <span>iOS</span>
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "bg-white border-b border-slate-300 p-2 flex items-center justify-center font-bold text-center leading-tight min-h-[48px]",
                    !isFirebase && "border-r"
                  )}>
                    {version}{build}
                  </div>
                  {!isFirebase && (
                    <div className={cn("border-b border-slate-300 p-2 flex flex-col items-center justify-center font-bold text-center leading-tight min-h-[40px]", statusStyles)}>
                      <span>{getStatusLabel(app?.status, title as "BEE" | "HBI")}</span>
                      {app?.updateStatus && app.updateStatus.includes("(") && (
                        <span className="text-[8px] opacity-80 mt-0.5 font-normal leading-none italic">
                          {app.updateStatus.split("(")[1].replace(")", "")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SummaryView({ apps, isFirebase = false }: SummaryViewProps) {
  // BEE: version 2.x.x, HBI: version 1.x.x
  const beeApps = apps.filter((app) => 
    (app as any).segment === 'BEE' || 
    (app as any).calculatedSegment === 'BEE' || 
    /\b(2|22|32)\.\d+/.test(app.currentVersion || "")
  );
  
  const hbiApps = apps.filter((app) => 
    (app as any).segment === 'HBI' || 
    (app as any).calculatedSegment === 'HBI' ||
    /\b(1|11)\.\d+/.test(app.currentVersion || "")
  );

  return (
    <div className="mb-12 mt-4 space-y-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <SummaryTable title="BEE" filteredApps={beeApps} isBee={true} isFirebase={isFirebase} />
        <SummaryTable title="HBI" filteredApps={hbiApps} isBee={false} isFirebase={isFirebase} />
      </div>
    </div>
  );
}

function getStatusStyles(status?: string) {
  switch (status) {
    case "PUBLISHED":
      return "bg-[#c8e6c9] text-[#1b5e20]"; // Soft green
    case "IN_REVIEW":
    case "PENDING_REVIEW":
      return "bg-[#fff9c4] text-[#f57f17]"; // Soft yellow
    case "PENDING_PUBLICATION":
      return "bg-[#ffe0b2] text-[#e65100]"; // Soft orange
    case "REJECTED":
      return "bg-rose-100 text-rose-800";
    case "ACTION_REQUIRED":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-slate-50 text-slate-400";
  }
}

function getStatusLabel(status: string | undefined, type: "BEE" | "HBI") {
  if (!status) return "N/A";
  switch (status) {
    case "PUBLISHED":
      return "Publicada";
    case "IN_REVIEW":
    case "PENDING_REVIEW":
      return type === "BEE" ? "En revisión" : "Pendiente de revisión";
    case "PENDING_PUBLICATION":
      return "Lista para publicarse";
    case "REJECTED":
      return "Rechazada";
    case "ACTION_REQUIRED":
      return "Acción requerida";
    default:
      return status;
  }
}
