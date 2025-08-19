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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting cron URL fix process...')
    
    // جلب جميع الاشتراكات النشطة
    const { data: subscriptions, error: fetchError } = await supabase
      .from('automation_subscriptions')
      .select('*')
      .not('cronjob_id', 'is', null)

    if (fetchError) {
      throw new Error(`Failed to fetch subscriptions: ${fetchError.message}`)
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active subscriptions found',
          updated: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    let updatedCount = 0
    const results = []

    // تحديث كل اشتراك
    for (const subscription of subscriptions) {
      try {
        console.log(`Updating cron job for page: ${subscription.page_name}`)
        
        // إعداد بيانات الأتمتة للتحديث
        const automationData = {
          cronjob_id: subscription.cronjob_id,
          custom_page_token: subscription.custom_page_token,
          page_name: subscription.page_name,
          posts_per_day: subscription.posts_per_day || 3,
          execution_times: subscription.execution_times || ['09:00', '15:00', '21:00'],
          content_type: subscription.content_type || 'mixed',
          schedule_type: subscription.schedule_type || 'simple'
        }

        // استدعاء دالة تحديث cron job
        const { error: updateError } = await supabase.functions.invoke('cron-automation', {
          body: {
            action: 'update',
            automation_data: automationData
          }
        })

        if (updateError) {
          console.error(`Failed to update cron job for ${subscription.page_name}:`, updateError)
          results.push({
            page_name: subscription.page_name,
            success: false,
            error: updateError.message
          })
        } else {
          console.log(`Successfully updated cron job for ${subscription.page_name}`)
          updatedCount++
          results.push({
            page_name: subscription.page_name,
            success: true,
            message: 'Cron job updated successfully'
          })
        }
      } catch (error) {
        console.error(`Error updating subscription ${subscription.id}:`, error)
        results.push({
          page_name: subscription.page_name,
          success: false,
          error: error.message
        })
      }
    }

    console.log(`Cron URL fix completed. Updated ${updatedCount} out of ${subscriptions.length} subscriptions.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${updatedCount} cron jobs successfully`,
        total: subscriptions.length,
        updated: updatedCount,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in fix-cron-urls:', error)
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