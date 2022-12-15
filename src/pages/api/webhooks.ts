import Stripe  from "stripe";
import { NextApiRequest, NextApiResponse } from "next";

import { Readable } from 'stream'
import { stripe } from "../../services/stripe";
import { manageSubscription } from "./_lib/manageSubscription";
import { create } from "node:domain";

type actionType = 'create' | 'update' | 'delete'


// Função que cria interpretada a requisição stream
async function buffer(readable: Readable){
  const chuncks = []

  for await (const chunck of readable){
    chuncks.push(
      typeof chunck === 'string' ? Buffer.from(chunck): chunck
    )
  }

  return Buffer.concat(chuncks)
}

// Desablitar o padrão de leitura do next (estamos utilizadno stream)
export const config = {
  api: {
    bodyParser: false,
  },
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST'){
    const buf = await buffer(req)
    const secret = req.headers['stripe-signature'] // Segredo emitido pelo cliente
    
    let event: Stripe.Event;
    
    // Tentar construir o objeto da requisição e verificar a orgigem da requisição
    try{
       event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
       console.log(event)
    } catch(err){
      res.status(400).send(`Webhook error: ${err.message}`)
    }
    
    const { type } = event

    if(relevantEvents.has(type)){
      let actionType: actionType = 'create'
      
      try{
        switch(type){
          case 'customer.subscription.updated':
            actionType = 'update'

          case 'customer.subscription.deleted':
            actionType = 'delete'

            const subscription = event.data.object as Stripe.Subscription
              
              manageSubscription(
                subscription.id,
                subscription.customer.toString(),
                actionType
               )

            break

          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session

            await manageSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              actionType
            )
            break;
          default:
            throw new Error('Webhook handler failed.')
        }
      }catch(err){
        res.json({message: err.message})
      }
    }

    res.end()

  } else{
    res.setHeader('ALLOW', 'POST')
    res.status(405).end('Method not allowed')
  }

}