"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  activityId: string;
  hostId: string;
  currentUserId: string;
}

export default function ConnectButton({
  activityId,
  hostId,
  currentUserId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Don't show button if user is the host
  if (currentUserId === hostId) {
    return null;
  }

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("activity_id", activityId)
        .eq("participant_id", currentUserId)
        .single();

      if (existing) {
        // Go to existing conversation
        router.push(`/messages/${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          activity_id: activityId,
          host_id: hostId,
          participant_id: currentUserId,
        })
        .select("id")
        .single();

      if (convError) throw convError;

      // Send first message
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content: "Hi! I'm interested in this activity. Would love to connect.",
      });

      router.push(`/messages/${conversation.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full bg-black text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
      >
        {loading ? "Connecting..." : "Connect with Host"}
      </button>
      {error && (
        <p className="text-red-500 text-xs text-center mt-2">{error}</p>
      )}
    </div>
  );
}