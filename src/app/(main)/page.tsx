import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import InterestedButton from "@/components/InterestedButton";
import CityFilter from "@/components/CityFilter";

interface Props {
  searchParams: Promise<{ city?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { city: selectedCity } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get profile only if logged in
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const userCity = profile?.current_city?.trim() || null;
  const filterCity = selectedCity || null;

  // Hide past events
  const now = new Date().toISOString();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  let query = supabase
    .from("activities")
    .select(`
      *,
      profiles:creator_id (
        full_name
      ),
      activity_participants (
        user_id,
        status
      )
    `)
    .or(
      `start_time.gte.${now},and(start_time.is.null,created_at.gte.${sevenDaysAgo})`
    )
    .order("created_at", { ascending: false })
    .limit(30);

  // Apply city filter
  if (filterCity && filterCity !== "All") {
    query = query.ilike("city", `%${filterCity}%`);
  }

  const { data: activities } = await query;

  return (
    <div>
      {/* ========== HERO SECTION ========== */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-52 md:h-64">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative h-full flex flex-col justify-end p-5 text-white">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            {user
              ? `Hello ${profile?.full_name?.split(" ")[0] || "Traveler"} 👋`
              : "Find your people in the hills"}
          </h1>
          <p className="text-sm text-white/80 mt-1 mb-4">
            Connect with travellers, join meetups, yoga, hikes & more
          </p>

          <div className="flex gap-3">
            {user ? (
              <>
                <Link
                  href="/create"
                  className="bg-yellow-400 text-black text-sm font-semibold px-4 py-2 rounded-full"
                >
                  Create Activity
                </Link>
                <Link
                  href="/map"
                  className="bg-white/20 backdrop-blur text-white text-sm font-medium px-4 py-2 rounded-full border border-white/30"
                >
                  Open Map
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-yellow-400 text-black text-sm font-semibold px-4 py-2 rounded-full"
                >
                  Join Musafir
                </Link>
                <Link
                  href="/login"
                  className="bg-white/20 backdrop-blur text-white text-sm font-medium px-4 py-2 rounded-full border border-white/30"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========== CITY FILTER ========== */}
      <CityFilter currentCity={userCity} />

      {/* ========== ACTIVITIES SECTION ========== */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {filterCity && filterCity !== "All"
            ? `In ${filterCity}`
            : "Recent Activities"}
        </h2>
        {user && (
          <Link href="/map" className="text-sm text-yellow-600 font-medium">
            View Map →
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity) => {
            const isInterested = user
              ? activity.activity_participants?.some(
                  (p: any) => p.user_id === user.id
                )
              : false;

            return (
              <div
                key={activity.id}
                className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition"
              >
                <Link
                  href={user ? `/activity/${activity.id}` : "/login"}
                  className="block"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full capitalize">
                      {activity.activity_type}
                    </span>
                    {activity.city && (
                      <span className="text-xs text-gray-400">
                        {activity.city}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 leading-snug">
                    {activity.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    by {activity.profiles?.full_name || "Someone"}
                  </p>

                  {activity.location_name && (
                    <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
                      <span>📍</span> {activity.location_name}
                    </p>
                  )}

                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {activity.description}
                    </p>
                  )}
                </Link>

                <div className="mt-4">
                  {user ? (
                    <InterestedButton
                      activityId={activity.id}
                      initialInterested={!!isInterested}
                    />
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full text-center bg-yellow-400 text-black text-sm font-bold py-3 rounded-2xl"
                    >
                      Login to Join
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border p-8 text-center">
            <p className="text-gray-500 mb-3">
              {filterCity && filterCity !== "All"
                ? `No activities in ${filterCity} yet`
                : "No activities yet"}
            </p>
            {user ? (
              <Link
                href="/create"
                className="inline-block bg-yellow-400 text-black font-medium px-6 py-2.5 rounded-full text-sm"
              >
                Create the first one
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-block bg-yellow-400 text-black font-medium px-6 py-2.5 rounded-full text-sm"
              >
                Join to create activities
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}