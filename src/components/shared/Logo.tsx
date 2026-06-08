import { MessageSquareMore } from "lucide-react";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
        <MessageSquareMore className="text-white" size={18} />
      </div>
      <span className="font-bold text-lg tracking-tight text-gray-900">
        Interview <span className="text-primary">AI</span>
      </span>
    </Link>
  );
}
