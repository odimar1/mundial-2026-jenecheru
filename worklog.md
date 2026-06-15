---
Task ID: 1
Agent: Main Agent
Task: Prepare code for PostgreSQL + Vercel deployment compatibility

Work Log:
- Changed Prisma schema provider from SQLite to PostgreSQL
- Updated cookie settings in login, register, and logout API routes to use `secure: process.env.NODE_ENV === 'production'`
- Removed `output: "standalone"` from next.config.ts (not needed for Vercel)
- Created prisma/seed.ts with admin account + 72 World Cup 2026 matches
- Created prisma/migrations/00000000000000_init/migration.sql for initial PostgreSQL migration
- Created prisma/migrations/migration_lock.toml
- Added missing country flags/codes (Italia, Polonia, Serbia, Ucrania, Dinamarca) to page.tsx
- Updated db.ts to only log queries in development mode
- Updated package.json: build command, postinstall, seed, migrate:prod scripts
- Created .env.example with PostgreSQL connection string template
- Added !.env.example exception to .gitignore
- Installed tsx as dev dependency for seed script execution

Stage Summary:
- Code is now fully compatible with PostgreSQL
- All API routes work with both SQLite and PostgreSQL through Prisma abstraction
- Cookie security is properly configured for production HTTPS
- Seed script creates admin (Admin/activofijo26) and 72 group stage matches
- Migration file ready for `prisma migrate deploy` on Vercel
- Ready for Vercel deployment with Vercel Postgres
actualización
