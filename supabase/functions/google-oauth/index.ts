import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const CLIENT_ID = "692107022359-q3551kdeumtl9lcfme81rq4sqisoc7u8.apps.googleusercontent.com";
const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirect_uri } = await req.json()
    
    const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
    
    if (!CLIENT_SECRET) {
      throw new Error('Google client secret not configured')
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`)
    }

    // Get user info from Google
    const userResponse = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenData.access_token}`
    )
    const userData = await userResponse.json()

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${userData.error || 'Unknown error'}`)
    }

    // Test Gmail API access
    const gmailTestResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/profile',
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    )

    let gmailAccess = false
    if (gmailTestResponse.ok) {
      gmailAccess = true
      console.log('Gmail API access confirmed')
    } else {
      console.warn('Gmail API access failed:', gmailTestResponse.status)
    }

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        user: userData,
        gmail_access: gmailAccess,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Google OAuth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})