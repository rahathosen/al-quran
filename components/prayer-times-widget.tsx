"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Clock, MapPin, Sun, Moon, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrayerTime {
  name: string;
  time: string;
  icon?: React.ReactNode;
}

export default function PrayerTimesWidget() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [location, setLocation] = useState<string>("Dhaka, Bangladesh");
  const [date, setDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayerIndex, setNextPrayerIndex] = useState<number | null>(null);

  // Default coordinates for Dhaka, Bangladesh
  const defaultLatitude = 23.8103;
  const defaultLongitude = 90.4125;

  useEffect(() => {
    // Get current date in format YYYY-MM-DD
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setDate(formattedDate);

    // Fetch prayer times for Dhaka by default
    fetchPrayerTimes(defaultLatitude, defaultLongitude, true);
  }, []);

  // Function to fetch prayer times
  const fetchPrayerTimes = async (
    latitude: number,
    longitude: number,
    isDefault = false
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current timestamp
      const today = new Date();

      // API URL for prayer times
      const url = `https://api.aladhan.com/v1/timings/${Math.floor(
        today.getTime() / 1000
      )}?latitude=${latitude}&longitude=${longitude}&method=2`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch prayer times");
      }

      const data = await response.json();

      if (data.code === 200 && data.data) {
        // Format prayer times
        const timings = data.data.timings;
        const formattedTimes: PrayerTime[] = [
          {
            name: "Fajr",
            time: formatTime(timings.Fajr),
            icon: <Moon className="h-3 w-3" />,
          },
          {
            name: "Sunrise",
            time: formatTime(timings.Sunrise),
            icon: <Sun className="h-3 w-3" />,
          },
          {
            name: "Dhuhr",
            time: formatTime(timings.Dhuhr),
            icon: <Sun className="h-3 w-3" />,
          },
          {
            name: "Asr",
            time: formatTime(timings.Asr),
            icon: <Sun className="h-3 w-3" />,
          },
          {
            name: "Maghrib",
            time: formatTime(timings.Maghrib),
            icon: <Sun className="h-3 w-3" />,
          },
          {
            name: "Isha",
            time: formatTime(timings.Isha),
            icon: <Moon className="h-3 w-3" />,
          },
        ];

        setPrayerTimes(formattedTimes);
        updateNextPrayer(formattedTimes);

        // Get location name from reverse geocoding if not default
        if (!isDefault) {
          try {
            const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();

            if (geocodeData.address) {
              const city =
                geocodeData.address.city ||
                geocodeData.address.town ||
                geocodeData.address.village ||
                geocodeData.address.county ||
                "Unknown";
              const country = geocodeData.address.country || "";
              setLocation(`${city}, ${country}`);
            } else {
              setLocation("Unknown location");
            }
          } catch (error) {
            console.error("Error getting location name:", error);
            setLocation("Unknown location");
          }
        }
      } else {
        throw new Error("Invalid response from prayer times API");
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      setError("Failed to load prayer times. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format time from 24h to 12h format
  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(":");
    const hour = Number.parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Update next prayer time
  const updateNextPrayer = (prayers: PrayerTime[]) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let i = 0; i < prayers.length; i++) {
      const prayer = prayers[i];
      const [hourStr, rest] = prayer.time.split(":");
      const [minuteStr, ampm] = rest.split(" ");

      let hour = Number.parseInt(hourStr);
      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;

      const minute = Number.parseInt(minuteStr);

      if (
        hour > currentHour ||
        (hour === currentHour && minute > currentMinute)
      ) {
        setNextPrayerIndex(i);
        return;
      }
    }

    // If no next prayer found today, return the first prayer of the day
    setNextPrayerIndex(0);
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Location access denied. Using default location.");
          // Use default location (Dhaka)
          fetchPrayerTimes(defaultLatitude, defaultLongitude, true);
        }
      );
    } else {
      setError(
        "Geolocation is not supported by your browser. Using default location."
      );
      // Use default location (Dhaka)
      fetchPrayerTimes(defaultLatitude, defaultLongitude, true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1a5e63]/90 to-[#1a5e63] rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white text-sm font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Prayer Times
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-xs text-white/80 flex items-center bg-white/10 px-2 py-1 rounded-full">
            <MapPin className="h-3 w-3 mr-1" />
            {location}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white"
            onClick={getCurrentLocation}
            title="Use current location"
          >
            <Navigation className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 text-white animate-spin mx-auto mb-2" />
            <p className="text-white/80 text-xs">Loading prayer times...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-6 px-4">
          <p className="text-white/80 text-sm mb-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-xs h-7 text-white border-white/20 hover:bg-white/10"
            onClick={() =>
              fetchPrayerTimes(defaultLatitude, defaultLongitude, true)
            }
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {prayerTimes.map((prayer, index) => (
              <div
                key={prayer.name}
                className={`relative overflow-hidden rounded-lg ${
                  nextPrayerIndex === index
                    ? "bg-[#d4af37] text-[#1a5e63]"
                    : "bg-white/10 text-white"
                } p-3 transition-all`}
              >
                {nextPrayerIndex === index && (
                  <div className="absolute top-0 right-0 bg-white/20 px-1.5 py-0.5 text-[8px] font-bold rounded-bl-md">
                    NEXT
                  </div>
                )}
                <div className="flex items-center justify-center mb-2">
                  {prayer.icon}
                  <span className="text-xs font-medium ml-1">
                    {prayer.name}
                  </span>
                </div>
                <p className="text-center text-sm font-medium">{prayer.time}</p>
              </div>
            ))}
          </div>

          {nextPrayerIndex !== null && (
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-xs text-white/90">
                Next prayer:{" "}
                <span className="font-medium text-[#d4af37]">
                  {prayerTimes[nextPrayerIndex].name}
                </span>{" "}
                at{" "}
                <span className="font-medium text-[#d4af37]">
                  {prayerTimes[nextPrayerIndex].time}
                </span>
              </p>
              <p className="text-[10px] text-white/70 mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
