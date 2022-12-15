import { loadStripe, Stripe } from '@stripe/stripe-js'

// Essa função concede ao browser o poder de interagir com o stripe
export async function getStripeJS(){
    const stripeJS =  await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    return stripeJS
}

