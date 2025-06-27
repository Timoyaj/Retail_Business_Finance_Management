# LedgerLoom - Weaving Your Business Story

![LedgerLoom Logo](https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200&h=300&fit=crop)

LedgerLoom is a modern, intuitive financial management platform designed specifically for small retail businesses. Transform complex retail finances into colorful, engaging insights that make accounting feel less like a chore and more like storytelling.

## ✨ Features

### 🎯 Retail-Focused Design
- **Profit Pulse**: Real-time financial insights with beautiful visualizations
- **Shrinkage Spotlight**: Track inventory discrepancies and losses
- **Product Performance Palette**: Analyze which products drive your success
- **Cash Flow Compass**: Navigate your business finances with confidence

### 📊 Core Functionality
- **Sales Management**: Quick transaction entry with multiple payment methods
- **Expense Tracking**: Categorized expense management with smart insights
- **Inventory Control**: Real-time stock tracking with low-stock alerts
- **Financial Reports**: Comprehensive P&L, cash flow, and KPI dashboards
- **Business Analytics**: Retail-specific metrics and performance indicators

### 🎨 User Experience
- **Beautiful UI**: Apple-level design aesthetics with thoughtful micro-interactions
- **Mobile-First**: Responsive design that works perfectly on any device
- **Intuitive Navigation**: Clean, organized interface designed for busy retail owners
- **Real-time Updates**: Live data synchronization across all features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ledgerloom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see LedgerLoom in action!

## 🗄️ Database Setup

LedgerLoom uses Supabase as its backend. The database schema includes:

- **Profiles**: User account information
- **Business Profiles**: Business-specific settings and preferences
- **Products**: Inventory management with stock tracking
- **Transactions**: Sales, expenses, and financial records
- **Categories**: Customizable categorization system

### Database Features
- **Row Level Security (RLS)**: Secure data isolation per user
- **Real-time Subscriptions**: Live updates across the application
- **Automatic Migrations**: Schema versioning and updates
- **Sample Data**: Pre-populated demo data for new businesses

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Navigation and layout components
│   └── UI/             # Base UI components (Button, Card, Badge)
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── BusinessContext.tsx # Business data management
├── lib/                # Core utilities and services
│   ├── database.ts     # Database service layer
│   └── supabase.ts     # Supabase client configuration
├── pages/              # Application pages/routes
│   ├── LandingPage.tsx # Marketing landing page
│   ├── OnboardingPage.tsx # User registration and setup
│   ├── DashboardPage.tsx # Main business dashboard
│   ├── SalesPage.tsx   # Sales management
│   ├── ExpensesPage.tsx # Expense tracking
│   ├── InventoryPage.tsx # Product and stock management
│   ├── ReportsPage.tsx # Financial reports and analytics
│   └── SettingsPage.tsx # User and business settings
└── App.tsx             # Main application component
```

## 🎨 Design System

LedgerLoom uses a comprehensive design system built with Tailwind CSS:

### Color Palette
- **Primary**: Emerald green (#10b981) - Growth and prosperity
- **Secondary**: Blue (#3b82f6) - Trust and reliability  
- **Accent**: Orange (#f97316) - Energy and creativity
- **Success**: Green (#22c55e) - Positive outcomes
- **Warning**: Amber (#f59e0b) - Attention needed
- **Error**: Red (#ef4444) - Issues and alerts

### Typography
- **Font Family**: Inter - Clean, modern, and highly readable
- **Font Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Line Heights**: 150% for body text, 120% for headings

### Spacing System
- **Base Unit**: 8px grid system for consistent spacing
- **Component Padding**: Small (16px), Medium (24px), Large (32px)

## 🔧 Technology Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with excellent IDE support
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Framer Motion**: Smooth animations and micro-interactions
- **Recharts**: Beautiful, responsive charts and data visualizations
- **Lucide React**: Consistent, beautiful icons

### Backend & Database
- **Supabase**: PostgreSQL database with real-time capabilities
- **Row Level Security**: Built-in data security and user isolation
- **Real-time Subscriptions**: Live data updates across clients

### Development Tools
- **Vite**: Fast build tool and development server
- **ESLint**: Code linting and quality enforcement
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing and optimization

## 📱 Features by Page

### 🏠 Dashboard
- Financial summary cards with key metrics
- Profit Pulse chart showing revenue vs expenses
- Product Performance analytics
- Recent activity feed
- Low stock alerts and quick stats

### 💰 Sales Management
- Quick sale entry with product selection
- Multiple payment method support (Cash, Card, Transfer)
- Sales history with search and filtering
- Daily and total sales summaries

### 💸 Expense Tracking
- Categorized expense entry
- Expense breakdown by category
- Vendor/supplier tracking
- Monthly and total expense summaries

### 📦 Inventory Management
- Product catalog with full CRUD operations
- Stock level tracking with low-stock alerts
- Cost price and selling price management
- Profit margin calculations
- SKU and category organization

### 📊 Reports & Analytics
- Profit & Loss statements
- Expense breakdown charts
- Key Performance Indicators (KPIs)
- Product performance analysis
- Exportable financial reports

### ⚙️ Settings
- Business profile management
- Theme and appearance customization
- Notification preferences
- Security settings
- Billing and subscription management

## 🔐 Security Features

- **Authentication**: Secure email/password authentication via Supabase
- **Authorization**: Row Level Security ensures users only access their data
- **Data Encryption**: All data encrypted in transit and at rest
- **Session Management**: Secure session handling with automatic refresh
- **Input Validation**: Comprehensive client and server-side validation

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Environment Variables for Production
Ensure these environment variables are set in your production environment:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🤝 Contributing

We welcome contributions to LedgerLoom! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow the coding standards** established in the project
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description

### Development Workflow
1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and commit: `git commit -m 'Add amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our comprehensive guides and API documentation
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join our community discussions
- **Email**: Contact our support team for enterprise inquiries

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] User authentication and onboarding
- [x] Basic sales, expense, and inventory management
- [x] Financial dashboard with key metrics
- [x] Responsive design and mobile optimization

### Phase 2: Enhanced Analytics (In Progress)
- [ ] Advanced financial calculations and reporting
- [ ] Predictive analytics and forecasting
- [ ] Custom report builder
- [ ] Multi-period comparisons

### Phase 3: Integrations
- [ ] Payment gateway integrations (Paystack, Flutterwave)
- [ ] POS system connections
- [ ] Bank feed integrations
- [ ] Accounting software exports

### Phase 4: Advanced Features
- [ ] Multi-user collaboration
- [ ] Multi-location support
- [ ] API access for developers
- [ ] Advanced inventory management (FIFO, batch tracking)

## 🙏 Acknowledgments

- **Design Inspiration**: Apple's design principles and attention to detail
- **Icons**: Lucide React for beautiful, consistent iconography
- **Charts**: Recharts for responsive data visualizations
- **Backend**: Supabase for providing an excellent backend-as-a-service platform

---

**LedgerLoom** - Making financial management engaging and insightful for small retail businesses.

*Built with ❤️ for retail entrepreneurs who deserve better tools.*