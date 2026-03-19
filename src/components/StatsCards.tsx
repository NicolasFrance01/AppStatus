import { AppStatus, Platform } from "@prisma/client";
import { CheckCircle, Clock, AlertTriangle, XCircle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    total: number;
    published: number;
    inReview: number;
    pendingPublication: number;
    rejected: number;
    actionRequired: number;
  };
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

export function StatsCards({ stats, selectedStatus, onStatusChange }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Apps",
      value: stats.total,
      icon: Package,
      color: "text-slate-600",
      bg: "bg-slate-50",
      status: null,
    },
    {
      label: "Published",
      value: stats.published,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      status: "PUBLISHED",
    },
    {
      label: "In Review",
      value: stats.inReview,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      status: "IN_REVIEW",
    },
    {
      label: "Pending Publication",
      value: stats.pendingPublication,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      status: "PENDING_PUBLICATION",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      status: "REJECTED",
    },
    {
      label: "Action Required",
      value: stats.actionRequired,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      status: "ACTION_REQUIRED",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
      {cards.map((card) => {
        const isActive = selectedStatus === card.status;
        return (
          <button
            key={card.label}
            onClick={() => onStatusChange(card.status)}
            className={cn(
              "rounded-xl border p-5 shadow-sm transition-all text-left",
              card.bg,
              isActive 
                ? "border-blue-500 ring-2 ring-blue-200 shadow-md transform scale-[1.02]" 
                : "border-slate-200 hover:shadow-md hover:border-slate-300 active:scale-95"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-1.5 bg-white shadow-sm flex-shrink-0", card.color)}>
                <card.icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-slate-900 leading-none mt-0.5">{card.value}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
