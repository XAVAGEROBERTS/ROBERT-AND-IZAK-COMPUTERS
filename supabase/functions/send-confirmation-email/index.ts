// supabase/functions/send-confirmation-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, and html are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error('Resend API key not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ROBERT & IZAK COMPUTERS <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Resend API error:', error);
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await res.json();
    
    console.log(`✅ Confirmation email sent to: ${to}`);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully', data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
