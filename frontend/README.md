# Alarm Project Frontend

A modern React application for managing alarms with a beautiful UI built using shadcn-ui and Tailwind CSS.

## Features

- 🎨 Modern, responsive UI with dark/light mode support
- ⏰ Create, edit, and manage alarms
- 🔄 Recurring alarm patterns (daily, weekly, custom)
- 📈 Customizable intensity curves
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

2. Create a `.env` file in the root directory:
```env
VITE_BACKEND_IP=http://localhost:8000
```

3. Start the development server:
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

### Technologies Used

- Vite - Build tool and development server
- React - UI framework
- TypeScript - Type safety
- React Router - Client-side routing
- shadcn-ui - UI component library
- Tailwind CSS - Utility-first CSS framework
- TanStack Query - Data fetching and caching
- next-themes - Theme management

## Deployment

### Option 1: Static Hosting

1. Build the application:
```bash
npm run build
```

2. Deploy the contents of the `dist` directory to any static hosting service:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront
   - etc.

### Option 2: Docker

1. Build the Docker image:
```bash
docker build -t alarm-frontend .
```

2. Run the container:
```bash
docker run -p 80:80 alarm-frontend
```

## Environment Variables

- `VITE_BACKEND_IP`: Backend API URL (default: http://localhost:8000)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
