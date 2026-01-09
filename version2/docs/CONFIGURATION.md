# 🔧 Configuration Reference

## Multi-Modal Logistics Platform - Configuration Guide

Complete reference for all configuration options in the platform.

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Next.js Configuration](#nextjs-configuration)
3. [TypeScript Configuration](#typescript-configuration)
4. [Tailwind Configuration](#tailwind-configuration)
5. [Backend Configuration](#backend-configuration)
6. [Component Configuration](#component-configuration)

---

## Environment Variables

### Frontend (.env.local)

Create `.env.local` in the project root:

```env
# ===========================================
# API CONFIGURATION
# ===========================================

# Backend API base URL (required)
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001

# WebSocket base URL for real-time updates (required)
NEXT_PUBLIC_WS_BASE=ws://127.0.0.1:8001


# ===========================================
# GOOGLE MAPS (Optional)
# ===========================================

# Google Maps API key for route visualization
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here


# ===========================================
# FEATURE FLAGS (Optional)
# ===========================================

# Enable debug mode
NEXT_PUBLIC_DEBUG=false

# Enable mock data fallback
NEXT_PUBLIC_USE_MOCK_DATA=true

# Real-time polling interval (ms)
NEXT_PUBLIC_POLLING_INTERVAL=30000


# ===========================================
# ANALYTICS (Optional)
# ===========================================

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Google Analytics
NEXT_PUBLIC_GA_ID=
```

### Environment-Specific Files

| File | Purpose |
|------|---------|
| `.env.local` | Local development (git-ignored) |
| `.env.development` | Development environment |
| `.env.production` | Production environment |
| `.env.test` | Test environment |

### Accessing Environment Variables

```typescript
// In client components (must be prefixed with NEXT_PUBLIC_)
const apiBase = process.env.NEXT_PUBLIC_API_BASE

// In server components / API routes
const secretKey = process.env.SECRET_KEY  // No prefix needed
```

---

## Next.js Configuration

### next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Standalone output for Docker deployments
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.tile.openstreetmap.org',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Rewrites for API proxy (optional)
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE}/:path*`,
      },
    ]
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Custom webpack config
    return config
  },
}

export default nextConfig
```

---

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    // Language & Environment
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",

    // Modules
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,

    // Emit
    "noEmit": true,
    "incremental": true,

    // Type Checking
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,

    // Interop
    "allowJs": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,

    // Path Aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },

    // Plugins
    "plugins": [
      {
        "name": "next"
      }
    ]
  },

  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],

  "exclude": [
    "node_modules",
    "backend",
    "flutter_client"
  ]
}
```

---

## Tailwind Configuration

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  // Dark mode strategy
  darkMode: ["class"],

  // Content paths
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // Theme customization
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Custom colors (CSS variables)
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom logistics colors
        logistics: {
          pending: "#f59e0b",
          "in-transit": "#3b82f6",
          delivered: "#22c55e",
          failed: "#ef4444",
        },
      },

      // Border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Font families
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },

      // Animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },

  // Plugins
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
}

export default config
```

### postcss.config.mjs

```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
```

---

## Backend Configuration

### data.py Constants

```python
# backend/app/data.py

# Number of warehouses per district (default: 2)
DEFAULT_WAREHOUSES_PER_DISTRICT = 2

# Number of drivers per district (default: 20)
DEFAULT_DRIVERS_PER_DISTRICT = 20

# OpenStreetMap configuration
OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
OSM_ATTRIBUTION = "© OpenStreetMap contributors"

# Tamil Nadu geographic bounds
TAMIL_NADU_BOUNDS = [[8.0, 76.0], [13.5, 80.5]]

# Vehicle profiles
VEHICLE_TYPES = {
    "bike": {
        "speed_kmph": 35.0,
        "cost_per_km": 4.0,
        "handling_time_min": 8.0,
        "max_distance_km": 80.0,
        "emission_factor": 0.6,
    },
    "auto": {
        "speed_kmph": 40.0,
        "cost_per_km": 6.0,
        "handling_time_min": 10.0,
        "max_distance_km": 120.0,
        "emission_factor": 0.8,
    },
    "minivan": {
        "speed_kmph": 55.0,
        "cost_per_km": 8.5,
        "handling_time_min": 12.0,
        "max_distance_km": 220.0,
        "emission_factor": 1.0,
    },
    "truck": {
        "speed_kmph": 45.0,
        "cost_per_km": 12.0,
        "handling_time_min": 15.0,
        "max_distance_km": 400.0,
        "emission_factor": 1.5,
    },
}
```

### Routing Parameters

```python
# backend/app/routing.py

# Default maximum hops for route planning
DEFAULT_MAX_HOPS = 7

# k-nearest neighbors for graph construction
K_NEAREST = 6

# Base handling fee (₹)
BASE_HANDLING_FEE = 30.0

# Fuel price index range
FUEL_INDEX_MIN = 0.94
FUEL_INDEX_MAX = 1.10
```

### CORS Configuration

```python
# backend/app/main.py

app.add_middleware(
    CORSMiddleware,
    # Allowed origins (use specific origins in production)
    allow_origins=["*"],  # ["https://your-domain.com"]
    
    # Allow credentials (cookies, authorization headers)
    allow_credentials=True,
    
    # Allowed HTTP methods
    allow_methods=["*"],  # ["GET", "POST", "PUT", "DELETE"]
    
    # Allowed headers
    allow_headers=["*"],
)
```

---

## Component Configuration

### components.json (shadcn/ui)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Adding New shadcn/ui Components

```bash
# Add a single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add card dialog form

# List available components
npx shadcn@latest add
```

---

## Configuration Best Practices

### Security

1. **Never commit secrets** - Use `.env.local` for sensitive values
2. **Restrict CORS** - Use specific origins in production
3. **Validate inputs** - Use Pydantic schemas on backend
4. **Use HTTPS** - Enable in production deployments

### Performance

1. **Enable caching** - Use appropriate cache headers
2. **Optimize images** - Use Next.js Image component
3. **Lazy load** - Use dynamic imports for heavy components
4. **Minimize bundles** - Check bundle analyzer regularly

### Development

1. **Use TypeScript strictly** - Enable all strict options
2. **Lint code** - Configure ESLint properly
3. **Format consistently** - Use Prettier
4. **Document changes** - Update docs with config changes

---

## Configuration Checklist

### Before Development

- [ ] Clone repository
- [ ] Create `.env.local` with API URLs
- [ ] Install dependencies (`pnpm install`)
- [ ] Setup Python virtual environment
- [ ] Install backend dependencies

### Before Production

- [ ] Set production environment variables
- [ ] Configure CORS for production domains
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure CDN for static assets
- [ ] Test all functionality
- [ ] Review security settings
