# Infinity ♾️

> Cataloging your significant other's path to broke and fabulous!

Help keep the demo running (and help me pay for stuff on my wife's Infinity list!)

[![Donate with Crypto](https://img.shields.io/badge/Donate-with%20Crypto-orange?logo=bitcoin&style=for-the-badge)](https://commerce.coinbase.com/checkout/ed154b65-c8c6-429a-a859-07dc359859fa)

## What is this?

Does your significant other spend thousands of dollars in his or her head every day? And tell you about all the things he or she wants to buy in great detail?

Show your significant other how much all that junk costs simply by saying to the Infinity app what your significant other wants to buy. The app uses LLMs to estimate the price of the item, and tracks all the spending requests in a database.

## Getting Started

### Supabase

You'll need a [Supabase](https://supabase.com) database. The free plan is more than enough for this app.

You'll need to create a table called `shopping_items`. See `types/supabase.ts` for the schema.

Make sure to create a foreign key relation between `user_id` in the `shopping_items` table and `auth.users.id` table. In supabase, do this:

1. Go to your Supabase project dashboard
2. Click on "Table Editor" in the sidebar
3. Select the shopping_items table
4. Go to the "Foreign Keys" tab
5. Click "Add Foreign Key"
6. Set:
   - Column: user_id
   - Referenced Schema: auth
   - Referenced Table: users
   - Referenced Column: id

### API keys

You need to create a `.env.local` file in the root of the project and add the following keys:

```
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the app

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

## Contributing

If you want to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch.
3. Make your changes and commit them.
4. Push to your fork and create a pull request.
