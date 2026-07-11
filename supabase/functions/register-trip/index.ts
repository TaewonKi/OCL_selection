import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegisterRequest {
  student_id: string;
  name: string;
  surname: string;
  class: string;
  class_no: string;
  trip_id: string;
}

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

    // Parse request body
    const body: RegisterRequest = await req.json();
    const { student_id, name, surname, class: studentClass, class_no, trip_id } = body;

    // Validate input
    if (!student_id || !name || !surname || !trip_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error_code: "INVALID_INPUT",
          message: "Missing required fields.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if student already registered
    const { data: existingStudent, error: checkError } = await supabaseClient
      .from("students")
      .select("student_id")
      .eq("student_id", student_id)
      .single();

    if (existingStudent) {
      return new Response(
        JSON.stringify({
          success: false,
          error_code: "ALREADY_REGISTERED",
          message: "This student has already applied.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get trip quota
    const { data: trip, error: tripError } = await supabaseClient
      .from("trips")
      .select("quota")
      .eq("id", trip_id)
      .single();

    if (tripError || !trip) {
      return new Response(
        JSON.stringify({
          success: false,
          error_code: "INVALID_TRIP",
          message: "Invalid trip selected.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Count current students on the trip
    const { count, error: countError } = await supabaseClient
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("trip_id", trip_id);

    if (countError) {
      throw countError;
    }

    // Check if quota is full
    if (count !== null && count >= trip.quota) {
      return new Response(
        JSON.stringify({
          success: false,
          error_code: "QUOTA_FULL",
          message: "The selected trip is full.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert student
    const { error: insertError } = await supabaseClient.from("students").insert({
      student_id,
      name,
      surname,
      class: studentClass,
      class_no,
      trip_id,
    });

    if (insertError) {
      throw insertError;
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Registered successfully.",
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
        message: "Something went wrong.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
