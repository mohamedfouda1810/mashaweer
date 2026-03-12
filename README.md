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
2. Configure `.env` with your `DATABASE_URL` (direct pg connection) and `JWT_SECRET`.
3. Apply database schemas `npx prisma db push` (or `npx node migrate.js` for custom pg extensions).
4. Run the development server: `npm run start:dev`

### Automated Integration Tests
To thoroughly test the backend without the frontend UI:
1. Seed the raw Admin roles: `npx ts-node prisma/seed.ts`
2. Execute the Deep Integration Tests simulator: `npx ts-node run-tests.ts`
*(This will test Passenger Registration, Driver Profile Registration, Admin Approval, Trip Creation, Wallet Deposits, Booking Seat Reservations & Deductions, Waitlisting, Readiness checks, and Trip Completions).*

### Frontend
1. `cd frontend`
2. Configure `.env` with your `NEXT_PUBLIC_API_URL` pointing to the backend.
3. `npm run dev`

---
*Created by the Mashaweer Dev Team*
