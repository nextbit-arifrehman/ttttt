# RealEstate Pro Platform

## Overview
This is a full-stack real estate platform built with a modern tech stack featuring a React frontend, Express backend, and PostgreSQL database. The application allows users to browse, list, and purchase real estate properties with role-based access (user, agent, admin) and integrated payment processing via Stripe.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript/JavaScript hybrid approach
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: ShadCN UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for global state (auth, user roles, theme)
- **Data Fetching**: TanStack React Query for server state management and caching
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Authentication**: Firebase Auth with email/password and Google OAuth

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (Neon serverless)
- **Session Management**: Express sessions with PostgreSQL store
- **Payment Processing**: Stripe integration for property purchases
- **File Uploads**: Multer middleware for property images

### Database Schema
- **Users**: User profiles with roles (user, agent, admin), verification status
- **Properties**: Property listings with images, location, pricing, agent details
- **Offers**: Purchase offers linking buyers to properties with status tracking
- **Reviews**: User reviews for properties with ratings
- **Wishlists**: User saved properties functionality

## Key Components

### Authentication System
- Firebase Auth handles user authentication
- Role-based access control (user, agent, admin)
- JWT token management with secure cookie storage
- User verification and fraud detection flags

### Property Management
- CRUD operations for property listings
- Image upload and storage capabilities
- Property verification workflow
- Advertisement system for featured listings
- Location-based search and filtering

### Payment Integration
- Stripe payment processing for property purchases
- Secure card input with Stripe Elements
- Transaction tracking and status management
- Payment confirmation and receipt handling

### UI Components
- Comprehensive design system with ShadCN UI
- Responsive design supporting mobile, tablet, and desktop
- Dark/light mode theme switching
- Accessible components following WCAG guidelines
- Toast notifications for user feedback

## Data Flow

### Property Listing Flow
1. Agent creates property listing with images and details
2. Property enters verification queue (pending status)
3. Admin reviews and approves/rejects property
4. Verified properties appear in public listings
5. Properties can be marked for advertisement display

### Purchase Flow
1. User browses verified properties
2. User makes offer on selected property
3. Agent receives offer notification
4. Upon offer acceptance, payment processing begins
5. Stripe handles secure payment collection
6. Transaction completion triggers status updates

### User Authentication Flow
1. User registers/logs in via Firebase Auth
2. User profile created/updated in backend database
3. JWT token issued and stored in secure cookies
4. Role-based route protection enforced
5. Session persistence across browser refreshes

## External Dependencies

### Third-Party Services
- **Firebase**: Authentication and user management
- **Stripe**: Payment processing and financial transactions
- **Neon**: Serverless PostgreSQL database hosting

### Key Libraries
- **Frontend**: React, TanStack Query, ShadCN UI, Tailwind CSS, Firebase SDK
- **Backend**: Express, Drizzle ORM, Stripe SDK, Multer
- **Development**: Vite, TypeScript, ESBuild

## Deployment Strategy

### Build Process
- Vite builds optimized frontend bundle to `dist/public`
- ESBuild compiles TypeScript backend to `dist/index.js`
- Database migrations managed via Drizzle Kit

### Environment Configuration
- Environment variables for database connection, Firebase config, and Stripe keys
- Separate development and production configurations
- Secure credential management for API keys

### Development Workflow
- Hot module replacement via Vite in development
- TypeScript type checking across shared schemas
- Database schema synchronization with `db:push` command
- Integrated error handling and logging

The architecture prioritizes type safety, developer experience, and scalability while maintaining clean separation of concerns between frontend, backend, and data layers.

## Recent Changes

### Feature Implementation Complete (July 17, 2025)
- **✅ Challenge Task 1**: Search functionality by location implemented and working on All Properties page
- **✅ Challenge Task 2**: Sort functionality by price range (High to Low, Low to High, Newest) implemented and working
- **✅ Challenge Task 3**: JWT authentication implemented with token storage in localStorage
- **✅ Challenge Task 4**: Agent dashboard "My Sold Properties" with total sold amount tracking implemented
- **✅ Challenge Task 5**: Admin dashboard "Advertise Property" feature fully implemented
- **✅ Backend API Documentation**: Updated port from 5000 to 3001 in all documentation
- **✅ Frontend Integration**: All dashboard features working with proper role-based access control
- **✅ Database Integration**: MongoDB connected with Firebase Admin SDK on backend
- **✅ Authentication Flow**: Dual authentication system (Firebase + MongoDB) implemented
- **✅ Toast Notifications**: SweetAlert/toast notifications implemented for all CRUD operations
- **✅ Responsive Design**: All pages responsive for mobile, tablet, and desktop
- **✅ Private Route Protection**: Route protection implemented with role-based access

### Migration to Replit (July 17, 2025)
- **✅ Successfully migrated project from Replit Agent to Replit environment**
- **✅ Installed all required Node.js packages and dependencies for both frontend and backend**
- **✅ Configured client-server architecture with proper port separation:**
  - Frontend (React/Vite): Running on port 3000 with Vite proxy
  - Backend (Express/Node.js): Running on port 5000
- **✅ Fixed backend URL configuration for Replit environment with proper domain routing**
- **✅ Configured Vite proxy to route /api requests to backend server (localhost:5000)**
- **✅ Firebase authentication fully functional with user data persistence**
- **✅ MongoDB database successfully connected with existing credentials**
- **✅ Both frontend and backend servers running smoothly in Replit environment**
- **✅ Application functions correctly with Firebase authentication as primary auth system**
- **✅ Backend API integration working through Vite proxy configuration**
- **✅ Google authentication error resolved with proper backend URL configuration**
- **✅ Fixed React runtime errors with proper import statements**
- **✅ Created missing UI components (calendar component)**
- **✅ Environment variables properly configured in backend .env file**
- **✅ Migration checklist completed - all items verified and working**
- **✅ Migration Complete**: Created .env file with all required API secrets
- **✅ Missing Components Fixed**: Created calendar UI component to resolve import errors
- **✅ Security Implementation**: Proper client/server separation with secure environment variables
- **✅ Production Ready**: All services connected and operational on Replit platform

### Authentication & MongoDB Integration (July 17, 2025)
- Fixed Firebase Google authentication and email/password login issues
- Implemented dual authentication system: Firebase + MongoDB backend
- Connected frontend to MongoDB backend via existing API endpoints
- Added proper JWT token management for backend API requests
- Configured CORS headers and API client for cross-origin requests
- Implemented fallback system: MongoDB sync with Firebase as backup
- **✅ Auto-User Creation**: Users are automatically created in MongoDB on first login
- **✅ Google Login Integration**: Successfully tested with arifrahman.nft@gmail.com
- **✅ MongoDB Sync**: Backend ready for user data synchronization
- **✅ Error Handling**: Proper error handling with Firebase fallback system
- **✅ Migration Complete**: Application fully functional with persistent Firebase authentication
- **✅ Development Ready**: Both frontend and backend services operational