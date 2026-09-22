import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ActiveNowPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get people who have location (we'll show recent ones + current user)
  const { data: activePeople } = await supabase
    .from("profiles")
    .select(
      "id, full_name, bio, current_city, interests, last_seen, latitude, longitude, avatar_url"
    )
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("last_seen", { ascending: false })
    .limit(30);

  // Also get current user profile to make sure we always show "You"
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, bio, current_city, interests, last_seen, latitude, longitude, avatar_url"
    )
    .eq("id", user?.id || "")
    .single();

  // Merge: make sure current user is always in the list if they have location
  let people = activePeople || [];

  if (
    currentProfile &&
    currentProfile.latitude &&
    currentProfile.longitude
  ) {
    const alreadyIncluded = people.some((p) => p.id === currentProfile.id);
    if (!alreadyIncluded) {
      people = [currentProfile, ...people];
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Active Now</h1>
        <p className="text-gray-500 mt-1">
          People who shared their location
        </p>
      </div>

      <div className="space-y-4">
        {people.length > 0 ? (
          people.map((person) => {
            const isYou = person.id === user?.id;

            return (
              <div
                key={person.id}
                className="bg-white rounded-2xl border p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-yellow-100 flex-shrink-0 flex items-center justify-center">
                    {person.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt={person.full_name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-yellow-800">
                        {person.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-semibold text-lg truncate">
                        {person.full_name || "Traveler"}
                        {isYou && (
                          <span className="ml-2 text-xs font-medium text-yellow-600">
                            (You)
                          </span>
                        )}
                      </h2>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                        Active
                      </span>
                    </div>

                    {person.current_city && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        📍 {person.current_city}
                      </p>
                    )}

                    {person.bio && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {person.bio}
                      </p>
                    )}

                    {person.interests && person.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {person.interests
                          .slice(0, 4)
                          .map((interest: string) => (
                            <span
                              key={interest}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border p-8 text-center">
            <p className="text-gray-500 mb-2">No one is active right now</p>
            <p className="text-sm text-gray-400 mb-4">
              Update your location on the Profile page to appear here.
            </p>
            <Link
              href="/profile"
              className="inline-block bg-yellow-400 text-black text-sm font-medium px-5 py-2 rounded-full"
            >
              Go to Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}