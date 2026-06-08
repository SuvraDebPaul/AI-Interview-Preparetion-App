import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/auth-options";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">
        Welcome, {session.user?.name} 👋
      </h1>
      <p className="text-sm text-muted-foreground">
        ID: {session.user?.id ?? "❌ no id"}
      </p>
      <p className="text-muted-foreground mt-1">
        Ready for your interview practice?
      </p>
    </div>
  );
}
