import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
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
      success_url: `${process.env.CLIENT_URL}/subscribe_success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: "Stripe error" });
  }
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
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
    let subscription;
    let status;
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        subscription = event.data.object;
        const email = subscription.customer_email;
        await User.findOneAndUpdate(
          { email },
          { $set: { stripeSubscriptionId: subscription.id } }
        );

        console.log("case fire: checkout.session.completed");
        console.log(`with email: ${email}`);
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case "customer.subscription.created":
        subscription = event.data.object;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            subscriptionActive:
              subscription.status === "active" ||
              subscription.status === "trialing",
            subscriptionTier: subscription.items.data[0].price.nickname,
          }
        );
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case "customer.subscription.updated":
        subscription = event.data.object;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            subscriptionActive:
              subscription.status === "active" ||
              subscription.status === "trialing",
            subscriptionTier: subscription.items.data[0].price.nickname,
          }
        );
        // Then define and call a method to handle the subscription deleted.
        // handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case "customer.subscription.deleted":
        subscription = event.data.object;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            subscriptionActive: false,
            subscriptionTier: null,
          }
        );
        // Then define and call a method to handle the subscription created.
        // handleSubscriptionCreated(subscription);
        break;
      case "invoice.payment_succeeded":
        subscription = event.data.object;
        // console.log(`5. subscription:`);
        // console.log(subscription);
        // Then define and call a method to handle active entitlement summary updated
        // handleEntitlementUpdated(subscription);
        break;
      case "invoice.payment_failed":
        subscription = event.data.object;
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
  }
);
export default router;
