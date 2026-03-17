import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const { routing_number } = await req.json()

  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/MeisterWalker/jpdesk/main/public/FedACHdir.txt'
    )
    const text = await res.text()
    const lines = text.split('\n').filter(l => l.length > 9)
    const match = lines.find(l => l.substring(0, 9) === routing_number)

    if (!match) {
      return new Response(JSON.stringify({ code: 404 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const area  = match.substring(138, 141).trim()
    const prefix = match.substring(141, 144).trim()
    const suffix = match.substring(144, 148).trim()

    return new Response(JSON.stringify({
      code: 200,
      routing_number: match.substring(0, 9).trim(),
      customer_name:  match.substring(35, 71).trim(),
      address:        match.substring(71, 107).trim(),
      city:           match.substring(107, 127).trim(),
      state:          match.substring(127, 129).trim(),
      zip:            match.substring(129, 134).trim(),
      phone:          area && prefix && suffix ? `(${area}) ${prefix}-${suffix}` : '',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ code: 500, error: String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})