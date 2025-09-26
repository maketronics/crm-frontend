# CRM Frontend

A modern, responsive CRM frontend application built with React, TypeScript, and Tailwind CSS. This application provides comprehensive user management and lead tracking capabilities for sales teams.

## Features

### Auth UI
- **Login System**: Secure login with email/password and optional remember me
- **User Management**: Create, edit, view, and manage user accounts
- **Role-based Access Control**: Support for superadmin, admin, user, and viewer roles
- **User Dashboard**: Comprehensive user listing with search, pagination, and actions

### Lead UI
- **Lead Creation**: Comprehensive form with contact info, value tracking, labels, and assignment
- **Lead Management**: Table view with filtering, sorting, and status management
- **Advanced Filtering**: Filter by status, assigned user, source channel, date range, and labels
- **Lead Assignment**: Assign leads to team members with user search
- **Status Management**: Track lead progress through pending, in progress, converted, and lost states

## Technology Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router** - Client-side routing
- **Zustand** - Simple state management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Axios** - HTTP client with interceptors
- **Headless UI** - Accessible UI components

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Modal, etc.)
│   ├── auth/           # Authentication related components
│   └── leads/          # Lead management components
├── pages/              # Page components
│   ├── auth/           # Auth pages (Login, Users)
│   └── leads/          # Lead pages (List, Create)
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── lib/                # API client and utilities
└── utils/              # Helper functions
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crm-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
```bash
# For mock mode (default - no backend required)
VITE_USE_MOCK=true

# For real API mode (uncomment when backend is available)
# VITE_API_BASE_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Mock Login Credentials

The application runs in **mock mode** by default for easy testing without a backend. Use these credentials to log in:

**Superadmin Access (Full Access):**
- Email: `admin@example.com`
- Password: `admin123`
- Permissions: User management + Lead management

**Manager Access (Admin Access):**
- Email: `manager@example.com`
- Password: `manager123`
- Permissions: Lead management + limited user access

**Regular User Access:**
- Email: `user@example.com`
- Password: `user123`
- Permissions: Lead management only

> **Note**: Mock mode is enabled by `VITE_USE_MOCK=true` in your `.env` file. To use a real backend, comment out this line and set `VITE_API_BASE_URL` to your API endpoint.

---

### Building for Production

```bash
npm run build
```

Built files will be available in the `dist/` directory.

---

## API Integration

The application is designed to work with a backend API that provides the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

### Users (Admin/Superadmin only)
- `GET /users` - List users with pagination and search
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `PATCH /users/:id` - Partial update (e.g., activate/deactivate)
- `DELETE /users/:id` - Delete user

### Leads
- `GET /leads` - List leads with filtering and pagination
- `POST /leads` - Create new lead
- `PATCH /leads/:id` - Update lead (status, assignment, etc.)

---

## Features Implementation

### Authentication Flow
- Token-based authentication with automatic refresh
- Persistent login state using Zustand with localStorage
- Protected routes with role-based access control
- Automatic token refresh on API calls

### User Management
- Comprehensive CRUD operations for users
- Role-based access with checkbox selection
- Bulk operations and search functionality
- User status management (active/inactive)

### Lead Management
- Rich lead creation form with validation
- Advanced filtering and search capabilities
- Real-time status updates with optimistic UI
- Lead assignment with user search
- Responsive table with pagination

### Form Validation
- Client-side validation using Zod schemas
- Real-time validation feedback
- Server error handling and display
- Consistent error messaging

### Responsive Design
- Mobile-first responsive design
- Accessible forms and components
- Consistent design system with Tailwind CSS
- Loading states and error boundaries

---

## State Management

The application uses Zustand for state management with separate stores for:

- **Auth Store**: User authentication state, login/logout actions
- **User Store**: User management with CRUD operations and pagination
- **Lead Store**: Lead management with filtering and pagination

---

## Component Architecture

### Base UI Components
- Reusable components with consistent styling
- TypeScript interfaces for props
- Accessible markup and keyboard navigation
- Responsive design patterns

### Business Logic Components
- Separation of concerns between UI and business logic
- Custom hooks for API operations
- Error handling and loading states
- Optimistic updates for better UX

---

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent naming conventions
- Component and function documentation

### Best Practices
- Type-safe API calls with proper error handling
- Accessible UI components with proper ARIA labels
- Responsive design with mobile-first approach
- Performance optimization with proper memoization

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.