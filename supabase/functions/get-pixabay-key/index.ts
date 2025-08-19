import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the Pixabay API key from secrets
    const pixabayApiKey = Deno.env.get('PIXABAY_API_KEY')
    
    if (!pixabayApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Pixabay API key not configured. Please add PIXABAY_API_KEY to your Supabase secrets.',
          hasKey: false
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return the API key
    return new Response(
      JSON.stringify({ 
        apiKey: pixabayApiKey,
        hasKey: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error getting Pixabay API key:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get Pixabay API key',
        hasKey: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})