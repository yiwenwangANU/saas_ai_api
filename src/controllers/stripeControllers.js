import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeCheckoutSession = async (req, res) => {
  const { priceId, email } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: { email }, // parse the metadata in the session
      },
      success_url: `${process.env.CLIENT_URL}/subscribe_success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: "Stripe error" });
  }
};

export const stripeWebhooks = async (request, response) => {
  let event = request.body;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }
  let session;
  // Handle the event, events may have race conditions
  try {
    switch (event.type) {
      case "checkout.session.completed":
        console.log(`1.checkout.session.completed`);
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case "customer.subscription.created":
        session = event.data.object;
        const email = session.metadata.email;
        await User.findOneAndUpdate(
          { email: email },
          {
            stripeSubscriptionId: session.id,
            subscriptionActive:
              session.status === "active" || session.status === "trialing",
            subscriptionTier: session.items.data[0].plan.interval,
          }
        );
        console.log(session);
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case "customer.subscription.updated":
        session = event.data.object;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: session.id },
          {
            subscriptionActive:
              session.status === "active" || session.status === "trialing",
            subscriptionTier: session.items.data[0].plan.interval,
          }
        );
        // Then define and call a method to handle the subscription deleted.
        // handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case "customer.subscription.deleted":
        session = event.data.object;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: session.id },
          {
            stripeSubscriptionId: null,
            subscriptionActive: false,
            subscriptionTier: null,
          }
        );
        // Then define and call a method to handle the subscription created.
        // handleSubscriptionCreated(subscription);
        break;
      case "invoice.payment_succeeded":
        session = event.data.object.subscription;
        // console.log(`5. subscription:`);
        // console.log(subscription);
        // Then define and call a method to handle active entitlement summary updated
        // handleEntitlementUpdated(subscription);
        break;
      case "invoice.payment_failed":
        session = event.data.object.subscription;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: session.id },
          {
            subscriptionActive: false,
          }
        );
        // console.log(`6. subscription: ${subscription}`);
        // Then define and call a method to handle active entitlement summary updated
        // handleEntitlementUpdated(subscription);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  } catch (error) {
    next(error);
  }
};
