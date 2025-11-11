/**
 * Admin Route Actions Component
 *
 * Provides action buttons for managing routes
 * Issue #53: Integrate Route Optimization for Deliveries
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminRouteActionsProps {
  route: any;
}

export function AdminRouteActions({ route }: AdminRouteActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const activateRoute = async () => {
    if (!confirm('Activate this route and notify the driver?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/routes/${route.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });

      if (!response.ok) {
        throw new Error('Failed to activate route');
      }

      router.refresh();
      alert('Route activated successfully!');
    } catch (error) {
      console.error('Error activating route:', error);
      alert('Failed to activate route');
    } finally {
      setLoading(false);
    }
  };

  const cancelRoute = async () => {
    if (!confirm('Cancel this route? All deliveries will be unassigned.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/routes/${route.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel route');
      }

      router.refresh();
      alert('Route cancelled successfully');
    } catch (error) {
      console.error('Error cancelling route:', error);
      alert('Failed to cancel route');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoute = async () => {
    if (
      !confirm(
        'Delete this route permanently? This action cannot be undone.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/routes/${route.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete route');
      }

      router.push('/admin/routes');
      alert('Route deleted successfully');
    } catch (error) {
      console.error('Error deleting route:', error);
      alert('Failed to delete route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {route.status === 'draft' && (
        <button
          onClick={activateRoute}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Activating...' : 'Activate Route'}
        </button>
      )}

      {(route.status === 'draft' || route.status === 'active') && (
        <button
          onClick={cancelRoute}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Cancelling...' : 'Cancel Route'}
        </button>
      )}

      {(route.status === 'cancelled' || route.status === 'completed') && (
        <button
          onClick={deleteRoute}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Deleting...' : 'Delete Route'}
        </button>
      )}
    </div>
  );
}
