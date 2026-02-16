# Mileage Tracker Portal

A mobile-first, fast mileage logging web app built with React, Supabase, and Tailwind CSS.

## Core Features

- **Lightning Fast Trip Entry**: Add a trip in under 10 seconds
- **Smart Defaults**: Auto-fills date, time, and last location
- **One-Tap Actions**: Quick buttons for common workflows
- **Mobile-First Design**: Optimized for thumb-friendly mobile use
- **Business/Private Tracking**: Categorize trips easily
- **Reports & Analytics**: View statistics and export data
- **Vehicle Management**: Track multiple vehicles
- **PWA Support**: Install as a native app

## Tech Stack

- **Frontend**: React 18, TypeScript, React Router 7
- **Styling**: Tailwind CSS v4, Radix UI components
- **Backend**: Supabase (Auth + Edge Functions)
- **Database**: Supabase KV Store
- **Charts**: Recharts
- **Deployment**: Netlify-ready

## Project Structure

```
/src/app/
  /pages/          - All route components
    Landing.tsx    - Landing page
    Login.tsx      - Authentication
    Signup.tsx     - User registration
    AppShell.tsx   - Main app layout
    Trips.tsx      - Trip list with filters
    AddTrip.tsx    - Fast trip entry form
    EditTrip.tsx   - Edit existing trip
    Vehicles.tsx   - Vehicle management
    Reports.tsx    - Analytics & reports
    Settings.tsx   - User settings
  /lib/
    supabase.ts    - Supabase client & API helpers
  routes.ts        - React Router configuration

/supabase/functions/server/
  index.tsx        - Backend API routes
```

## API Endpoints

All endpoints are prefixed with `/make-server-7770b39e`

### Authentication
- `POST /signup` - Create new user
- Uses Supabase Auth for login/logout

### Trips
- `GET /trips` - Get all trips for user
- `POST /trips` - Create new trip
- `PUT /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip

### Vehicles
- `GET /vehicles` - Get all vehicles
- `POST /vehicles` - Create vehicle
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle

### Reports
- `GET /reports` - Get statistics and analytics

### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile

## Key Design Decisions

### Speed-First UX
- Auto-focus on first field
- Large touch targets (48px+)
- Numeric keyboards for odometer input
- Auto-calculated distance
- Quick action buttons

### Smart Defaults
- Date: Today
- Time: Now
- Vehicle: Auto-selected if only one
- Start location: From last trip's end

### Mobile-First
- Bottom navigation on mobile
- Floating action buttons
- Sticky save button
- Optimized for one-handed use

## Database Schema

### Profile
```typescript
{
  id: string;
  email: string;
  name: string;
  created_at: string;
}
```

### Vehicle
```typescript
{
  id: string;
  user_id: string;
  name: string;
  license_plate: string;
  current_odometer: number;
  created_at: string;
}
```

### Trip
```typescript
{
  id: string;
  user_id: string;
  vehicle_id?: string;
  date: string;
  time: string;
  start_location: string;
  end_location: string;
  odometer_start: number;
  odometer_end: number;
  distance_km: number; // auto-calculated
  purpose: 'business' | 'private';
  notes?: string;
  created_at: string;
}
```

## Development

The app is ready to run. All necessary packages are installed.

### Environment
Supabase is pre-configured via `/utils/supabase/info.tsx`

## Features by Page

### Add Trip (Priority Screen)
- Large numeric inputs
- Auto-calculated distance
- Current location button
- "Same as last trip" quick action
- "Duplicate last trip" quick action
- "Reverse start/end" button
- Business/Private toggle
- Sticky save button

### Trips List
- Compact trip cards
- Date, route, distance, purpose
- Filters: date range, vehicle, purpose
- Edit/Delete actions
- Empty state with CTA
- Floating Add button (mobile)

### Reports
- Total km statistics
- Business vs Private breakdown
- Monthly charts (last 6 months)
- Export CSV/PDF
- Current month summary

### Vehicles
- Add/Edit vehicles
- Track current odometer
- License plate info
- Delete with confirmation

### Settings
- User profile management
- Company info (for exports)
- PWA installation prompt
- Export all data
- Log out
- Delete account

## PWA Setup

The app includes:
- `/public/manifest.json` - App manifest
- Theme color: #00A884 (Teal)
- Standalone display mode
- Portrait orientation

To enable full PWA:
1. Add app icons to `/public/` (icon-192.png, icon-512.png)
2. Register service worker (optional, for offline support)
3. Deploy to HTTPS (required for PWA)

## Deployment to Netlify

1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables (if needed)

The app uses client-side routing, so Netlify redirects are handled automatically.

## Security Notes

⚠️ **Important**: This is a prototype built with Figma Make. For production use:
- Implement proper email verification
- Add rate limiting
- Enhance input validation
- Add CSRF protection
- Implement proper session management
- Regular security audits

## Color Scheme

- Primary: Teal (#00A884)
- Business: Blue (#2563eb)
- Private: Gray (#6b7280)
- Destructive: Red (#d4183d)

## Browser Support

- Modern browsers (Chrome, Safari, Firefox, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- PWA support on supported platforms

## License

Built with Figma Make
