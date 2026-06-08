import Logo from "@/components/shared/Logo";
import { FileText, UsersRound, Zap } from "lucide-react";
import { AuthStatCard } from "./AuthStatCard";
import { DashboardMockup } from "./AuthDashboardMockup";

export function RegisterLeftPanel() {
  const stats = [
    {
      icon: UsersRound,
      iconBg: "#D1FAE5",
      iconColor: "#059669",
      value: "10+",
      label: "Interview Types",
    },
    {
      icon: FileText,
      iconBg: "#EDE9FE",
      iconColor: "#7C3AED",
      value: "1000+",
      label: "Practice Questions",
    },
    {
      icon: Zap,
      iconBg: "#DBEAFE",
      iconColor: "#2563EB",
      value: "AI",
      label: "Feedback in Seconds",
    },
  ];

  return (
    <div className="hidden lg:flex flex-col px-10 pt-10 relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-full">
        <Logo />

        <div className="flex-1 flex flex-col gap-8 py-10">
          <div className="">
            <h1 className="text-[2rem] xl:text-[2.4rem] font-bold leading-tight text-gray-900">
              Your personal
              <br />
              AI interview coach.
            </h1>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed max-w-sm">
              Create your account and start practicing with AI-generated
              questions, personalized feedback, and progress tracking.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <AuthStatCard key={stat.label} {...stat} />
            ))}
          </div>

          <DashboardMockup />
        </div>
      </div>
    </div>
  );
}
