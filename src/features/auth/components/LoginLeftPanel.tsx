import Logo from "@/components/shared/Logo";

// ── Decorative mock interview card ─────────────────────────────
function MockInterviewCard() {
  const bars = [3, 5, 9, 6, 11, 7, 10, 5, 8, 6, 9, 7, 5, 4, 6];
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 w-60">
      <div className="mb-2">
        <p className="text-xs font-bold text-gray-900">Mock Interview</p>
        <p className="text-xs text-primary font-medium">Frontend Developer</p>
      </div>
      <p className="text-[11px] text-gray-400 mb-1.5">Question 3 of 10</p>
      <p className="text-xs font-semibold text-gray-800 leading-snug mb-3">
        Tell me about a project where you solved a difficult problem.
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-gray-400 mb-1">Recording...</p>
          <div className="flex items-end gap-.75 h-5">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-.75 rounded-full bg-primary"
                style={{
                  height: `${h * 1.7}px`,
                  opacity: 0.6 + (i % 3) * 0.13,
                }}
              />
            ))}
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Decorative AI feedback card ────────────────────────────────
function AIFeedbackCard() {
  const metrics = [
    { label: "Clarity", value: 86, color: "#22d3ee" },
    { label: "Confidence", value: 74, color: "#818cf8" },
    { label: "Structure", value: 80, color: "#34d399" },
  ];
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (86 / 100) * circ;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 w-55">
      <p className="text-xs font-bold text-gray-900 mb-3">AI Feedback</p>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-12 h-12 shrink-0">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 24 24)"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-gray-900">
            86%
          </span>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-none">86%</p>
          <p className="text-[11px] text-gray-400">Overall Score</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {metrics.map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 w-16">{label}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${value}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-[11px] font-medium text-gray-600 w-6 text-right">
              {value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Left panel ─────────────────────────────────────────────────
export function LoginLeftPanel() {
  const features = [
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      ),
      iconBg: "#DBEAFE",
      iconColor: "#2563EB",
      title: "Mock Interviews",
      desc: "Role-based AI interviews that simulate real-world questions.",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      iconBg: "#CCFBF1",
      iconColor: "#0D9488",
      title: "AI Feedback",
      desc: "Get instant, actionable feedback on your answers.",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      iconBg: "#EDE9FE",
      iconColor: "#7C3AED",
      title: "Track Progress",
      desc: "Monitor your improvement and build interview confidence.",
    },
  ];

  return (
    <div className="hidden lg:flex flex-col p-10 relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-full">
        <Logo />

        <div className="flex-1 flex items-center gap-6 py-10">
          {/* Left: text */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[2rem] xl:text-[2.4rem] font-bold leading-tight text-gray-900">
              Practice like it&apos;s
              <br />
              the real interview.
            </h1>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed max-w-xs">
              AI-powered mock interviews, personalized feedback, and progress
              tracking to help you land your dream job.
            </p>

            <div className="mt-6 space-y-3.5">
              {features.map(({ icon, iconBg, iconColor, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: iconBg, color: iconColor }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#6366F1", "#14B8A6", "#F59E0B"].map((bg, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: bg, zIndex: 3 - i }}
                  >
                    {["A", "B", "C"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Loved by{" "}
                <span className="font-semibold text-gray-700">10,000+</span>{" "}
                users preparing for interviews
              </p>
            </div>
          </div>

          {/* Right: decorative cards */}
          <div className="shrink-0 flex flex-col gap-4 items-end">
            <MockInterviewCard />
            <AIFeedbackCard />
          </div>
        </div>
      </div>
    </div>
  );
}
