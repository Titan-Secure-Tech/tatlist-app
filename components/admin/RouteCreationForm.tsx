/**
 * Route Creation Form Component
 *
 * Select deliveries and create optimized route
 * Issue #53: Integrate Route Optimization for Deliveries
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RouteCreationFormProps {
  availableDeliveries: any[];
  availableDrivers: any[];
}

export function RouteCreationForm({
  availableDeliveries,
  availableDrivers,
}: RouteCreationFormProps) {
  const router = useRouter();
  const [selectedDeliveries, setSelectedDeliveries] = useState<Set<string>>(
    new Set()
  );
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [routeName, setRouteName] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDelivery = (deliveryId: string) => {
    const newSelected = new Set(selectedDeliveries);
    if (newSelected.has(deliveryId)) {
      newSelected.delete(deliveryId);
    } else {
      if (newSelected.size >= 12) {
        setError('Maximum 12 deliveries per route (Mapbox limitation)');
        return;
      }
      newSelected.add(deliveryId);
    }
    setSelectedDeliveries(newSelected);
    setError(null);
  };

  const selectAll = () => {
    const allIds = availableDeliveries.slice(0, 12).map((d) => d.id);
    setSelectedDeliveries(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedDeliveries(new Set());
  };

  const handleOptimize = async () => {
    if (selectedDeliveries.size === 0) {
      setError('Please select at least one delivery');
      return;
    }

    if (!selectedDriver) {
      setError('Please select a driver');
      return;
    }

    setOptimizing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/routes/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: selectedDriver,
          delivery_ids: Array.from(selectedDeliveries),
          route_name: routeName || undefined,
          round_trip: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create route');
      }

      const result = await response.json();

      // Redirect to the created route
      router.push(`/admin/routes/${result.route_id}`);
    } catch (err) {
      console.error('Error creating route:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create optimized route'
      );
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Driver Selection */}
      <div className="bg-background border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">1. Select Driver</h2>

        {availableDrivers.length === 0 ? (
          <p className="text-muted-foreground">No drivers available</p>
        ) : (
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">Choose a driver...</option>
            {availableDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} ({driver.email})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Route Name (Optional) */}
      <div className="bg-background border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">2. Route Name (Optional)</h2>
        <input
          type="text"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          placeholder="e.g., Morning Route - Downtown Tampa"
          className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Delivery Selection */}
      <div className="bg-background border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            3. Select Deliveries ({selectedDeliveries.size} / 12 selected)
          </h2>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-accent"
            >
              Select All (Max 12)
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-accent"
            >
              Clear
            </button>
          </div>
        </div>

        {availableDeliveries.length === 0 ? (
          <p className="text-muted-foreground">
            No pending deliveries available for routing
          </p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {availableDeliveries.map((delivery) => {
              const order = delivery.order;
              const address = order.delivery_address;
              const isSelected = selectedDeliveries.has(delivery.id);

              return (
                <div
                  key={delivery.id}
                  onClick={() => toggleDelivery(delivery.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-border hover:border-foreground/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 text-brand border-border rounded focus:ring-brand"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Order #{order.order_number}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.user?.name || 'Unknown Customer'}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-secondary text-foreground rounded">
                          {delivery.status}
                        </span>
                      </div>

                      <p className="text-sm text-foreground mb-1">
                        {address?.formatted_address ||
                          address?.street ||
                          'Address unavailable'}
                      </p>

                      {address?.city && address?.state && (
                        <p className="text-xs text-muted-foreground">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                      )}

                      {!address?.latitude || !address?.longitude ? (
                        <p className="text-xs text-destructive mt-2">
                          ⚠️ Missing coordinates - cannot optimize
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Optimize Button */}
      <div className="bg-background border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Ready to optimize?
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedDeliveries.size} deliveries selected
              {selectedDriver &&
                ` for ${availableDrivers.find((d) => d.id === selectedDriver)?.name}`}
            </p>
          </div>

          <button
            onClick={handleOptimize}
            disabled={
              optimizing ||
              selectedDeliveries.size === 0 ||
              !selectedDriver
            }
            className="px-6 py-3 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {optimizing ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Optimizing Route...
              </span>
            ) : (
              'Create Optimized Route'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
