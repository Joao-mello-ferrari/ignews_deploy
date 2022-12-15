import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/client'

import {query as q} from 'faunadb'
import {fauna} from '../../services/fauna'

import { stripe } from "../../services/stripe";

interface User{
  ref: {
    id: string;
  }

  data:{
    email: string;
    stripe_client_id?: string;
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse){
  if(req.method === 'POST'){
    const session = await getSession({ req });
    
    const loggedUser = await 
      fauna.query<User>(
        q.Get(
          q.Match(
            q.Index('user_by_email'), 
            q.Casefold(session.user.email)
          )
        ) 
      )

    const faunaClientId = loggedUser.ref.id
    let stripeClientId = loggedUser.data.stripe_client_id
    
    if(!stripeClientId){
      const stripeClient = await stripe.customers.create({
        email: session.user.email
      })

      
      await fauna.query(
        q.Update(
          q.Ref(
            q.Collection('users'), 
            faunaClientId
          ),{
            data:{ stripe_client_id: stripeClientId }
          }
        )
      )

      stripeClientId = stripeClient.id
    }
    
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeClientId,
      payment_method_types: ['card'],
      billing_address_collection: "required",
      mode: "subscription",
      line_items: [{
        price: 'price_1Ii1CPAL4tLloNaB2msUiDHt', quantity: 1, 
      }],
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    })
    res.status(200).json({ sessionId: stripeCheckoutSession.id})
  } else{
    res.setHeader('ALLOW', 'POST') // Dizer que só se aceita POST
    res.status(405).end('Method not allowed') 
  }
}