# Kinship - React Version

A peer-to-peer rental platform built with React and Vite.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Browse Items**: Search and filter rental items by category, price, location
- **List Items**: Post your items for rent with pricing and availability
- **Favorites**: Save items to your favorites list
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Context API**: State management
- **LocalStorage**: Data persistence

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd kinship-react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
kinship-react/
├── public/              # Static assets
│   └── assets/         # Images and icons
├── src/
│   ├── components/     # Reusable React components
│   ├── contexts/       # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API and storage services
│   ├── styles/         # CSS stylesheets
│   └── utils/          # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Demo Account

You can test the application with the demo account:
- Email: demo@kinship.com
- Password: demo123

## Migration from Vanilla JS

This is a React version of the original vanilla JavaScript Kinship application. Key improvements include:

- Component-based architecture
- Declarative UI with React
- Better state management with Context API
- Improved routing with React Router
- Modern build tooling with Vite
- Better code organization and maintainability

## Features to Add

- [ ] Complete Browse page with advanced filtering
- [ ] Full Item Detail page with booking calendar
- [ ] User Profile management
- [ ] List new items functionality
- [ ] Review and rating system
- [ ] Real-time messaging
- [ ] Payment integration

## License

MIT

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
