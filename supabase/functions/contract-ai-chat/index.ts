import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, contractData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert contract creation assistant. Help users create professional contracts by filling in the appropriate fields based on their prompts.

Contract Structure:
- Title: Contract title
- Parties Information: Freelancer (name, email, phone, address) and Client (name, email, phone, address)
- Scope of Work: Detailed description of work to be performed
- Payment Terms: Amount, schedule, and payment conditions
- Project Timeline: Start date, end date, and key milestones
- Intellectual Property: IP ownership and rights
- Confidentiality: Confidentiality terms and NDA provisions
- Service Level Agreement: Performance standards and response times
- Termination & Dispute: Termination conditions and dispute resolution
- Agreement Introduction: Opening statement and purpose

When the user asks to create or modify a contract, respond with a JSON object containing the relevant fields. Always maintain professional language and legal accuracy.

Current contract data: ${JSON.stringify(contractData)}

Format your response as JSON with these possible fields:
{
  "title": "string",
  "freelancer_name": "string",
  "freelancer_email": "string",
  "freelancer_phone": "string",
  "freelancer_address": "string",
  "client_name": "string",
  "client_email": "string",
  "client_phone": "string",
  "client_address": "string",
  "scope_of_work": "string",
  "payment_terms": "string",
  "contract_amount": number,
  "project_timeline": "string",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "ip_terms": "string",
  "confidentiality_terms": "string",
  "sla_terms": "string",
  "termination_terms": "string",
  "agreement_intro": "string",
  "explanation": "string explaining what was filled in"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Contract AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
