
## Steps

1. Install dependencies using pnpm:

```sh
pnpm install
```

2. Copy `.env.example` to `.env.local` and update the variables.

```sh
cp .env.example .env.local
```

3. Start the development server:

```sh
pnpm run dev
```

> [!NOTE]  
> I use [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) package for update this project.
>
> Use this command for update your project: `ncu -i --format group`

## Roadmap
- [ ] Add fluent api docs
- [ ] Add tutorial
- [ ] Add examples

## Tech Stack + Features

### Project template
  - https://github.com/mickasmt/next-saas-stripe-starter

### Frameworks

- [Next.js](https://nextjs.org/) – React framework for building performant apps with the best developer experience

### UI

- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework for rapid UI development
- [Shadcn/ui](https://ui.shadcn.com/) – Re-usable components built using Radix UI and Tailwind CSS
- [Framer Motion](https://framer.com/motion) – Motion library for React to animate components with ease
- [Lucide](https://lucide.dev/) – Beautifully simple, pixel-perfect icons
- [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) – Optimize custom fonts and remove external network requests for improved performance
- [`ImageResponse`](https://nextjs.org/docs/app/api-reference/functions/image-response) – Generate dynamic Open Graph images at the edge

### Code Quality

- [TypeScript](https://www.typescriptlang.org/) – Static type checker for end-to-end typesafety
- [Prettier](https://prettier.io/) – Opinionated code formatter for consistent code style
- [ESLint](https://eslint.org/) – Pluggable linter for Next.js and TypeScript

### Miscellaneous

- [Posthog](https://posthog.com/) – Track unique visitors, pageviews, and more in a privacy-friendly way

## Author

Created by [@vmgolubev](https://twitter.com/vmgolubev) in 2025, released under the [MIT license](https://github.com/shadcn/taxonomy/blob/main/LICENSE.md).
