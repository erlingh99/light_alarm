# Alarm Project Frontend

A modern React application for managing alarms with a beautiful UI built using shadcn-ui and Tailwind CSS.

## Features

- 🎨 Modern, responsive UI with dark/light mode support
- ⏰ Create, edit, and manage alarms
- 🔄 Recurring alarm patterns (daily, weekly, custom)
- 📈 Customizable intensity curves:
  - Linear progression
  - S-curve transition
  - Asymptotic approach
  - Custom curves with control points
- 🎯 Active/inactive alarm states
- 🔍 Real-time updates

## Prerequisites

- Node.js 18.0.0 or higher
- npm or bun (recommended)

## Setup

1. Install dependencies:
```bash
# Using npm
npm install

# Or using bun
bun install
```

2. Start the development server:
```bash
# Using npm
npm run dev

# Or using bun
bun run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

1. Build the application:
```bash
# Using npm
npm run build

# Or using bun
bun run build
```

2. The built files will be in the `dist` directory

## Development

### Project Structure

- `src/`
  - `components/`: Reusable UI components
  - `pages/`: Page components
  - `hooks/`: Custom React hooks
  - `types/`: TypeScript type definitions
  - `lib/`: Utility functions and configurations
  - `App.tsx`: Main application component
  - `main.tsx`: Application entry point

### Component Documentation

#### IntensityCurveSelector

The intensity curve selector allows users to define how the light intensity changes over time:

- **Linear**: Simple linear progression from start to end intensity
- **S-curve**: Smooth transition with adjustable sharpness
- **Asymptotic**: Gradual approach to target with adjustable decay rate
- **Custom**: User-defined curve using control points

Parameters:
- Start Intensity (0-100%)
- End Intensity (0-100%)
- Curve Type
- Curve-specific parameters:
  - S-curve: Sharpness (1-50)
  - Asymptotic: Decay Rate (-50 to 50)
  - Custom: Control points (x: 0-100, y: 0-100)

### Technologies Used

- **Build**: Vite
- **Framework**: React
- **Type Safety**: TypeScript
- **Routing**: React Router
- **UI Components**: shadcn-ui
- **Styling**: Tailwind CSS
- **Data Management**: TanStack Query
- **Theme Management**: next-themes