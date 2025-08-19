import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// cron-job.org API configuration
const CRONJOB_API_KEY = 'GaRmebqvWDdSkPnMrgJsQoZw8OMan0gVo1Ny+v+UZNE='
const CRONJOB_API_URL = 'https://api.cron-job.org/jobs'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, automation_data } = await req.json()
    console.log(`📋 Test cron automation request: ${action}`)
    console.log('📦 Automation data:', automation_data)

    const cronSecret = Deno.env.get('CRON_SECRET')
    if (!cronSecret) {
      throw new Error('CRON_SECRET not configured')
    }

    if (action === 'create') {
      // إنشاء cron job جديد للاختبار
      const cronJobPayload = {
        job: {
          title: `Test Automation - ${automation_data.page_name}`,
          url: `${supabaseUrl}/functions/v1/automated-publishing-api?token=${cronSecret}`,
          enabled: true,
          schedule: {
            timezone: 'Asia/Riyadh',
            expiresAt: 0,
            hours: [-1], // كل ساعة
            mdays: [-1], // كل يوم
            minutes: [0], // في الدقيقة 0
            months: [-1], // كل شهر
            wdays: [-1] // كل أيام الأسبوع
          },
          requestMethod: 1, // GET method
          auth: {
            enable: false
          },
          notification: {
            onFailure: false,
            onSuccess: false,
            onDisable: false
          },
          extendedData: {
            headers: {},
            body: ''
          }
        }
      }

      console.log('🔄 Creating test cron job...')
      
      const response = await fetch(CRONJOB_API_URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CRONJOB_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cronJobPayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create cron job: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Test cron job created:', result)

      return new Response(
        JSON.stringify({ 
          success: true, 
          cronjob_id: result.jobId,
          message: 'Test cron job created successfully',
          schedule: 'Every hour at minute 0'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else if (action === 'delete') {
      // حذف cron job
      const cronjobId = automation_data.cronjob_id
      
      console.log(`🗑️ Deleting cron job: ${cronjobId}`)
      
      const response = await fetch(`${CRONJOB_API_URL}/${cronjobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${CRONJOB_API_KEY}`,
        },
      })

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text()
        throw new Error(`Failed to delete cron job: ${response.status} - ${errorText}`)
      }

      console.log('✅ Test cron job deleted')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Test cron job deleted successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else {
      throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Error in test cron automation:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})