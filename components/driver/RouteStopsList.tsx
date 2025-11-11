/**
 * Route Stops List Component
 *
 * Displays ordered list of stops with action buttons
 * Issue #53: Integrate Route Optimization for Deliveries
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RouteStopsListProps {
  routeId: string;
  stops: any[];
  currentStop?: any;
}

export function RouteStopsList({
  routeId,
  stops,
  currentStop,
}: RouteStopsListProps) {
  const router = useRouter();
  const [updatingStopId, setUpdatingStopId] = useState<string | null>(null);

  const updateStopStatus = async (
    stopId: string,
    status: string,
    notes?: string
  ) => {
    setUpdatingStopId(stopId);

    try {
      const response = await fetch(
        `/api/driver/routes/${routeId}/stops/${stopId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, notes }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update stop');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating stop:', error);
      alert('Failed to update stop. Please try again.');
    } finally {
      setUpdatingStopId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'enroute':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'arrived':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'skipped':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Stops ({stops.length})</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {stops.map((stop) => {
          const isUpdating = updatingStopId === stop.id;
          const isCurrent = currentStop?.id === stop.id;
          const isCompleted = stop.status === 'completed';
          const isSkipped = stop.status === 'skipped';
          const order = stop.delivery?.order;
          const customer = order?.user;

          return (
            <div
              key={stop.id}
              className={`p-4 ${isCurrent ? 'bg-orange-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Stop Number */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {stop.stop_number}
                </div>

                {/* Stop Details */}
                <div className="flex-1 min-w-0">
                  {/* Address */}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {(stop.address as any)?.formatted_address ||
                      (stop.address as any)?.street ||
                      'Address unavailable'}
                  </h3>

                  {/* Customer Info */}
                  {customer && (
                    <div className="text-sm text-gray-600 mb-2">
                      <p>{customer.name}</p>
                      {customer.phone_number && (
                        <a
                          href={`tel:${customer.phone_number}`}
                          className="text-blue-600 hover:underline"
                        >
                          {customer.phone_number}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Order Number */}
                  {order && (
                    <p className="text-sm text-gray-600 mb-2">
                      Order: #{order.order_number}
                    </p>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(stop.status)}`}
                  >
                    {stop.status.charAt(0).toUpperCase() + stop.status.slice(1)}
                  </span>

                  {/* Action Buttons */}
                  {!isCompleted && !isSkipped && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {stop.status === 'pending' && (
                        <button
                          onClick={() => updateStopStatus(stop.id, 'enroute')}
                          disabled={isUpdating}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? 'Updating...' : 'Start Navigation'}
                        </button>
                      )}

                      {(stop.status === 'enroute' || stop.status === 'pending') && (
                        <button
                          onClick={() => updateStopStatus(stop.id, 'arrived')}
                          disabled={isUpdating}
                          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? 'Updating...' : 'Mark Arrived'}
                        </button>
                      )}

                      {stop.status === 'arrived' && (
                        <button
                          onClick={() => updateStopStatus(stop.id, 'completed')}
                          disabled={isUpdating}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? 'Updating...' : 'Complete Delivery'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const reason = prompt('Enter reason for skipping:');
                          if (reason) {
                            updateStopStatus(stop.id, 'skipped', reason);
                          }
                        }}
                        disabled={isUpdating}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Skip Stop
                      </button>
                    </div>
                  )}

                  {/* Notes */}
                  {stop.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-900">
                        <strong>Note:</strong> {stop.notes}
                      </p>
                    </div>
                  )}

                  {/* Time Info */}
                  {(stop.arrival_time || stop.departure_time) && (
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      {stop.arrival_time && (
                        <p>
                          Arrived:{' '}
                          {new Date(stop.arrival_time).toLocaleTimeString()}
                        </p>
                      )}
                      {stop.departure_time && (
                        <p>
                          Departed:{' '}
                          {new Date(stop.departure_time).toLocaleTimeString()}
                        </p>
                      )}
                      {stop.time_spent_minutes && (
                        <p>Time spent: {stop.time_spent_minutes} min</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
