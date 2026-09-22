import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get conversations where user is host or participant
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      id,
      last_message_at,
      activity_id,
      host_id,
      participant_id,
      activities:activity_id (
        title,
        activity_type
      ),
      host:host_id (
        full_name,
        avatar_url
      ),
      participant:participant_id (
        full_name,
        avatar_url
      )
    `)
    .or(`host_id.eq.${user.id},participant_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="space-y-3">
        {conversations && conversations.length > 0 ? (
          conversations.map((conv: any) => {
              const isHost = conv.host_id === user.id;

              const hostData = Array.isArray(conv.host) ? conv.host[0] : conv.host;
              const participantData = Array.isArray(conv.participant)
                ? conv.participant[0]
                : conv.participant;
              const activityData = Array.isArray(conv.activities)
                ? conv.activities[0]
                : conv.activities;

              const otherPerson = isHost ? participantData : hostData;

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl border p-4 hover:border-yellow-300 transition"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-yellow-100 flex-shrink-0 flex items-center justify-center">
                    {otherPerson?.avatar_url ? (
                      <img
                        src={otherPerson.avatar_url}
                        alt={otherPerson?.full_name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-yellow-800">
                        {otherPerson?.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-semibold truncate">
                        {otherPerson?.full_name || "Traveler"}
                      </h2>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {conv.last_message_at
                          ? new Date(conv.last_message_at).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {activityData?.title || "Activity"}
                    </p>
                  </div>
                </Link>
              );
          })
        ) : (
          <div className="bg-white rounded-2xl border p-8 text-center">
            <p className="text-gray-500 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400">
              Connect with activity hosts to start a conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}