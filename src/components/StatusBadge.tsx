import { AppStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusConfig: Record<AppStatus, { label: string; className: string }> = {
  PUBLISHED: { label: "Published", className: "bg-emerald-100 text-emerald-800" },
  IN_REVIEW: { label: "In Review", className: "bg-amber-100 text-amber-800" },
  PENDING_REVIEW: { label: "Pending Review", className: "bg-slate-100 text-slate-800" },
  PENDING_PUBLICATION: { label: "Pending Publication", className: "bg-blue-100 text-blue-800" },
  REJECTED: { label: "Rejected", className: "bg-rose-100 text-rose-800" },
  ACTION_REQUIRED: { label: "Action Required", className: "bg-orange-100 text-orange-800" },
  UPDATE_AVAILABLE: { label: "Update Available", className: "bg-cyan-100 text-cyan-800" },
  STORE_ISSUES: { label: "Store Issues", className: "bg-red-100 text-red-800" },
};

export function StatusBadge({ status }: { status: AppStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn("status-pill", config.className)}>
      {config.label}
    </span>
  );
}
