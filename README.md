# 🍭 Sweet Shop Pro - Indian Sweet Shop

A beautiful, full-stack Indian sweet shop e-commerce application with Google OAuth authentication, real-time inventory management, and comprehensive cart functionality.

## ✨ Live Features

### 🔐 Authentication
- **Google OAuth Integration**: Authentic Google account selection page
- **Mock Authentication System**: Multiple test accounts for development
- **Role-based Access**: Admin detection for `wildrabit001@gmail.com`
- **Clean UI**: Simple sign-out button without username display

### 🛒 Shopping Experience
- **Single-Page Application**: Browse and shop all in one place
- **Add to Cart**: Requires authentication - redirects to sign-in
- **Cart Quantity Control**: +/- buttons to adjust quantities
- **Stock Validation**: Cannot add more than available stock
- **Persistent Cart**: Saves cart items using localStorage

### 🏪 Indian Sweets Catalog
- **10 Authentic Sweets**: Gulab Jamun, Rasgulla, Jalebi, and more
- **Real Images**: High-quality photos from Unsplash
- **Indian Pricing**: Prices in Indian Rupees (₹)
- **Categories**: Syrup-based, Milk-based, Fried, Dry Fruits, Bengali

### 📦 Inventory Management
- **Real-time Stock Updates**: Stock decreases when added to cart
- **Stock Returns**: Stock increases when removed from cart  
- **Admin Controls**: Stock management for admin users
- **Database Persistence**: All changes saved to PostgreSQL

### 💳 Checkout Process
- **Comprehensive Form**: Billing information and card details
- **Input Validation**: Required fields with error messages
- **Card Formatting**: Auto-format card numbers and dates
- **Payment Processing**: Complete form validation before payment

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints with public stock updates
- **Seeding**: Pre-populated with 10 Indian sweets

### Frontend  
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for modern UI
- **State Management**: React Context + useState
- **Authentication**: Mock Google OAuth system
- **Storage**: localStorage for cart persistence

## 🏗️ Project Structure

```
sweet_shop_pro/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── controllers/        # API controllers
│   │   │   └── sweetsController.ts
│   │   ├── routes/            # API routes  
│   │   │   └── sweets.ts
│   │   ├── utils/             # Database utilities
│   │   │   └── sweetService.ts
│   │   ├── db/                # Database setup
│   │   └── index.ts           # Server entry point
│   ├── scripts/               # Database seeding
│   │   └── seed.ts           # Indian sweets data
│   └── package.json
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── SweetShopApp.tsx    # Main app
│   │   │   └── GoogleOAuthPage.tsx # OAuth page
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx     # Authentication
│   │   ├── types/             # TypeScript types
│   │   └── index.tsx          # App entry point
│   └── package.json
└── README.md
```

## 🛠️ Quick Setup

### Prerequisites
- Node.js (v18 or higher)  
- PostgreSQL
- npm

### Installation
1. **Clone the repository**:
```bash
git clone https://github.com/code-abbi/sweet_shop_sys.git
cd sweet_shop_pro
```

2. **Backend Setup**:
```bash
cd backend
npm install

# Create .env file with your database URL
echo "DATABASE_URL=postgresql://username:password@localhost:5432/sweet_shop_db" > .env

# Seed the database with Indian sweets
npm run seed

# Start the server
npm run dev
```

3. **Frontend Setup**:
```bash
cd ../frontend  
npm install

# Start the React app
npm start
```

### 🌐 Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001  
- **Health Check**: http://localhost:3001/health

### 👤 Test Accounts
- **Admin**: `wildrabit001@gmail.com` (has admin privileges)
- **Regular Users**: Any other email address

## 📱 API Endpoints

### Sweets Management
- `GET /api/sweets` - Get all Indian sweets
- `GET /api/sweets/:id` - Get specific sweet details  
- `PUT /api/sweets/:id/stock` - Update sweet stock (public)
- `PUT /api/sweets/:id` - Update sweet details (admin only)
- `POST /api/sweets` - Add new sweet (admin only)
- `DELETE /api/sweets/:id` - Remove sweet (admin only)

### Health Check
- `GET /health` - Server health status

### 🏠 Main Shop Page
- Beautiful grid layout of Indian sweets
- High-quality food photography
- Indian rupee pricing
- Stock quantity display

### 🔐 Google OAuth Page  
- Authentic Google account selection interface
- Multiple account options with avatars
- "Signed out" status indicators
- "Use another account" option

### 🛒 Shopping Cart
- Quantity controls with +/- buttons  
- Real-time total calculations
- Stock validation messaging
- Persistent cart across sessions

### 💳 Checkout Form
- Comprehensive billing information
- Card details with auto-formatting
- Real-time input validation
- Professional payment interface

## 🚀 Technical Highlights

### Frontend Architecture
- **Single-Page Application**: All functionality in one component
- **Context-based State**: React Context for authentication
- **Persistent Storage**: localStorage for cart data
- **Real-time Updates**: Immediate UI feedback for all actions

### Backend Architecture  
- **RESTful API**: Clean endpoint design
- **Public Stock API**: Allows cart stock management
- **Database Seeding**: Pre-populated Indian sweets data
- **Error Handling**: Comprehensive error responses

### Database Design
- **Sweet Entity**: Complete sweet information with images
- **Stock Management**: Real-time quantity tracking  
- **UUID Primary Keys**: Unique identifiers for all records

## 🤖 AI Development Approach

This project was built entirely with AI assistance following an iterative development process:

1. **Requirements Gathering**: Understanding e-commerce needs
2. **Architecture Design**: Full-stack application structure  
3. **Backend Development**: API creation and database setup
4. **Frontend Development**: React components and UI/UX
5. **Integration**: Connecting frontend to backend APIs
6. **Feature Enhancement**: Adding Google OAuth and cart functionality
7. **Polish & Refinement**: UI improvements and bug fixes

### AI Benefits Demonstrated:
- **Rapid Prototyping**: Quick feature implementation
- **Code Quality**: Clean, maintainable code structure
- **Problem Solving**: Creative solutions to technical challenges
- **User Experience**: Intuitive interface design

## 🔮 Future Enhancements

- **Real Google OAuth**: Replace mock authentication with actual Google Identity Services
- **Payment Integration**: Add Stripe/Razorpay for real payments
- **Order History**: Track user purchase history
- **Sweet Reviews**: User ratings and reviews system
- **Mobile App**: React Native version
- **Admin Dashboard**: Comprehensive admin management panel

---

**Built using AI-powered development**  
*Demonstrating the future of collaborative human-AI software creation* 