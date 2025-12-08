/**
 * Customer Profile API
 *
 * Allows customers to manage their business and shipping information
 * Issue #80: Add customer information management to profile with checkout auto-population
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateDeliveryAddress } from '@/lib/mapbox/client';

/**
 * GET /api/customer/profile
 *
 * Fetch authenticated user's customer information
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch customer information
    const { data, error } = await supabase
      .from('customer_information')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's okay
      console.error('Error fetching customer information:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customer information' },
        { status: 500 }
      );
    }

    // Return null if no customer information exists (first-time users)
    if (!data) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/customer/profile:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer/profile
 *
 * Save or update customer information with address validation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      business_name,
      license_number,
      contact_name,
      email,
      phone,
      phone_verified,
      street_address,
      apartment_suite,
      city,
      state,
      zip_code,
      delivery_instructions,
    } = body;

    // Validate required fields
    if (
      !business_name ||
      !license_number ||
      !contact_name ||
      !email ||
      !street_address ||
      !city ||
      !state ||
      !zip_code
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build full address for validation
    const fullAddress = `${street_address}${apartment_suite ? ` ${apartment_suite}` : ''}, ${city}, ${state} ${zip_code}`;

    // Validate address and check delivery zone with Mapbox
    const validationResult = await validateDeliveryAddress(fullAddress);

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: validationResult.error || 'Invalid address',
          validationResult,
        },
        { status: 400 }
      );
    }

    // Calculate delivery fee based on distance (example: $5 base + $0.50 per mile)
    const BASE_DELIVERY_FEE = 5.0;
    const PER_MILE_FEE = 0.5;
    const estimatedDeliveryFee =
      validationResult.distance !== undefined
        ? BASE_DELIVERY_FEE + validationResult.distance * PER_MILE_FEE
        : BASE_DELIVERY_FEE;

    // Prepare data for upsert
    const customerData = {
      user_id: user.id,
      business_name,
      license_number,
      contact_name,
      email,
      phone: phone || null,
      phone_verified: phone_verified || false,
      street_address,
      apartment_suite: apartment_suite || null,
      city,
      state,
      zip_code,
      delivery_instructions: delivery_instructions || null,
      latitude: validationResult.address?.coordinates.lat || null,
      longitude: validationResult.address?.coordinates.lng || null,
      is_in_delivery_zone: true,
      delivery_distance_miles: validationResult.distance || null,
      estimated_delivery_fee: estimatedDeliveryFee,
    };

    // Check if customer information already exists
    const { data: existing } = await supabase
      .from('customer_information')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let data, error;

    if (existing) {
      // Update existing
      ({ data, error } = await supabase
        .from('customer_information')
        .update(customerData)
        .eq('user_id', user.id)
        .select()
        .single());
    } else {
      // Insert new
      ({ data, error } = await supabase
        .from('customer_information')
        .insert(customerData)
        .select()
        .single());
    }

    if (error) {
      console.error('Error saving customer information:', error);
      return NextResponse.json(
        { error: 'Failed to save customer information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      validationResult,
    });
  } catch (error) {
    console.error('Error in POST /api/customer/profile:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customer/profile
 *
 * Delete customer information
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete customer information
    const { error } = await supabase
      .from('customer_information')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting customer information:', error);
      return NextResponse.json(
        { error: 'Failed to delete customer information' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/customer/profile:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
