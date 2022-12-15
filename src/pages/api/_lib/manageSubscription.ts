import { fauna } from "../../../services/fauna";
import { query as q } from 'faunadb'
import { stripe } from "../../../services/stripe";
import Router from "next/dist/next-server/server/router";


interface SubscriptionRef{
  id: string;
}

export async function manageSubscription(
  subscriptionId: string,
  stripe_client_id: string,
  actionType: 'create' | 'update' | 'delete'
){
  
  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(
        q.Match(
          q.Index('user_by_stripe_id'),
          stripe_client_id
        )
      )
    )
  )
  if(!userRef){
    throw new Error('Unable to save user subscription in database')
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const subscriptionData = {
    subscriptionId: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id
  }
  switch(actionType){
    case 'create':
      await fauna.query(
        q.Create(
          q.Collection('subscriptions'),
          {
            data: subscriptionData 
          }
        )
      )
      break;
      
    case 'update':
    case 'delete':
      const oldSubscriptionRef = await fauna.query<SubscriptionRef>(
        q.Select(
          "ref",
          q.Get(
            q.Match(
              q.Index('subscription_by_id'),
              subscription.id 
            )
          )
        )
      )

      await fauna.query(
        q.Replace(
          q.Ref(
            q.Collection('subscriptions'),
            oldSubscriptionRef.id
          ),
          {
            data: subscriptionData
          }
        )
      )
      break;
  } 
  
  return 
}