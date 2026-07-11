import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all trips
    const { data: trips, error: tripsError } = await supabaseClient
      .from("trips")
      .select("id, name, quota, stops")
      .order("name");

    if (tripsError) {
      throw tripsError;
    }

    // Get student counts for each trip
    const tripsWithCounts = await Promise.all(
      (trips || []).map(async (trip) => {
        const { count, error: countError } = await supabaseClient
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("trip_id", trip.id);

        if (countError) {
          console.error(`Error counting students for trip ${trip.id}:`, countError);
          return {
            trip_id: trip.id,
            name: trip.name,
            quota: trip.quota,
            stops: trip.stops ?? [],
            current_count: 0,
            remaining: trip.quota,
          };
        }

        const currentCount = count ?? 0;
        return {
          trip_id: trip.id,
          name: trip.name,
          quota: trip.quota,
          stops: trip.stops ?? [],
          current_count: currentCount,
          remaining: Math.max(0, trip.quota - currentCount),
        };
      })
    );

    return new Response(
      JSON.stringify({
        trips: tripsWithCounts,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error_code: "SERVER_ERROR",
        message: "Failed to fetch trip status.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
