import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import UpdateLocationButton from "@/components/UpdateLocationButton";
import AvatarUpload from "@/components/AvatarUpload";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get user's posted activities
  const { data: myActivities } = await supabase
    .from("activities")
    .select("id, title, activity_type, location_name, city, created_at, start_time")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const hasLocation = profile?.latitude && profile?.longitude;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link
          href="/profile/edit"
          className="text-sm bg-yellow-400 text-black px-4 py-1.5 rounded-full font-medium"
        >
          Edit
        </Link>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <AvatarUpload
          currentAvatarUrl={profile?.avatar_url}
          userId={user.id}
          fullName={profile?.full_name}
        />
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border p-5 space-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium text-lg">
            {profile?.full_name || "Not set"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Bio</p>
          <p className="font-medium">{profile?.bio || "No bio yet"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Age</p>
          <p className="font-medium">{profile?.age || "Not set"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Current City</p>
          <p className="font-medium">
            {profile?.current_city || "Not set"}
          </p>
        </div>

        {profile?.interests && profile.interests.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Social Links */}
            {(profile?.instagram || profile?.facebook || profile?.linkedin) && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Social</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.instagram && (
                    <a
                      href={profile.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-pink-50 text-pink-600 px-3 py-1.5 rounded-full font-medium hover:bg-pink-100 transition"
                    >
                      Instagram
                    </a>
                  )}
                  {profile?.facebook && (
                    <a
                      href={profile.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition"
                    >
                      Facebook
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-sky-50 text-sky-700 px-3 py-1.5 rounded-full font-medium hover:bg-sky-100 transition"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
        </div>

      {/* My Activities */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">My Activities</h2>
          <span className="text-sm text-gray-400">
            {myActivities?.length || 0}
          </span>
        </div>

        {myActivities && myActivities.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {myActivities.map((activity) => (
              <Link
                key={activity.id}
                href={`/activity/${activity.id}`}
                className="bg-white rounded-xl border p-4 hover:border-yellow-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mb-1.5 capitalize">
                      {activity.activity_type}
                    </span>
                    <h3 className="font-medium text-gray-900">
                      {activity.title}
                    </h3>
                    {activity.location_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {activity.location_name}
                        {activity.city && ` • ${activity.city}`}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-300 text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-6 text-center">
            <p className="text-gray-500 text-sm mb-3">
              You haven’t created any activities yet
            </p>
            <Link
              href="/create"
              className="inline-block bg-yellow-400 text-black text-sm font-medium px-5 py-2 rounded-full"
            >
              Create Activity
            </Link>
          </div>
        )}
      </div>

      {/* Location Section */}
      <div className="bg-white rounded-2xl border p-5 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold">Your Location</h2>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              hasLocation
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {hasLocation ? "Active" : "Not set"}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {hasLocation
            ? "Your location is saved. We can show you nearby activities and people."
            : "We use your location to show nearby activities and people."}
        </p>

        {hasLocation && (
          <p className="text-xs text-gray-400 mb-4">
            Lat: {profile.latitude?.toFixed(4)}, Lng:{" "}
            {profile.longitude?.toFixed(4)}
          </p>
        )}

        <UpdateLocationButton />
      </div>

      {/* Logout */}
      <form
        action={async () => {
          "use server";
          const supabase = await createClient();
          await supabase.auth.signOut();
          redirect("/login");
        }}
      >
        <button
          type="submit"
          className="w-full border border-red-300 text-red-500 py-3 rounded-xl font-medium hover:bg-red-50 transition"
        >
          Logout
        </button>
      </form>
    </div>
  );
}