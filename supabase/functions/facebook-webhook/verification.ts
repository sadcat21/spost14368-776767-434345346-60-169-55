// Facebook webhook verification handler
import { corsHeaders, VERIFY_TOKEN } from './config.ts';

export function handleWebhookVerification(req: Request): Response {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new Response(challenge, { 
      status: 200,
      headers: corsHeaders 
    });
  } else {
    console.log('Webhook verification failed');
    return new Response('Forbidden', { 
      status: 403,
      headers: corsHeaders 
    });
  }
}