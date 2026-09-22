"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdateLocationButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("You must be logged in");
          setLoading(false);
          return;
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            latitude,
            longitude,
            last_seen: new Date().toISOString(),
            is_active: true,
          })
          .eq("id", user.id);

        if (error) {
          setError(error.message);
        } else {
          setMessage("Location updated successfully!");
        }

        setLoading(false);
      },
      (err) => {
        setError("Unable to get your location. Please allow location access.");
        setLoading(false);
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleUpdateLocation}
        disabled={loading}
        className="w-full bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
      >
        {loading ? "Getting location..." : "Update My Location"}
      </button>

      {message && (
        <p className="text-green-600 text-sm text-center mt-2">{message}</p>
      )}
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
    </div>
  );
}