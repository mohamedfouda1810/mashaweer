# Mashaweer - Inter-City Rides Platform

Mashaweer is a premium inter-city ride-sharing platform connecting passengers with verified drivers. It offers a secure, real-time environment for booking seats, managing trips, handling wallet payments, and completing robust driver validations.

## 🚀 Features
- **Real-Time Notifications & Seats Tracking**: Using WebSockets (Socket.IO) to push instantaneous updates to users when seats are booked or when trips change status.
- **Advanced Driver Validation System**: Multi-photo upload capabilities for verifying driver licenses, car plates, and personal identities.
- **Seat Booking & Pricing Flexibility**: The system calculates the exact price by treating trip price as "price per individual seat".
- **Trip Readiness**: Time-gated "Ready" buttons blocking malicious cancellations near the trip's departure time, increasing trust for both passengers and drivers.
- **Admin Dashboard**: Comprehensive monitoring and authorization capabilities over driver profiles, global trips, and user roles.
- **Secure Authentication & Edge Cases Tracking**: Block and ban lists integrated alongside wallet verifications.

## 🛠 Tech Stack
- **Frontend**: Next.js 16+, React 19, Tailwind CSS, Zustand, Socket.IO Client
- **Backend**: NestJS, Prisma ORM, PostgreSQL, Socket.IO
- **Deployment & Payment**: Designed for deployment seamlessly via Vercel and ready for InstaPay/Vodafone Cash validations.

## ⚙️ Getting Started

### Backend
1. `cd backend`
2. Configure `.env` with your `DATABASE_URL` and `JWT_SECRET`.
3. `npx prisma db push`
4. `npm run start:dev`

### Frontend
1. `cd frontend`
2. Configure `.env` with your `NEXT_PUBLIC_API_URL` pointing to the backend.
3. `npm run dev`

---
*Created by the Mashaweer Dev Team*
