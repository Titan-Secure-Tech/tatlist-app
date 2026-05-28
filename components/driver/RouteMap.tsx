/**
 * Route Map Component
 *
 * Displays route with polyline and numbered stop markers
 * Issue #53: Integrate Route Optimization for Deliveries
 */

'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RouteMapProps {
  route: any;
  stops: any[];
  currentStop?: any;
}

export function RouteMap({ route, stops, currentStop }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [
        route.start_location?.lng || -82.4572,
        route.start_location?.lat || 27.9506,
      ],
      zoom: 11,
    });

    const mapInstance = map.current;

    mapInstance.on('load', () => {
      // Add route polyline if available
      if (route.route_geometry) {
        mapInstance.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.route_geometry,
          },
        });

        mapInstance.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#2563eb',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });
      }

      // Add numbered markers for each stop
      stops.forEach((stop, index) => {
        const el = document.createElement('div');
        el.className = 'route-marker';

        const isCompleted = stop.status === 'completed';
        const isCurrent = currentStop?.id === stop.id;
        const isPending = stop.status === 'pending';

        el.innerHTML = `
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
            isCompleted
              ? 'bg-green-600 text-white'
              : isCurrent
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-900 border-2 border-gray-300'
          }">
            ${stop.stop_number}
          </div>
        `;

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([stop.longitude, stop.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <p class="font-semibold mb-1">Stop #${stop.stop_number}</p>
                <p class="text-sm text-gray-600">${(stop.address as any)?.formatted_address || 'Address'}</p>
                <p class="text-xs mt-1">
                  <span class="inline-block px-2 py-1 rounded ${
                    isCompleted
                      ? 'bg-green-100 text-green-800'
                      : isCurrent
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                  }">
                    ${stop.status}
                  </span>
                </p>
              </div>
            `)
          )
          .addTo(mapInstance);
      });

      // Fit map to show all stops
      if (stops.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();

        stops.forEach((stop) => {
          bounds.extend([stop.longitude, stop.latitude]);
        });

        mapInstance.fitBounds(bounds, {
          padding: 50,
          maxZoom: 14,
        });
      }
    });

    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, [route, stops, currentStop]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div
        ref={mapContainer}
        className="w-full h-[500px]"
        style={{ minHeight: '500px' }}
      />

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600" />
            <span className="text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500" />
            <span className="text-gray-700">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300" />
            <span className="text-gray-700">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
