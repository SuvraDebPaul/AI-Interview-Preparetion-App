import type { LucideIcon } from "lucide-react";

type AuthStatCardProps = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
};

export function AuthStatCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
}: AuthStatCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm">
      <div
        className="flex size-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        <Icon className="size-5" strokeWidth={2.2} />
      </div>

      <p className="text-xl font-bold leading-none text-gray-900">{value}</p>

      <p className="text-[11px] leading-tight text-gray-500">{label}</p>
    </div>
  );
}
