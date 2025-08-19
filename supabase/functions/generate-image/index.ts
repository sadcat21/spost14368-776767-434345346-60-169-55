import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, width = 1024, height = 1024, model = "runware:100@1" } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the Runware API key from secrets
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY')
    
    if (!runwareApiKey) {
      console.error('❌ Runware API key not found in Supabase secrets')
      return new Response(
        JSON.stringify({ 
          error: 'Runware API key not configured. Please add RUNWARE_API_KEY to your Supabase secrets.',
          details: 'You need to set the RUNWARE_API_KEY in your Supabase project secrets for image generation to work.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Runware API key found, proceeding with image generation...')

    // Generate a unique task UUID
    const taskUUID = crypto.randomUUID()

    // Prepare the request body for Runware API
    const requestBody = [
      {
        taskType: "authentication",
        apiKey: runwareApiKey
      },
      {
        taskType: "imageInference",
        taskUUID: taskUUID,
        positivePrompt: prompt,
        width: width,
        height: height,
        model: model,
        numberResults: 1,
        outputFormat: "WEBP",
        CFGScale: 1,
        scheduler: "FlowMatchEulerDiscreteScheduler",
        strength: 0.8
      }
    ]

    console.log('Sending request to Runware API...')

    // Call Runware API
    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Runware API error:', errorText)
      throw new Error(`Runware API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('Runware API response:', data)

    // Find the image generation result
    const imageResult = data.data?.find((item: any) => item.taskType === "imageInference")
    
    if (!imageResult || !imageResult.imageURL) {
      throw new Error('No image generated or invalid response from Runware API')
    }

    // Return the image URL
    return new Response(
      JSON.stringify({ 
        imageURL: imageResult.imageURL,
        imageUUID: imageResult.imageUUID,
        seed: imageResult.seed,
        prompt: prompt
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating image:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate image',
        details: 'Please check your Runware API key and try again'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})