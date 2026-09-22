import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight">
            <span className="text-yellow-400">Musafir</span>
          </Link>

          {user ? (
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
              Hills
            </span>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold bg-yellow-400 text-black px-4 py-1.5 rounded-full"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-5 pb-24">
        {children}
      </main>

      {/* Bottom Navigation - only show when logged in */}
      {user && <BottomNav />}
    </div>
  );
}