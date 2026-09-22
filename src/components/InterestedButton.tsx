"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  activityId: string;
  initialInterested: boolean;
}

export default function InterestedButton({
  activityId,
  initialInterested,
}: Props) {
  const [isInterested, setIsInterested] = useState(initialInterested);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleClick = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    if (isInterested) {
      // Remove interest
      await supabase
        .from("activity_participants")
        .delete()
        .eq("activity_id", activityId)
        .eq("user_id", user.id);

      setIsInterested(false);
    } else {
      // Add interest
      await supabase.from("activity_participants").insert({
        activity_id: activityId,
        user_id: user.id,
        status: "interested",
      });

      setIsInterested(true);
    }

    setLoading(false);
  };


  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full text-sm font-bold py-3 rounded-2xl transition ${
  isInterested
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-yellow-400 hover:bg-yellow-500 text-black"
} disabled:opacity-50`}
    >
      {loading
        ? "Please wait..."
        : isInterested
        ? "Interested ✓"
        : "Interested"}
    </button>
  );
}