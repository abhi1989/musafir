"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// ======================
// Custom Icons
// ======================
const userIcon = L.divIcon({
  className: "custom-user-icon",
  html: `
    <div style="
      background-color: #111111;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 2px #111111, 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
});

const activityIcon = L.divIcon({
  className: "custom-activity-icon",
  html: `
    <div style="
      background-color: #FACC15;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2.5px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

// ======================
// Distance calculation (Haversine formula)
// ======================
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

interface Activity {
  id: string;
  title: string;
  activity_type: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
}

export default function Map() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);

        const { data } = await supabase
          .from("activities")
          .select("id, title, activity_type, location_name, latitude, longitude")
          .not("latitude", "is", null)
          .not("longitude", "is", null);

        if (data) {
          // Filter only activities within 10 km
          const nearby = (data as Activity[])
            .map((activity) => {
              if (!activity.latitude || !activity.longitude) return null;

              const distance = getDistanceFromLatLonInKm(
                latitude,
                longitude,
                activity.latitude,
                activity.longitude
              );

              return { ...activity, distance };
            })
            .filter((activity) => activity && activity.distance! <= 10)
            .sort((a, b) => (a!.distance! - b!.distance!)) as Activity[];

          setActivities(nearby);
        }

        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to get your location. Please allow location access.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-gray-500">Getting your location...</p>
      </div>
    );
  }

  if (error || !position) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <p className="text-red-500 mb-3 font-medium">
          {error || "Location not available"}
        </p>
        <p className="text-sm text-gray-500">
          Please allow location permission and refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[65vh] rounded-2xl overflow-hidden border shadow-sm">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 10 km radius circle */}
        <Circle
          center={position}
          radius={10000} // 10 km in meters
          pathOptions={{
            color: "#FACC15",
            fillColor: "#FACC15",
            fillOpacity: 0.08,
            weight: 1,
          }}
        />

        {/* User - Black */}
        <Marker position={position} icon={userIcon}>
          <Popup>
            <div className="text-sm font-medium">You are here</div>
          </Popup>
        </Marker>

        {/* Nearby Activities - Yellow */}
        {activities.map((activity) =>
          activity.latitude && activity.longitude ? (
            <Marker
              key={activity.id}
              position={[activity.latitude, activity.longitude]}
              icon={activityIcon}
            >
              <Popup>
                <div className="text-sm min-w-[140px]">
                  <p className="font-semibold">{activity.title}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">
                    {activity.activity_type}
                  </p>
                  {activity.distance && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activity.distance.toFixed(1)} km away
                    </p>
                  )}
                  {activity.location_name && (
                    <p className="text-xs text-gray-600 mt-1">
                      📍 {activity.location_name}
                    </p>
                  )}
                  <Link
                    href={`/activity/${activity.id}`}
                    className="inline-block mt-2 text-xs font-medium text-yellow-600 hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}