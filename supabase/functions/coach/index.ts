// Zenit-Coach als Supabase Edge Function.
// Hält den Anthropic-API-Key sicher auf dem Server (nie im Frontend!).
// Deployment: siehe README Schritt 7.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { ctx, langName } = await req.json();

    const prompt = `You are the "Zenit Coach", a warm but focused weekly-planning coach inside a personal planning app for an industrial engineering student. Respond in ${langName}.

Here is the user's current data as JSON:
${JSON.stringify(ctx)}

Task: Create a short weekly plan. 1) Briefly analyse the situation (2-3 sentences, motivating, mention waitlist items if any). 2) Suggest 3-5 concrete tasks for the coming week (may include adopting waitlist items or breaking big tasks down).

Respond ONLY with valid JSON, no markdown fences, no preamble:
{"analysis": "…", "suggestions": [{"title": "…", "level": "day|week|month|long"}]}`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const raw = await r.json();
    const text = (raw.content || []).map((i: any) => i.text || "").join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    JSON.parse(clean); // validieren

    return new Response(clean, { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
