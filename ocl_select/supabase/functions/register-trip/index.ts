import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory queue manager to ensure we process registrations
// sequentially per city within the same function instance.
const cityQueues = new Map<string, Promise<void>>();

async function enqueueCityTask<T>(cityId: string, task: () => Promise<T>): Promise<T> {
  const previous = cityQueues.get(cityId) ?? Promise.resolve();

  let release: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });

  cityQueues.set(cityId, previous.then(() => current));

  try {
    await previous;
    return await task();
  } finally {
    release!();
    if (cityQueues.get(cityId) === current) {
      cityQueues.delete(cityId);
    }
  }
}

interface RegisterRequest {
  student_id: string;
  name: string;
  surname: string;
  class: string;
  class_no: string;
  city_id: string;
}

type RegisterResponse =
  | { success: true; message: string }
  | { success: false; error_code: string; message: string };

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
    const { student_id, name, surname, class: studentClass, class_no, city_id } = body;

    // Validate input
    if (!student_id || !name || !surname || !city_id) {
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

    // Run registration inside Postgres transaction via RPC to avoid race conditions
    // The DB function is already transactional, but enqueue the request
    // so only one registration per city runs at a time inside this instance.
    const rpcResult = await enqueueCityTask(city_id, async () => {
      const { data, error } = await supabaseClient.rpc<RegisterResponse>(
        "register_student_with_quota",
        {
          p_student_id: student_id,
          p_name: name,
          p_surname: surname,
          p_class: studentClass,
          p_class_no: class_no,
          p_city_id: city_id,
        }
      );

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Empty response from register_student_with_quota");
      }

      return data;
    });

    const status = rpcResult.success ? 200 : 400;

    return new Response(JSON.stringify(rpcResult), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
