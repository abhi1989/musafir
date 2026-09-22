"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CITIES } from "@/lib/cities";

export default function CityFilter({ currentCity }: { currentCity?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCity = searchParams.get("city") || currentCity || "All";
  const cities = ["All", ...CITIES];

  const handleSelect = (city: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (city === "All") {
      params.delete("city");
    } else {
      params.set("city", city);
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <div className="mb-5">
      <div className="-mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 pb-1 min-w-max">
          {cities.map((city) => {
            const isActive = selectedCity === city;

            return (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                disabled={isPending}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-yellow-400 text-black"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                } disabled:opacity-60`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loader */}
      {isPending && (
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading activities...</span>
        </div>
      )}
    </div>
  );
}