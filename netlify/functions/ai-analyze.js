const { createClient } = require("@supabase/supabase-js");

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: "Method Not Allowed" };
  }

  // Verify the caller is a logged-in Supabase user
  const authHeader = event.headers["authorization"];
  if (!authHeader) {
    return {
      statusCode: 401, headers: CORS,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return {
      statusCode: 401, headers: CORS,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503, headers: CORS,
      body: JSON.stringify({ error: "AI service not configured" }),
    };
  }

  try {
    const body = JSON.parse(event.body);

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status, headers: CORS,
        body: JSON.stringify({ error: data?.error?.message || "AI error" }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch {
    return {
      statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
