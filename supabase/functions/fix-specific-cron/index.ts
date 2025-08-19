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
    console.log('Starting immediate cron job fix...')
    
    // الحصول على معرف الـ cron job المحدد
    const cronjobId = '6471935'
    const customPageToken = '4f614575b56e9bb9c9724761857c9b204ef8ab313822bad009cb5b9b365c52b5'
    
    console.log(`Fixing cron job ID: ${cronjobId}`)
    
    // حذف الـ cron job القديم
    const deleteResponse = await fetch(`${CRONJOB_API_URL}/${cronjobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`,
      },
    })

    if (deleteResponse.ok) {
      console.log('Old cron job deleted successfully')
    } else {
      console.log('Failed to delete old cron job, but continuing...')
    }

    // إنشاء cron job جديد بالعنوان الصحيح
    const cronJobPayload = {
      job: {
        title: `Fixed Automation for Spost`,
        url: `${supabaseUrl}/functions/v1/automated-publishing-api?token=${customPageToken}`,
        enabled: true,
        schedule: {
          timezone: 'Asia/Riyadh',
          expiresAt: 0,
          hours: [9, 15, 21], // 9 AM, 3 PM, 9 PM
          mdays: [-1],
          minutes: [0],
          months: [-1],
          wdays: [-1]
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

    const createResponse = await fetch(CRONJOB_API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cronJobPayload)
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`Failed to create new cron job: ${createResponse.status} - ${errorText}`)
    }

    const result = await createResponse.json()
    console.log('New cron job created:', result)
    
    // تحديث قاعدة البيانات بمعرف الـ cron job الجديد
    if (result.jobId) {
      const { error: updateError } = await supabase
        .from('automation_subscriptions')
        .update({ cronjob_id: result.jobId.toString() })
        .eq('custom_page_token', customPageToken)
        
      if (updateError) {
        console.error('Failed to update database:', updateError)
      } else {
        console.log('Database updated with new cron job ID:', result.jobId)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron job fixed successfully',
        old_id: cronjobId,
        new_id: result.jobId,
        new_url: `${supabaseUrl}/functions/v1/automated-publishing-api?token=${customPageToken}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error fixing cron job:', error)
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