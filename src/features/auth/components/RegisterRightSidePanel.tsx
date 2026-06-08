import RegisterForm from "./RegisterForm";
import Logo from "@/components/shared/Logo";

export default function RegisterRightSidePanel() {
  return (
    <div className="relative z-10 flex-1 flex flex-col px-8 py-12">
      <div className="w-full max-w-xl mx-auto">
        {/* Card wrapper */}
        <div className="bg-white rounded-3xl shadow-xl px-10 py-10">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground">
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Start your journey to interview success.
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
