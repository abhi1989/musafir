import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ChatBox from "@/components/ChatBox";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select(`
      id,
      host_id,
      participant_id,
      activity_id,
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
    .eq("id", id)
    .single();

  if (!conversation) {
    notFound();
  }

  // Security check
  if (
    conversation.host_id !== user.id &&
    conversation.participant_id !== user.id
  ) {
    redirect("/messages");
  }

  const isHost = conversation.host_id === user.id;

  // Handle possible array/object from Supabase join
  const hostData = Array.isArray(conversation.host)
    ? conversation.host[0]
    : conversation.host;

  const participantData = Array.isArray(conversation.participant)
    ? conversation.participant[0]
    : conversation.participant;

  const activityData = Array.isArray(conversation.activities)
    ? conversation.activities[0]
    : conversation.activities;

  const otherPerson = isHost ? participantData : hostData;

  // Get messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", id)
    .neq("sender_id", user.id)
    .eq("read", false);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b mb-4">
        <Link href="/messages" className="text-gray-500 text-sm">
          ← Back
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">
            {otherPerson?.full_name || "Traveler"}
          </h1>
          <p className="text-xs text-gray-500 truncate">
            {activityData?.title || "Activity"}
          </p>
        </div>
      </div>

      {/* Chat Box */}
      <ChatBox
        conversationId={id}
        currentUserId={user.id}
        initialMessages={messages || []}
      />
    </div>
  );
}