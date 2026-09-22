"use client";

import dynamic from "next/dynamic";

// Load the map only on the client (no SSR)
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[70vh]">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Nearby Map</h1>
        <p className="text-gray-500 text-sm mt-1">
          Black = You • Yellow = Activities
        </p>
      </div>

      <Map />
    </div>
  );
}