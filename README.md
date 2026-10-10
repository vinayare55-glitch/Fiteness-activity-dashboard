# Gains Graph Grid

Build a complete, polished fitness activity dashboard web app called "FitTrack" using React, TypeScript, Tailwind and shadcn/ui. Build everything in one pass, fully working, with no placeholder pages.

DATA MODEL (Workout):

- id (string)

- exercise (string, required)

- category (Cardio | Strength | Yoga | HIIT | Walking | Cycling | Other)

- duration (minutes, number, required)

- date (date, required)

- calories (number, required)

- notes (string, optional)

DATA LAYER:

Create a single file src/lib/api.ts exposing async functions: getWorkouts(), getWorkout(id), createWorkout(data), updateWorkout(id, data), deleteWorkout(id). Implement them with localStorage for now, seeded with 12 realistic sample workouts across the last 30 days. Add a constant API_BASE_URL at the top and a comment explaining that each function can be swapped to fetch() calls against a REST API at /api/workouts (GET, POST, PUT, DELETE) later. Use React Query for data fetching and caching.

PAGES / FEATURES:

1. Dashboard (home):

   - 4 stat cards: total workouts, total minutes, total calories burned, current streak (consecutive days)

   - Line chart: calories burned per day (last 14 days)

   - Bar chart: minutes per week

   - Pie/donut chart: workouts by category

   - "Recent workouts" list (last 5)

   Use Recharts.

2. Workouts page:

   - Table/card list of all workouts with search by exercise, filter by category, filter by date range, and sort by date/calories/duration

   - Edit and Delete buttons on each row (delete with confirmation dialog)

3. Add/Edit Workout: a modal dialog form with validation (react-hook-form + zod), a date picker, and toast notifications on success/error.

4. Progress page: weekly and monthly summaries, personal bests (longest workout, most calories), and a weekly calorie goal progress bar (goal editable and saved).

UI/UX:

- Modern, clean design with a sidebar (desktop) /

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://gains-graph-grid.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d1e988ac-5214-49ed-ba69-2c03c4d6bf23).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
