import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Validate the user making the request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Verify user JWT token to ensure only authenticated users can use the proxy
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized request or invalid token.')

        // 3. Get the message payload from the frontend
        const { message } = await req.json()

        if (!message) {
            throw new Error('Message payload is required.')
        }

        // 4. Securely fetch from NVIDIA API
        const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY')

        if (!NVIDIA_API_KEY || NVIDIA_API_KEY === 'nvapi-your-key-here') {
            throw new Error('Edge Function missing NVIDIA_API_KEY secret.')
        }

        const SYSTEM_PROMPT = `You are an expert AI Study Tutor helping a student preparing for competitive exams (JEE, NEET, etc.).
You explain concepts clearly, generate quizzes with answers, create flashcards, and summarize notes.
Use simple language, bullet points, and examples. Format your responses using markdown:
- **bold** for key terms
- \`code\` for formulas or code
- Bullet points for lists
Keep responses concise but thorough.`

        const aiResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NVIDIA_API_KEY}`
            },
            body: JSON.stringify({
                model: 'meta/llama-3.1-70b-instruct',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        })

        if (!aiResponse.ok) {
            throw new Error(`NVIDIA API responded with ${aiResponse.status}: ${await aiResponse.text()}`)
        }

        const data = await aiResponse.json()

        // 5. Return only the safe response to the client
        return new Response(
            JSON.stringify({
                reply: data.choices?.[0]?.message?.content || 'No response from AI.'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err) {
        const error = err as Error;
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
