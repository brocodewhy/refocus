# REFOCUS — Signal UI Redesign

A complete visual reskin inspired by the supplied Dribbble reference's restrained monochrome palette, technical grid motifs, instrument-like graphics, and purposeful computer-style motion. It is an original implementation, not a copy of the reference artwork.

## Visual direction
- Warm off-white and charcoal surfaces with a restrained burnt-orange accent.
- Technical dot/grid texture, a custom vector signal-monitor illustration, crisp type, restrained borders, and low-noise cards.
- Animated page entrances, active status pulse, hover lift, and animated grid texture on the sign-in panel.
- Consistent light/dark tokens; dark mode uses near-black surfaces and warm orange accents.
- Responsive navigation and page canvas retained.

## Included
- Existing routes, data access, Firebase authentication, Supabase API handlers, focus and Pomodoro pages, planner, wellbeing, habits, settings, and profile modal retained.
- `public/refocus-signal.svg` is a local custom vector illustration used on the dashboard hero and login visual; no remote image host is required.

## Apply
1. Back up your current project.
2. Extract this archive and copy its contents into your project, replacing matching files.
3. Keep your own `.env.local` unchanged; this archive intentionally excludes secrets.
4. Run `npm install` if needed, then `npm run dev`.
5. Verify login, dashboard, focus timer, Pomodoro, planner, habits, wellbeing, and theme toggle against your current Firebase/Supabase environment before deploying.

This is a UI redesign; database behavior and authentication still depend on your existing environment and migrations.
