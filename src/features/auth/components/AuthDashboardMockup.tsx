import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Home,
  MessageSquareText,
  PlayCircle,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";

const stats = [
  {
    label: "Progress",
    value: "72%",
    change: "+12%",
    icon: TrendingUp,
  },
  {
    label: "Completed",
    value: "24",
    change: "+6",
    icon: CheckCircle2,
  },
  {
    label: "Avg. Score",
    value: "78%",
    change: "+8%",
    icon: BarChart3,
  },
];

export function DashboardMockup() {
  return (
    <div className="w-full overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-2xl shadow-primary/10">
      {/* Browser Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400" />
          <div className="size-2.5 rounded-full bg-yellow-400" />
          <div className="size-2.5 rounded-full bg-green-400" />
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500">
          <div className="size-1.5 rounded-full bg-primary" />
          Dashboard
        </div>
      </div>

      <div className="grid grid-cols-[50px_1fr] bg-slate-50/70">
        {/* Sidebar */}
        <aside className="border-r border-slate-100 bg-white px-2 py-4">
          <div className="mb-6 flex justify-center">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
              <Target className="size-4" />
            </div>
          </div>

          <nav className="flex flex-col items-center gap-2">
            {[
              Home,
              BarChart3,
              PlayCircle,
              MessageSquareText,
              CalendarDays,
              UserRound,
            ].map((Icon, index) => (
              <div
                key={index}
                className={`flex size-9 items-center justify-center rounded-xl ${
                  index === 0 ? "bg-primary/10 text-primary" : "text-slate-400"
                }`}
              >
                <Icon className="size-4" />
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="p-4">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                AI Interview
              </p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">
                Preparation Overview
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Track progress and improve faster.
              </p>
            </div>

            <button className="rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground shadow-md shadow-primary/20">
              Practice
            </button>
          </div>

          {/* 3 Stats */}
          <div className="mb-4 grid grid-cols-3 gap-2.5">
            {stats.map(({ label, value, change, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>

                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                    {change}
                  </span>
                </div>

                <p className="text-[10px] font-medium text-slate-400">
                  {label}
                </p>
                <p className="mt-0.5 text-xl font-black leading-none text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <section className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  Performance Growth
                </h4>
                <p className="text-[10px] text-slate-400">Last 30 days</p>
              </div>

              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                +18%
              </span>
            </div>

            <div className="h-32">
              <svg
                viewBox="0 0 360 130"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="dashboardChartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity="0.22"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {[25, 55, 85, 115].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="360"
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100"
                    strokeWidth="1"
                  />
                ))}

                <path
                  d="M0 110 C35 95, 55 102, 82 84 C118 60, 145 74, 180 52 C220 26, 250 42, 285 24 C315 10, 340 15, 360 7"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M0 110 C35 95, 55 102, 82 84 C118 60, 145 74, 180 52 C220 26, 250 42, 285 24 C315 10, 340 15, 360 7 L360 130 L0 130 Z"
                  fill="url(#dashboardChartGradient)"
                />
              </svg>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
