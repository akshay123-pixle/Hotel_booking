// import express from 'express';
// import Stripe from 'stripe';
// import { Room } from "../models/room.model.js";
// import {Booking} from "../models/booking.model.js"


// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// export const stripeWebHooks= async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 
//   let event;

//   // Verify webhook signature and retrieve event object
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//   } catch (err) {
//     console.error('Webhook signature verification failed:', err.message);
//     return res.status(400).send(`Webhook error: ${err.message}`);
//   }

//   console.log("event",event);
  

//   // Handle different event types
//   switch (event.type) {
//     case 'checkout.session.completed':
//       const session = event.data.object; // contains the session object
//       const { user, roomId, paymentStatus } = session.metadata; // assuming metadata contains userId and roomId

//       try {
//         // Find the room and user
//         const room = await Room.findById(roomId);
//         if (!room) {
//           throw new Error('Room not found');
//         }

//         // Create a booking record with status "Completed"
//         const booking = new Booking({
//           room: room._id,
//           user: user, // You should get user ID from the session metadata
//           paymentStatus: 'Completed',
//         });

//         await booking.save();
//         console.log('Booking saved:', booking);

//       } catch (error) {
//         console.error('Error while saving booking:', error.message);
//         return res.status(500).send('Error processing webhook');
//       }
//       break;

//     case 'checkout.session.async_payment_failed':
//       const failedSession = event.data.object;
//       const { failedUser, failedRoomId } = failedSession.metadata;

//       try {
//         // Find the room and user
//         const failedRoom = await Room.findById(failedRoomId);
//         if (!failedRoom) {
//           throw new Error('Room not found');
//         }

//         // Create a booking record with status "Failed"
//         const failedBooking = new Booking({
//           room: failedRoom._id,
//           user: failedUser, // You should get user ID from the session metadata
//           paymentStatus: 'Failed',
//         });

//         await failedBooking.save();
//         console.log('Failed Booking saved:', failedBooking);

//       } catch (error) {
//         console.error('Error while saving failed booking:', error.message);
//         return res.status(500).send('Error processing webhook');
//       }
//       break;

//     default:
//       console.log(`Unhandled event type: ${event.type}`);
//   }

//   // Return a response to acknowledge receipt of the event
//   res.status(200).send('Event received');
// };

// export default router;
