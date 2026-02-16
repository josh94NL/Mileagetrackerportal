import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to verify user authentication
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return { error: 'No authorization header', userId: null };
  }
  
  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    return { error: 'No token provided', userId: null };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !data?.user?.id) {
    return { error: 'Invalid token', userId: null };
  }
  
  return { error: null, userId: data.user.id };
}

// Health check endpoint
app.get("/make-server-7770b39e/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-7770b39e/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email.split('@')[0] },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Create user profile
    await kv.set(`profile:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata.name,
      created_at: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      }
    });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get user profile
app.get("/make-server-7770b39e/profile", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const profile = await kv.get(`profile:${userId}`);
  return c.json({ profile });
});

// Update user profile
app.put("/make-server-7770b39e/profile", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const updates = await c.req.json();
  const profile = await kv.get(`profile:${userId}`) || {};
  
  const updatedProfile = {
    ...profile,
    ...updates,
    id: userId, // Prevent ID override
    updated_at: new Date().toISOString()
  };
  
  await kv.set(`profile:${userId}`, updatedProfile);
  return c.json({ profile: updatedProfile });
});

// ===== VEHICLES =====

// Get all vehicles for user
app.get("/make-server-7770b39e/vehicles", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const vehicles = await kv.getByPrefix(`vehicle:${userId}:`);
  return c.json({ vehicles: vehicles || [] });
});

// Create vehicle
app.post("/make-server-7770b39e/vehicles", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const vehicleData = await c.req.json();
  const vehicleId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const vehicle = {
    id: vehicleId,
    user_id: userId,
    name: vehicleData.name,
    license_plate: vehicleData.license_plate || '',
    current_odometer: vehicleData.current_odometer || 0,
    created_at: new Date().toISOString()
  };

  await kv.set(`vehicle:${userId}:${vehicleId}`, vehicle);
  return c.json({ vehicle });
});

// Update vehicle
app.put("/make-server-7770b39e/vehicles/:id", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const vehicleId = c.req.param('id');
  const updates = await c.req.json();
  
  const vehicle = await kv.get(`vehicle:${userId}:${vehicleId}`);
  if (!vehicle) {
    return c.json({ error: 'Vehicle not found' }, 404);
  }

  const updatedVehicle = {
    ...vehicle,
    ...updates,
    id: vehicleId,
    user_id: userId,
    updated_at: new Date().toISOString()
  };

  await kv.set(`vehicle:${userId}:${vehicleId}`, updatedVehicle);
  return c.json({ vehicle: updatedVehicle });
});

// Delete vehicle
app.delete("/make-server-7770b39e/vehicles/:id", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const vehicleId = c.req.param('id');
  await kv.del(`vehicle:${userId}:${vehicleId}`);
  
  return c.json({ success: true });
});

// ===== TRIPS =====

// Get all trips for user with optional filters
app.get("/make-server-7770b39e/trips", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const trips = await kv.getByPrefix(`trip:${userId}:`);
  
  // Sort by date descending
  const sortedTrips = (trips || []).sort((a: any, b: any) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return c.json({ trips: sortedTrips });
});

// Create trip
app.post("/make-server-7770b39e/trips", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const tripData = await c.req.json();
  const tripId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Calculate distance
  const distance = tripData.odometer_end - tripData.odometer_start;
  
  if (distance < 0) {
    return c.json({ error: 'Odometer end must be greater than odometer start' }, 400);
  }

  const trip = {
    id: tripId,
    user_id: userId,
    vehicle_id: tripData.vehicle_id,
    date: tripData.date || new Date().toISOString().split('T')[0],
    time: tripData.time || new Date().toTimeString().slice(0, 5),
    start_location: tripData.start_location,
    end_location: tripData.end_location,
    odometer_start: tripData.odometer_start,
    odometer_end: tripData.odometer_end,
    distance_km: distance,
    purpose: tripData.purpose || 'business',
    notes: tripData.notes || '',
    created_at: new Date().toISOString()
  };

  await kv.set(`trip:${userId}:${tripId}`, trip);
  
  // Update vehicle odometer if provided
  if (tripData.vehicle_id) {
    const vehicle = await kv.get(`vehicle:${userId}:${tripData.vehicle_id}`);
    if (vehicle) {
      vehicle.current_odometer = tripData.odometer_end;
      await kv.set(`vehicle:${userId}:${tripData.vehicle_id}`, vehicle);
    }
  }
  
  return c.json({ trip });
});

// Update trip
app.put("/make-server-7770b39e/trips/:id", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const tripId = c.req.param('id');
  const updates = await c.req.json();
  
  const trip = await kv.get(`trip:${userId}:${tripId}`);
  if (!trip) {
    return c.json({ error: 'Trip not found' }, 404);
  }

  // Recalculate distance if odometer values changed
  const odometerStart = updates.odometer_start ?? trip.odometer_start;
  const odometerEnd = updates.odometer_end ?? trip.odometer_end;
  const distance = odometerEnd - odometerStart;
  
  if (distance < 0) {
    return c.json({ error: 'Odometer end must be greater than odometer start' }, 400);
  }

  const updatedTrip = {
    ...trip,
    ...updates,
    id: tripId,
    user_id: userId,
    distance_km: distance,
    updated_at: new Date().toISOString()
  };

  await kv.set(`trip:${userId}:${tripId}`, updatedTrip);
  return c.json({ trip: updatedTrip });
});

// Delete trip
app.delete("/make-server-7770b39e/trips/:id", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const tripId = c.req.param('id');
  await kv.del(`trip:${userId}:${tripId}`);
  
  return c.json({ success: true });
});

// ===== REPORTS =====

// Get report statistics
app.get("/make-server-7770b39e/reports", async (c) => {
  const { error, userId } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const trips = await kv.getByPrefix(`trip:${userId}:`);
  
  // Calculate statistics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let totalKm = 0;
  let businessKm = 0;
  let privateKm = 0;
  let monthlyKm = 0;
  let monthlyBusiness = 0;
  let monthlyPrivate = 0;
  
  const monthlyData: { [key: string]: { business: number; private: number } } = {};
  
  (trips || []).forEach((trip: any) => {
    const tripDate = new Date(trip.date);
    const tripMonth = tripDate.getMonth();
    const tripYear = tripDate.getFullYear();
    const monthKey = `${tripYear}-${String(tripMonth + 1).padStart(2, '0')}`;
    
    // Total stats
    totalKm += trip.distance_km;
    if (trip.purpose === 'business') {
      businessKm += trip.distance_km;
    } else {
      privateKm += trip.distance_km;
    }
    
    // Current month stats
    if (tripMonth === currentMonth && tripYear === currentYear) {
      monthlyKm += trip.distance_km;
      if (trip.purpose === 'business') {
        monthlyBusiness += trip.distance_km;
      } else {
        monthlyPrivate += trip.distance_km;
      }
    }
    
    // Monthly breakdown
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { business: 0, private: 0 };
    }
    if (trip.purpose === 'business') {
      monthlyData[monthKey].business += trip.distance_km;
    } else {
      monthlyData[monthKey].private += trip.distance_km;
    }
  });
  
  return c.json({
    total_km: Math.round(totalKm * 10) / 10,
    business_km: Math.round(businessKm * 10) / 10,
    private_km: Math.round(privateKm * 10) / 10,
    monthly_km: Math.round(monthlyKm * 10) / 10,
    monthly_business: Math.round(monthlyBusiness * 10) / 10,
    monthly_private: Math.round(monthlyPrivate * 10) / 10,
    monthly_data: monthlyData,
    trip_count: trips?.length || 0
  });
});

Deno.serve(app.fetch);
