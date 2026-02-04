import { cn } from "@/lib/utils";
import type { UrgencyLevel } from "@/types/documents";

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

const urgencyStyles: Record<UrgencyLevel, string> = {
  'ด่วนที่สุด': 'urgency-critical',
  'ด่วนมาก': 'urgency-high',
  'ด่วน': 'urgency-medium',
  'ปกติ': 'urgency-normal',
};

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        urgencyStyles[urgency],
        className
      )}
    >
      {urgency}
    </span>
  );
}
