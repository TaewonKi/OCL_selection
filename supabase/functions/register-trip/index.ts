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

    // Atomic check-and-insert: locks the trip row server-side so concurrent
    // registrations for the same trip can't both slip past the quota check.
    const { data: result, error: rpcError } = await supabaseClient.rpc("register_student", {
      p_student_id: student_id,
      p_name: name,
      p_surname: surname,
      p_class: studentClass,
      p_class_no: class_no,
      p_trip_id: trip_id,
    });

    if (rpcError) {
      throw rpcError;
    }

    if (!result.success) {
      const messages: Record<string, string> = {
        INVALID_TRIP: "Invalid trip selected.",
        ALREADY_REGISTERED: "This student has already applied.",
        QUOTA_FULL: "The selected trip is full.",
      };
      return new Response(
        JSON.stringify({
          success: false,
          error_code: result.error_code,
          message: messages[result.error_code] ?? "Registration failed.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
