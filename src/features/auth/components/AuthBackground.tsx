type AuthBackgroundProps = {
  imageUrl?: string;
  showImage?: boolean;
};

export function AuthBackground({
  imageUrl = "/bg.png",
  showImage = true,
}: AuthBackgroundProps) {
  return (
    <>
      {/* Base gradient background */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 20% 50%, color-mix(in oklch, var(--primary) 12%, white), color-mix(in oklch, var(--primary) 4%, white) 60%, color-mix(in oklch, var(--primary) 8%, white))`,
        }}
      />

      {/* Background image overlay */}
      {showImage && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center opacity-[0.05]"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
      )}

      {/* Animations */}
      <style>{`
        @keyframes auth-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-22px); }
        }

        @keyframes auth-float-r {
          0%, 100% { transform: translateY(-12px); }
          50% { transform: translateY(12px); }
        }

        @keyframes auth-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes auth-spin-r {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        @keyframes auth-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.22;
          }
        }

        @keyframes auth-drift {
          0%, 100% {
            transform: translate(0, 0) rotate(12deg);
          }
          33% {
            transform: translate(10px, -14px) rotate(20deg);
          }
          66% {
            transform: translate(-8px, 8px) rotate(6deg);
          }
        }
      `}</style>

      {/* Animated shapes */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full border-2 border-primary/20"
        style={{ animation: "auth-spin 28s linear infinite" }}
      />

      <div
        className="pointer-events-none absolute bottom-0 right-[50%] size-64 rounded-full border border-dashed border-primary/15"
        style={{ animation: "auth-spin-r 22s linear infinite" }}
      />

      <div
        className="pointer-events-none absolute -left-10 bottom-16 size-48 rounded-full"
        style={{
          background: "color-mix(in oklch, var(--primary) 10%, transparent)",
          animation: "auth-float 7s ease-in-out infinite",
          animationDelay: "1s",
        }}
      />

      <div
        className="pointer-events-none absolute left-[38%] top-12 size-10 rounded-full"
        style={{
          background: "color-mix(in oklch, var(--primary) 18%, transparent)",
          animation: "auth-pulse 5s ease-in-out infinite",
        }}
      />

      <div
        className="pointer-events-none absolute right-6 top-[45%] size-6 rounded-full"
        style={{
          background: "color-mix(in oklch, var(--primary) 20%, transparent)",
          animation: "auth-float-r 5s ease-in-out infinite",
          animationDelay: "0.8s",
        }}
      />

      <div
        className="pointer-events-none absolute right-[28%] top-[15%] size-12 rounded-2xl"
        style={{
          background: "color-mix(in oklch, var(--primary) 12%, transparent)",
          animation: "auth-drift 9s ease-in-out infinite",
        }}
      />

      <div
        className="pointer-events-none absolute left-[20%] top-[60%] size-16 rounded-full border border-primary/20"
        style={{
          animation: "auth-float 8s ease-in-out infinite",
          animationDelay: "3s",
        }}
      />

      <div
        className="pointer-events-none absolute bottom-[25%] right-[22%] size-5 rounded-full"
        style={{
          background: "color-mix(in oklch, var(--primary) 22%, transparent)",
          animation: "auth-float-r 6s ease-in-out infinite",
          animationDelay: "1.5s",
        }}
      />
    </>
  );
}
