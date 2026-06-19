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

    // Get all cities
    const { data: cities, error: citiesError } = await supabaseClient
      .from("cities")
      .select("id, name, quota, pin_province")
      .order("name");

    if (citiesError) {
      throw citiesError;
    }

    // Get student counts for each city
    const citiesWithCounts = await Promise.all(
      (cities || []).map(async (city) => {
        const { count, error: countError } = await supabaseClient
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("city_id", city.id);

        if (countError) {
          console.error(`Error counting students for city ${city.id}:`, countError);
          return {
            city_id: city.id,
            name: city.name,
            quota: city.quota,
            pin_province: city.pin_province ?? null,
            current_count: 0,
            remaining: city.quota,
          };
        }

        const currentCount = count ?? 0;
        return {
          city_id: city.id,
          name: city.name,
          quota: city.quota,
          pin_province: city.pin_province ?? null,
          current_count: currentCount,
          remaining: Math.max(0, city.quota - currentCount),
        };
      })
    );

    return new Response(
      JSON.stringify({
        cities: citiesWithCounts,
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
        message: "Failed to fetch city status.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
