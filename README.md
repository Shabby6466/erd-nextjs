# Emergency Travel Document (ETD) System

A modern Next.js application for processing emergency travel documents with role-based access control, form handling, API integrations, and document management.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with JWT token management
- **Role-Based Access**: ADMIN, MINISTRY, AGENCY, MISSION_OPERATOR roles
- **Form Management**: React Hook Form with Zod validation
- **State Management**: Zustand for global state
- **API Integration**: External APIs (NADRA, Passport) with fallback
- **Responsive Design**: Mobile-first approach with government design system
- **Real-time Updates**: React Query for data fetching and caching

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Authentication**: NextAuth.js
- **API Client**: Axios
- **UI Components**: Radix UI + Lucide React icons
- **Notifications**: Sonner toast notifications

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:3837`

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd etd-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3837/v1/api
   BACKEND_URL=http://localhost:3837/v1/api
   
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   
   # External APIs (optional)
   NADRA_API_URL=your-nadra-api-url
   PASSPORT_API_URL=your-passport-api-url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
etd-next/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Dashboard routes
│   ├── applications/             # Application routes
│   ├── api/                      # API routes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── auth/                     # Authentication components
│   ├── forms/                    # Form components
│   ├── dashboard/                # Dashboard components
│   └── shared/                   # Shared components
├── lib/                          # Utility libraries
│   ├── api/                      # API client and services
│   ├── auth/                     # Authentication config
│   ├── stores/                   # Zustand stores
│   ├── utils/                    # Utility functions
│   ├── validations/              # Zod schemas
│   └── types/                    # TypeScript types
├── hooks/                        # Custom React hooks
├── middleware.ts                 # Next.js middleware
└── next.config.ts               # Next.js configuration
```

## 🔐 Authentication

The application uses NextAuth.js with JWT tokens for authentication. Users are redirected to role-specific dashboards based on their role:

- **ADMIN**: `/admin` - Full system access
- **AGENCY**: `/agency` - Application processing
- **MINISTRY**: `/ministry` - Foreign ministry operations
- **MISSION_OPERATOR**: `/hq` - Headquarters oversight

## 📝 Forms

### Citizen Form
The main application form includes:
- CNIC validation and formatting
- External API integration (NADRA)
- Real-time validation
- Auto-population from external APIs
- Manual data entry fallback

### Form Features
- React Hook Form for form state management
- Zod schemas for validation
- CNIC formatting (12345-1234567-1)
- External API integration
- Error handling and user feedback

## 🎨 Design System

The application uses a government design system with:
- **Colors**: Primary blue (#525EB1), background (#E5EDFF)
- **Typography**: Inter font family
- **Components**: shadcn/ui component library
- **Responsive**: Mobile-first design approach

## 🔌 API Integration

### Backend API
- Base URL: `http://localhost:3837/v1/api`
- JWT token authentication
- RESTful endpoints for CRUD operations

### External APIs
- **NADRA API**: Citizen verification
- **Passport API**: Passport verification
- **Fallback**: Manual data entry mode

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
BACKEND_URL=https://your-api-domain.com
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 Configuration

### Tailwind CSS
Custom configuration in `tailwind.config.js` with government color scheme and design tokens.

### Next.js
Configuration in `next.config.ts` with optimizations for production.

### TypeScript
Strict TypeScript configuration with path aliases for better imports.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Migration Notes

This application was migrated from a vanilla HTML/CSS/JavaScript system to Next.js. Key improvements include:

- **Performance**: Server-side rendering and code splitting
- **Developer Experience**: TypeScript, modern tooling, better debugging
- **Maintainability**: Component-based architecture, reusable UI
- **User Experience**: Better loading states, error handling, mobile responsiveness
- **Scalability**: Better code organization, easier feature additions

## 🎯 Roadmap

- [ ] Add more dashboard views (Agency, Ministry, HQ)
- [ ] Implement file upload functionality
- [ ] Add advanced filtering and search
- [ ] Implement real-time notifications
- [ ] Add audit logging
- [ ] Implement offline support
- [ ] Add unit and integration tests
- [ ] Performance optimizations
