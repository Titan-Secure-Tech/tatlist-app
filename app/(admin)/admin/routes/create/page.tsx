/**
 * Admin Create Route Page
 *
 * Select deliveries and create optimized route
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RouteCreationForm } from '@/components/admin/RouteCreationForm';

export default async function CreateRoutePage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'admin') {
    redirect('/');
  }

  // Fetch available deliveries (pending or ready_for_pickup, not yet assigned to a route)
  const { data: deliveries } = await supabase
    .from('deliveries')
    .select(
      `
      id,
      order_id,
      status,
      driver_id,
      order:orders!inner (
        id,
        order_number,
        delivery_address,
        customer_email,
        fulfillment_type,
        user:users (
          name,
          phone_number
        )
      )
    `
    )
    .in('status', ['pending', 'ready_for_pickup'])
    .eq('order.fulfillment_type', 'delivery')
    .is('driver_id', null);

  // Fetch available drivers
  const { data: drivers } = await supabase
    .from('users')
    .select('id, name, email, phone_number')
    .eq('role', 'driver')
    .order('name', { ascending: true });

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Optimized Route</h1>
        <p className="text-gray-600">
          Select deliveries and assign to a driver to create an optimized
          multi-stop route
        </p>
      </div>

      <RouteCreationForm
        availableDeliveries={deliveries || []}
        availableDrivers={drivers || []}
      />
    </div>
  );
}
