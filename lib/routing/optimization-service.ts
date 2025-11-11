/**
 * Route Optimization Service
 *
 * Orchestrates creating optimized multi-stop delivery routes
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { createClient } from '@/lib/supabase/server';
import { optimizeDeliveryRoute, RouteWaypoint, DELIVERY_CENTER } from '@/lib/mapbox/client';

export interface DeliveryInfo {
  id: string;
  order_id: string;
  driver_id: string | null;
  status: string;
  order: {
    delivery_address: {
      latitude?: number;
      longitude?: number;
      formatted_address?: string;
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
    customer_email: string;
    user_id: string;
  };
}

export interface OptimizeRouteRequest {
  driver_id: string;
  delivery_ids: string[];
  route_name?: string;
  start_location?: { latitude: number; longitude: number; address?: string };
  end_location?: { latitude: number; longitude: number; address?: string };
  round_trip?: boolean;
}

export interface OptimizeRouteResponse {
  route_id: string;
  route_name: string;
  total_stops: number;
  total_distance_miles: number;
  total_duration_minutes: number;
  optimized_order: number[];
  estimated_start_time: string;
  estimated_end_time: string;
  stops: Array<{
    stop_number: number;
    delivery_id: string;
    order_id: string;
    address: string;
  }>;
}

export class RouteOptimizationService {
  /**
   * Fetch deliveries by IDs
   */
  static async getDeliveries(delivery_ids: string[]): Promise<DeliveryInfo[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        id,
        order_id,
        driver_id,
        status,
        order:orders!inner (
          delivery_address,
          customer_email,
          user_id
        )
      `)
      .in('id', delivery_ids);

    if (error) {
      console.error('Error fetching deliveries:', error);
      throw new Error('Failed to fetch deliveries');
    }

    return data as unknown as DeliveryInfo[];
  }

  /**
   * Validate deliveries can be optimized together
   */
  static validateDeliveries(deliveries: DeliveryInfo[], driver_id: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (deliveries.length === 0) {
      errors.push('No deliveries provided');
      return { valid: false, errors };
    }

    if (deliveries.length > 12) {
      errors.push('Maximum 12 deliveries per route (Mapbox limitation)');
      return { valid: false, errors };
    }

    // Check all deliveries have valid addresses
    deliveries.forEach((delivery, index) => {
      const address = delivery.order.delivery_address;
      if (!address.latitude || !address.longitude) {
        errors.push(
          `Delivery ${index + 1} (Order: ${delivery.order_id}) is missing coordinates`
        );
      }
    });

    // Check all deliveries are in valid status
    const validStatuses = ['pending', 'ready_for_pickup'];
    deliveries.forEach((delivery, index) => {
      if (!validStatuses.includes(delivery.status)) {
        errors.push(
          `Delivery ${index + 1} has invalid status: ${delivery.status}. Must be 'pending' or 'ready_for_pickup'`
        );
      }
    });

    // Check no deliveries already assigned to a different driver
    deliveries.forEach((delivery, index) => {
      if (delivery.driver_id && delivery.driver_id !== driver_id) {
        errors.push(
          `Delivery ${index + 1} is already assigned to a different driver`
        );
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Assign deliveries to driver
   */
  static async assignDeliveriesToDriver(
    delivery_ids: string[],
    driver_id: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('deliveries')
      .update({
        driver_id,
        status: 'assigned',
      })
      .in('id', delivery_ids);

    if (error) {
      console.error('Error assigning deliveries to driver:', error);
      throw new Error('Failed to assign deliveries to driver');
    }
  }

  /**
   * Create optimized route
   */
  static async createOptimizedRoute(
    request: OptimizeRouteRequest
  ): Promise<OptimizeRouteResponse> {
    try {
      // 1. Fetch deliveries
      const deliveries = await this.getDeliveries(request.delivery_ids);

      // 2. Validate deliveries
      const validation = this.validateDeliveries(deliveries, request.driver_id);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // 3. Prepare waypoints for optimization
      const waypoints: RouteWaypoint[] = deliveries.map((delivery) => ({
        latitude: delivery.order.delivery_address.latitude!,
        longitude: delivery.order.delivery_address.longitude!,
        address: delivery.order.delivery_address.formatted_address,
        delivery_id: delivery.id,
      }));

      // 4. Call Mapbox Optimization API
      const optimizationResult = await optimizeDeliveryRoute(waypoints, {
        startLocation: request.start_location,
        endLocation: request.end_location,
        roundTrip: request.round_trip,
      });

      if (!optimizationResult) {
        throw new Error('Failed to optimize route with Mapbox');
      }

      // 5. Assign deliveries to driver
      await this.assignDeliveriesToDriver(request.delivery_ids, request.driver_id);

      // 6. Create route in database
      const supabase = await createClient();

      const start_location = request.start_location || {
        latitude: DELIVERY_CENTER.lat,
        longitude: DELIVERY_CENTER.lng,
        address: DELIVERY_CENTER.address,
      };

      const estimated_start_time = new Date();
      const estimated_end_time = new Date(
        estimated_start_time.getTime() +
          optimizationResult.total_duration_minutes * 60 * 1000
      );

      const route_name =
        request.route_name ||
        `Route - ${new Date().toLocaleDateString()} (${deliveries.length} stops)`;

      const { data: route, error: routeError } = await supabase
        .from('routes')
        .insert({
          driver_id: request.driver_id,
          name: route_name,
          status: 'draft',
          start_location,
          end_location: request.end_location || null,
          optimized_waypoint_order: optimizationResult.waypoint_order,
          total_distance_miles: optimizationResult.total_distance_miles,
          total_duration_minutes: optimizationResult.total_duration_minutes,
          estimated_start_time: estimated_start_time.toISOString(),
          estimated_end_time: estimated_end_time.toISOString(),
          route_geometry: optimizationResult.route_geometry,
          turn_by_turn_directions: optimizationResult.turn_by_turn_directions,
        })
        .select()
        .single();

      if (routeError || !route) {
        console.error('Error creating route:', routeError);
        throw new Error('Failed to create route in database');
      }

      // 7. Create route stops in optimized order
      const route_stops = optimizationResult.waypoint_order.map(
        (originalIndex, optimizedIndex) => {
          const delivery = deliveries[originalIndex];
          return {
            route_id: route.id,
            delivery_id: delivery.id,
            stop_number: optimizedIndex + 1, // 1-indexed
            original_stop_number: originalIndex + 1,
            latitude: delivery.order.delivery_address.latitude!,
            longitude: delivery.order.delivery_address.longitude!,
            address: delivery.order.delivery_address,
            status: 'pending',
          };
        }
      );

      const { error: stopsError } = await supabase
        .from('route_stops')
        .insert(route_stops);

      if (stopsError) {
        console.error('Error creating route stops:', stopsError);
        // Rollback: delete the route
        await supabase.from('routes').delete().eq('id', route.id);
        throw new Error('Failed to create route stops');
      }

      // 8. Build response
      return {
        route_id: route.id,
        route_name: route.name,
        total_stops: deliveries.length,
        total_distance_miles: optimizationResult.total_distance_miles,
        total_duration_minutes: optimizationResult.total_duration_minutes,
        optimized_order: optimizationResult.waypoint_order,
        estimated_start_time: estimated_start_time.toISOString(),
        estimated_end_time: estimated_end_time.toISOString(),
        stops: route_stops.map((stop) => ({
          stop_number: stop.stop_number,
          delivery_id: stop.delivery_id,
          order_id:
            deliveries.find((d) => d.id === stop.delivery_id)?.order_id || '',
          address:
            (stop.address as any)?.formatted_address ||
            (stop.address as any)?.street ||
            'Unknown address',
        })),
      };
    } catch (error) {
      console.error('Error creating optimized route:', error);
      throw error;
    }
  }

  /**
   * Update route waypoint order (manual reordering)
   */
  static async updateRouteOrder(
    route_id: string,
    new_waypoint_order: number[]
  ): Promise<void> {
    const supabase = await createClient();

    // Update route with new order
    const { error: routeError } = await supabase
      .from('routes')
      .update({
        optimized_waypoint_order: new_waypoint_order,
      })
      .eq('id', route_id);

    if (routeError) {
      console.error('Error updating route order:', routeError);
      throw new Error('Failed to update route order');
    }

    // Update stop numbers based on new order
    const { data: stops, error: fetchError } = await supabase
      .from('route_stops')
      .select('id, delivery_id')
      .eq('route_id', route_id)
      .order('original_stop_number', { ascending: true });

    if (fetchError || !stops) {
      throw new Error('Failed to fetch route stops');
    }

    // Update each stop's stop_number based on new order
    const updates = new_waypoint_order.map((originalIndex, newIndex) => {
      const stop = stops[originalIndex];
      return supabase
        .from('route_stops')
        .update({ stop_number: newIndex + 1 })
        .eq('id', stop.id);
    });

    await Promise.all(updates);
  }

  /**
   * Activate route (mark as active and ready for driver)
   */
  static async activateRoute(route_id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('routes')
      .update({
        status: 'active',
        actual_start_time: new Date().toISOString(),
      })
      .eq('id', route_id);

    if (error) {
      console.error('Error activating route:', error);
      throw new Error('Failed to activate route');
    }
  }

  /**
   * Cancel route
   */
  static async cancelRoute(route_id: string): Promise<void> {
    const supabase = await createClient();

    // Update route status
    const { error: routeError } = await supabase
      .from('routes')
      .update({ status: 'cancelled' })
      .eq('id', route_id);

    if (routeError) {
      throw new Error('Failed to cancel route');
    }

    // Unassign deliveries
    const { data: stops } = await supabase
      .from('route_stops')
      .select('delivery_id')
      .eq('route_id', route_id);

    if (stops && stops.length > 0) {
      const delivery_ids = stops.map((s) => s.delivery_id);

      await supabase
        .from('deliveries')
        .update({
          driver_id: null,
          status: 'pending',
        })
        .in('id', delivery_ids);
    }
  }

  /**
   * Get route with stops
   */
  static async getRouteWithStops(route_id: string): Promise<{
    route: any;
    stops: any[];
  } | null> {
    const supabase = await createClient();

    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('id', route_id)
      .single();

    if (routeError || !route) {
      console.error('Error fetching route:', routeError);
      return null;
    }

    const { data: stops, error: stopsError } = await supabase
      .from('route_stops')
      .select(`
        *,
        delivery:deliveries (
          id,
          order_id,
          order:orders (
            order_number,
            customer_email,
            user:users (
              name,
              phone_number
            )
          )
        )
      `)
      .eq('route_id', route_id)
      .order('stop_number', { ascending: true });

    if (stopsError) {
      console.error('Error fetching route stops:', stopsError);
      return { route, stops: [] };
    }

    return { route, stops: stops || [] };
  }
}
