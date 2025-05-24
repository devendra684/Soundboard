# SoundBoard

SoundBoard is a collaborative music studio web application where users can create jam rooms, record loops, layer tracks, and invite others to join and collaborate in real time.

## Features

- 🎵 Create and join jam rooms
- 🎤 Record and layer audio loops
- 🎚️ Export mixdowns
- 🔗 Invite collaborators with a shareable link
- 👥 Real-time collaboration
- 🔒 Modern authentication (login/signup)
- 💡 Responsive, modern UI

## Tech Stack

- **Framework:** Next.js (App Router, React 18)
- **Styling:** Tailwind CSS
- **Database:** Prisma ORM (with PostgreSQL or SQLite)
- **Authentication:** NextAuth.js
- **UI Components:** Headless UI, Lucide React Icons
- **State/Data:** SWR, React Context

## Project Structure

```
.
├── public/                       # Static assets (logo, icons, images)
│   ├── logo.png
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── profile-photo.jpg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # App layout
│   │   ├── globals.css           # Global styles
│   │   ├── providers.tsx         # Context providers (e.g., auth)
│   │   ├── not-found.tsx         # 404 page
│   │   ├── error.tsx             # Error page
│   │   ├── (user)/
│   │   │   ├── layout.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── rooms/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── rooms-client.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── join/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── join-client.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── room-client.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── signup/
│   │   │   │   └── [...nextauth]/
│   │   │   ├── loops/
│   │   │   ├── mixdowns/
│   │   │   └── rooms/
│   │   │       ├── route.ts
│   │   │       ├── join/
│   │   │       │   └── route.ts
│   │   │       ├── join.ts
│   │   │       └── [roomId]/
│   ├── components/
│   │   ├── common/
│   │   │   ├── avatar.tsx
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── link.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── navbar-layout.tsx
│   │   │   ├── text.tsx
│   │   ├── auth/
│   │   │   ├── auth-page.tsx
│   │   │   ├── logout-button.tsx
│   │   │   └── signup-form.tsx
│   │   ├── ui/
│   │   ├── create-room.tsx
│   │   ├── invite-modal.tsx
│   │   └── public-toggle.tsx
│   ├── layouts/
│   │   └── user-layout.tsx
│   ├── lib/
│   │   ├── blob.ts
│   │   ├── prisma.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── next-auth.d.ts
│   └── middleware.ts
├── prisma/                       # Prisma schema and migrations
├── package.json
├── package-lock.json / pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── .gitignore
└── README.md
```

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables:**

   - Copy `.env.example` to `.env` and fill in your values.

3. **Run the development server:**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

## License

MIT

---

**Made with ❤️ for collaborative musicians.**
