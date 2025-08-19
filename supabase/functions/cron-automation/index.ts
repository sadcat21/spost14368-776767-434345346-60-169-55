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
    const { action, subscription_id, automation_data } = await req.json()

    switch (action) {
      case 'create':
        return await createCronJob(automation_data)
      case 'delete':
        return await deleteCronJob(automation_data.cronjob_id)
      case 'update':
        return await updateCronJob(automation_data)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error in cron-automation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function createCronJob(automationData: any) {
  try {
    const { 
      custom_page_token, 
      posts_per_day, 
      execution_times,
      schedule_type,
      cron_expression,
      week_days,
      month_days,
      months
    } = automationData
    
    // تحديد جدولة cron based على posts_per_day و execution_times
    const cronSchedule = generateCronSchedule(posts_per_day, execution_times)
    
    // إنشاء cron job
    const cronSecret = Deno.env.get('CRON_SECRET') || '7f3c9a1eb61f4f2cb2a7d0c4e9f58a1d3c6b2e1f9a0d4c7b8e5f2a3c1d0e9b7'
    console.log(`🔍 Creating cron job with CRON_SECRET: ${cronSecret.substring(0, 20)}...`)
    
    const cronJobPayload = {
      job: {
        title: `Automation for page ${automationData.page_name}`,
        url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/automated-publishing-api?token=${cronSecret}`,
        enabled: true, // ✅ تفعيل الوظيفة
        saveResponses: true, // ✅ حفظ الاستجابات في تاريخ المهام
        schedule: {
          timezone: 'Asia/Riyadh',
          expiresAt: 0,
          hours: [-1], // سيتم تحديدها بناءً على execution_times
          mdays: [-1],
          minutes: [-1],
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

    // تحديث الجدولة بناءً على نوع الجدولة
    if (schedule_type === 'advanced' && cron_expression) {
      // استخدام cron expression مخصص
      const cronParts = cron_expression.split(' ')
      if (cronParts.length === 5) {
        cronJobPayload.job.schedule.minutes = cronParts[0] === '*' ? [-1] : cronParts[0].split(',').map(Number)
        cronJobPayload.job.schedule.hours = cronParts[1] === '*' ? [-1] : cronParts[1].split(',').map(Number)
        cronJobPayload.job.schedule.mdays = cronParts[2] === '*' ? [-1] : cronParts[2].split(',').map(Number)
        cronJobPayload.job.schedule.months = cronParts[3] === '*' ? [-1] : cronParts[3].split(',').map(Number)
        cronJobPayload.job.schedule.wdays = cronParts[4] === '*' ? [-1] : cronParts[4].split(',').map(Number)
      }
      
      // تطبيق إعدادات متقدمة إضافية
      if (week_days && week_days.length > 0) {
        cronJobPayload.job.schedule.wdays = week_days
      }
      if (month_days && month_days.length > 0) {
        cronJobPayload.job.schedule.mdays = month_days
      }
      if (months && months.length > 0) {
        cronJobPayload.job.schedule.months = months
      }
    } else if (execution_times && execution_times.length > 0) {
      // الطريقة البسيطة - أوقات محددة يومياً
      // تجميع الأوقات حسب الساعة والدقيقة للحفاظ على التوقيت المحدد
      const timeGroups = execution_times.reduce((groups: any, time: string) => {
        const [hour, minute] = time.split(':').map(Number)
        const key = `${hour}:${minute}`
        if (!groups[key]) {
          groups[key] = { hour, minute }
        }
        return groups
      }, {})
      
      // إعداد جدولة منفصلة لكل وقت للحفاظ على التوقيت الدقيق
      const uniqueTimes = Object.values(timeGroups) as Array<{hour: number, minute: number}>
      if (uniqueTimes.length === 1) {
        // وقت واحد فقط
        cronJobPayload.job.schedule.hours = [uniqueTimes[0].hour]
        cronJobPayload.job.schedule.minutes = [uniqueTimes[0].minute]
      } else {
        // أوقات متعددة - استخدام الساعات وتعيين الدقائق للصفر للتحكم الدقيق
        cronJobPayload.job.schedule.hours = uniqueTimes.map(t => t.hour)
        cronJobPayload.job.schedule.minutes = uniqueTimes.map(t => t.minute)
      }
    }

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
      throw new Error(`cron-job.org API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    // حفظ cronjob_id في قاعدة البيانات
    if (result.jobId) {
      await supabase
        .from('automation_subscriptions')
        .update({ cronjob_id: result.jobId.toString() })
        .eq('custom_page_token', custom_page_token)
    }

    console.log('Cron job created successfully:', result)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        cronjob_id: result.jobId,
        message: 'Cron job created successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating cron job:', error)
    throw error
  }
}

async function deleteCronJob(cronjobId: string) {
  try {
    if (!cronjobId) {
      throw new Error('Cron job ID is required')
    }

    const response = await fetch(`${CRONJOB_API_URL}/${cronjobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`cron-job.org API error: ${response.status} - ${errorText}`)
    }

    console.log('Cron job deleted successfully:', cronjobId)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron job deleted successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error deleting cron job:', error)
    throw error
  }
}

async function updateCronJob(automationData: any) {
  try {
    // حذف الـ cron job القديم أولاً
    if (automationData.cronjob_id) {
      try {
        await deleteCronJob(automationData.cronjob_id)
        console.log('Old cron job deleted:', automationData.cronjob_id)
      } catch (deleteError) {
        console.log('Failed to delete old cron job, continuing with creation:', deleteError)
      }
    }
    
    // إنشاء cron job جديد بالعنوان المحدث
    const result = await createCronJob(automationData)
    console.log('New cron job created with updated URL')
    return result
  } catch (error) {
    console.error('Error updating cron job:', error)
    throw error
  }
}

function generateCronSchedule(postsPerDay: number, executionTimes: string[]) {
  // تبسيط: سنستخدم execution_times لتحديد متى يتم تشغيل الأتمتة
  // postsPerDay سيحدد عدد المرات التي يتم استدعاؤها في اليوم
  
  if (!executionTimes || executionTimes.length === 0) {
    return "0 9,15,21 * * *" // Default: 9 AM, 3 PM, 9 PM
  }
  
  const hours = executionTimes.map(time => time.split(':')[0]).join(',')
  return `0 ${hours} * * *`
}