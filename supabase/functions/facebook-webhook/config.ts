// Configuration and constants for Facebook webhook
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Facebook Webhook verification token
export const VERIFY_TOKEN = 'facebook_webhook_verify_token_123';

// Facebook API configuration
export const FACEBOOK_API_VERSION = 'v19.0';
export const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

// AI configuration
export const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';