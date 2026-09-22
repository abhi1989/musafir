import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import InterestedButton from "@/components/InterestedButton";
import ConnectButton from "@/components/ConnectButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ActivityDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get activity with creator and participants
  const { data: activity } = await supabase
    .from("activities")
    .select(`
      *,
      profiles:creator_id (
        full_name,
        bio,
        current_city
      ),
      activity_participants (
        user_id,
        status,
        profiles:user_id (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("id", id)
    .single();

  if (!activity) {
    notFound();
  }

  const isInterested = activity.activity_participants?.some(
    (p: any) => p.user_id === user?.id
  );

  const interestedPeople = activity.activity_participants || [];

  return (
    <div>
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-6"
      >
        ← Back to Home
      </Link>

      {/* Activity Card */}
      <div className="bg-white rounded-2xl border p-6 mb-6">
        <span className="inline-block text-xs font-medium bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full mb-3 capitalize">
          {activity.activity_type}
        </span>

        <h1 className="text-2xl font-bold mb-2">{activity.title}</h1>

        <p className="text-sm text-gray-500 mb-4">
          Created by{" "}
          <span className="font-medium text-gray-800">
            {activity.profiles?.full_name || "Someone"}
          </span>
        </p>

        {activity.location_name && (
          <p className="text-sm text-gray-600 mb-3">
            📍 {activity.location_name}
            {activity.city && ` • ${activity.city}`}
          </p>
        )}

        {activity.description && (
          <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
            {activity.description}
          </p>
        )}

        <InterestedButton
          activityId={activity.id}
          initialInterested={!!isInterested}
        />
        {user && activity.creator_id !== user.id && (
          <div className="mt-3">
            <ConnectButton
              activityId={activity.id}
              hostId={activity.creator_id}
              currentUserId={user.id}
            />
          </div>
        )}
      </div>

      {/* Interested People */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-semibold mb-4">
          Interested People ({interestedPeople.length})
        </h2>

        {interestedPeople.length > 0 ? (
          <div className="space-y-3">
            {interestedPeople.map((person: any) => (
              <div
                key={person.user_id}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  {person.profiles?.avatar_url ? (
                    <img
                      src={person.profiles.avatar_url}
                      alt={person.profiles?.full_name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-yellow-800">
                      {person.profiles?.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {person.profiles?.full_name || "Traveler"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {person.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No one has shown interest yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
}