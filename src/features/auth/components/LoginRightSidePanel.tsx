import React from "react";
import LoginForm from "./LoginForm";
import Logo from "@/components/shared/Logo";

type LoginRightSidePanelProps = {
  verified?: string;
  callbackUrl?: string;
};

export default function LoginRightSidePanel({
  verified,
  callbackUrl,
}: LoginRightSidePanelProps) {
  return (
    <div className="relative z-10 flex-1 flex flex-col justify-center px-8 py-12">
      <div className="w-full max-w-xl mx-auto">
        {/* Card wrapper */}
        <div className="bg-white rounded-3xl shadow-xl px-10 py-10">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Login to continue your interview preparation.
            </p>
          </div>

          <LoginForm
            verified={verified === "true"}
            callbackUrl={callbackUrl ?? "/dashboard"}
          />
        </div>
      </div>
    </div>
  );
}
