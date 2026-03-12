import { AppStatus, Platform } from "@prisma/client";
import { CheckCircle, Clock, AlertTriangle, XCircle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    total: number;
    published: number;
    inReview: number;
    rejected: number;
    actionRequired: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Apps",
      value: stats.total,
      icon: Package,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      label: "Published",
      value: stats.published,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "In Review",
      value: stats.inReview,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Action Required",
      value: stats.actionRequired,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-xl border border-slate-200 p-6 shadow-sm transition-all hover:shadow-md",
            card.bg
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn("rounded-lg p-2 bg-white shadow-sm", card.color)}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
