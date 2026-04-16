/**
 * Navigation Buttons Component
 *
 * Provides buttons to open navigation in Google Maps, Apple Maps, or Waze
 * Issue #53: Integrate Route Optimization for Deliveries
 */

'use client';

import { useEffect, useState } from 'react';

interface NavigationButtonsProps {
  routeId: string;
  stops: any[];
  className?: string;
}

export function NavigationButtons({
  routeId,
  stops,
  className = '',
}: NavigationButtonsProps) {
  const [navigationUrls, setNavigationUrls] = useState<any>(null);

  useEffect(() => {
    // Generate navigation URLs
    const pendingStops = stops.filter(
      (s) => s.status === 'pending' || s.status === 'enroute'
    );

    if (pendingStops.length === 0) {
      return;
    }

    // Order by stop_number
    const orderedStops = [...pendingStops].sort(
      (a, b) => a.stop_number - b.stop_number
    );

    const origin = orderedStops[0];
    const destination = orderedStops[orderedStops.length - 1];
    const waypoints = orderedStops.slice(1, -1);

    // Google Maps URL
    let googleUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`;
    if (waypoints.length > 0) {
      const waypointsStr = waypoints
        .map((w) => `${w.latitude},${w.longitude}`)
        .join('|');
      googleUrl += `&waypoints=${waypointsStr}`;
    }
    googleUrl += '&travelmode=driving';

    // Apple Maps URL (single destination)
    const appleUrl = `http://maps.apple.com/?daddr=${origin.latitude},${origin.longitude}&dirflg=d`;

    // Waze URL (single destination)
    const wazeUrl = `https://waze.com/ul?ll=${origin.latitude},${origin.longitude}&navigate=yes`;

    setNavigationUrls({
      google: googleUrl,
      apple: appleUrl,
      waze: wazeUrl,
    });
  }, [stops]);

  if (!navigationUrls) {
    return (
      <div
        className={`bg-secondary rounded-xl p-6 text-center ${className}`}
      >
        <p className="text-muted-foreground">
          No pending stops. All deliveries completed!
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-background rounded-xl border border-border p-4 ${className}`}>
      <h3 className="font-semibold mb-4">Start Navigation</h3>

      <div className="space-y-2">
        {/* Google Maps */}
        <a
          href={navigationUrls.google}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <span className="flex items-center">
            <svg
              className="w-5 h-5 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C7.589 0 4 3.589 4 8c0 6.5 8 16 8 16s8-9.5 8-16c0-4.411-3.589-8-8-8zm0 12a4 4 0 110-8 4 4 0 010 8z" />
            </svg>
            Open in Google Maps
          </span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>

        {/* Apple Maps */}
        <a
          href={navigationUrls.apple}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
        >
          <span className="flex items-center">
            <svg
              className="w-5 h-5 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Open in Apple Maps
          </span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>

        {/* Waze */}
        <a
          href={navigationUrls.waze}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-3 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
        >
          <span className="flex items-center">
            <svg
              className="w-5 h-5 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            Open in Waze
          </span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Navigation apps will open the first pending stop
      </p>
    </div>
  );
}
