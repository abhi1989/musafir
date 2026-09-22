"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/create", label: "Create", icon: "➕" },
  { href: "/messages", label: "Chat", icon: "💬" },
  { href: "/profile", label: "You", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initial, setInitial] = useState("?");
  const supabase = createClient();

  const fetchUnread = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Get profile avatar
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("id", user.id)
      .single();

    if (profile) {
      setAvatarUrl(profile.avatar_url || null);
      setInitial(profile.full_name?.charAt(0)?.toUpperCase() || "?");
    }

    // Unread messages
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`host_id.eq.${user.id},participant_id.eq.${user.id}`);

    if (!conversations || conversations.length === 0) {
      setUnreadCount(0);
      return;
    }

    const conversationIds = conversations.map((c) => c.id);

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .eq("read", false)
      .neq("sender_id", user.id);

    setUnreadCount(count || 0);
  }, [supabase]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);

    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => fetchUnread()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchUnread, supabase, pathname]);

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-t border-gray-100 fixed bottom-0 left-0 right-0 z-20">
      <div className="max-w-lg mx-auto h-16 flex items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const showBadge = item.href === "/messages" && unreadCount > 0;
          const isProfile = item.href === "/profile";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-14 h-full gap-0.5 transition-all ${
                isActive ? "text-black" : "text-gray-400"
              }`}
            >
              {isProfile ? (
                <div
                  className={`w-6 h-6 rounded-full overflow-hidden bg-yellow-100 flex items-center justify-center ${
                    isActive ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="You"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-yellow-800">
                      {initial}
                    </span>
                  )}
                </div>
              ) : (
                <span
                  className={`text-lg ${isActive ? "scale-110" : ""} transition-transform`}
                >
                  {item.icon}
                </span>
              )}

              <span
                className={`text-[10px] ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {item.label}
              </span>

              {showBadge && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}