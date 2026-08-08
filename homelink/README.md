## HomeLink

HomeLink is a bilingual (English/Amharic) domestic employment platform for Addis Ababa. The frontend includes worker, household/employer, and Delala/broker workspaces. Supabase persistence is defined in `supabase/schema.sql`.

### Configure Supabase

1. Create a Supabase project.
2. Enable Phone authentication and SMS OTP.
3. Copy `.env.example` to `.env.local` and add the project URL and anon key.
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Add an SMS provider in Supabase Auth for production OTP delivery.

Without Supabase environment variables, the UI remains available in demo mode. With them configured, phone signup, OTP verification, and login use Supabase Auth.

### Product roles

- Workers: profiles, experience and guarantor documents, job search, saved jobs, applications, interviews, messages, ratings, and notifications.
- Households/employers: verified company profiles, job posts, worker search, applicant shortlists, interviews, hiring history, and employer-paid commissions.
- Delalas/brokers: legal business licence verification, worker portfolios, employer management, placement tracking, ratings, performance history, and commission records.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
