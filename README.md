# 🍭 Sweet Nirvana - Indian Sweet Shop

A beautiful, full-stack Indian sweet shop e-commerce application with Google OAuth authentication, real-time inventory management, and comprehensive cart functionality.

## ✨ Live Features

### 🔐 Authentication
- **Google OAuth Integration**: Authentic Google account selection page
- **Mock Authentication System**: Multiple test accounts for development
- **Role-based Access**: Admin detection for `admin-email`
- **Clean UI**: Simple sign-out button without username display

### 🛒 Shopping Experience
- **Single-Page Application**: Browse and shop all in one place
- **Add to Cart**: Requires authentication - redirects to sign-in
- **Cart Quantity Control**: +/- buttons to adjust quantities
- **Stock Validation**: Cannot add more than available stock
- **Persistent Cart**: Saves cart items using localStorage

### 🏪 Indian Sweets Catalog
- **10 Authentic Sweets**: Gulab Jamun, Rasgulla, Jalebi, and more
- **Local Image Serving**: High-quality sweet images served locally
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

## � Screenshots

### 🏠 Main Application Interface
<div align="center">
  <img src="./screenshot/home.png" alt="Sweet Nirvana Main Shop Interface" width="800"/>
  <p><em>Beautiful Indian sweet shop with authentic products and modern e-commerce features</em></p>
</div>

### 🔐 Google Authentication
<div align="center">
  <img src="./screenshot/google_auth.png" alt="Google OAuth Login Flow" width="600"/>
  <p><em>Seamless Google OAuth integration with authentic account selection</em></p>
</div>

### 🛒 Shopping Experience
| Shopping Cart | Sweet Details View |
|---------------|-------------------|
| <img src="./screenshot/cart.png" alt="Shopping Cart" width="400"/> | <img src="./screenshot/sweet_view.png" alt="Individual Sweet Details" width="400"/> |

### 💳 Checkout Process
<div align="center">
  <img src="./screenshot/checkout.png" alt="Checkout Form" width="700"/>
  <p><em>Comprehensive checkout form with billing details and payment processing</em></p>
</div>

### 🍬 Admin Features
| Add New Sweet | Inventory Management |
|---------------|---------------------|
| <img src="./screenshot/add_sweet.png" alt="Add Sweet Interface" width="400"/> | <img src="./screenshot/inventory_update.png" alt="Stock Updates" width="400"/> |

## �🚀 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints with CORS support
- **Static Files**: Local image serving with proper headers
- **Seeding**: Pre-populated with 10 Indian sweets

### Frontend  
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for modern UI
- **State Management**: React Context + useState
- **Authentication**: Mock Google OAuth system
- **Storage**: localStorage for cart persistence
- **Icons**: Heroicons for consistent UI

## 🏗️ Project Structure

```
sweet_shop_pro/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── controllers/        # API controllers
│   │   │   └── sweetsController.ts
│   │   ├── routes/            # API routes  
│   │   │   └── sweets.ts
│   │   ├── models/            # Database models
│   │   │   ├── db.ts          # Database connection
│   │   │   └── schema.ts      # Drizzle schema
│   │   └── index.ts           # Server entry point
│   ├── scripts/               # Database utilities
│   │   └── seed.ts           # Indian sweets seeding
│   ├── sweet-images/          # Local sweet images
│   │   ├── gulab_jamun.jpeg
│   │   ├── rasgulla.jpeg
│   │   └── ... (10 total)
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
git clone https://github.com/code-abbi/Sweet_Nirwana.git
cd sweet_nirwana
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
- **Sweet Images**: http://localhost:3001/images/[filename].jpeg

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

### Static Assets
- `GET /images/:filename` - Serve sweet images with CORS headers

### Health Check
- `GET /health` - Server health status

## 🎨 User Interface

### 🏠 Main Shop Page
- Beautiful grid layout of Indian sweets
- High-quality local sweet photography
- Indian rupee pricing
- Stock quantity display
- Real-time cart updates

### 🔐 Google OAuth Page  
- Authentic Google account selection interface
- Multiple account options with avatars
- "Signed out" status indicators
- "Use another account" option

### 🛒 Shopping Cart
- Dropdown cart interface
- Quantity controls with +/- buttons  
- Real-time total calculations
- Stock validation messaging
- Persistent cart across sessions

### 💳 Checkout Form
- Comprehensive billing information
- Card details with auto-formatting
- Real-time input validation
- Professional payment interface
- Smooth scrolling to checkout section

## 🚀 Technical Highlights

### Frontend Architecture
- **Single-Page Application**: All functionality in one component
- **Context-based State**: React Context for authentication
- **Persistent Storage**: localStorage for cart data
- **Real-time Updates**: Immediate UI feedback for all actions
- **Image Optimization**: Local image serving with error handling

### Backend Architecture  
- **RESTful API**: Clean endpoint design
- **CORS Configuration**: Proper cross-origin request handling
- **Static File Serving**: Local image serving with security headers
- **Database Seeding**: Pre-populated Indian sweets data
- **Error Handling**: Comprehensive error responses

### Database Design
- **Sweet Entity**: Complete sweet information with local image paths
- **Stock Management**: Real-time quantity tracking  
- **UUID Primary Keys**: Unique identifiers for all records

### Security Features
- **CORS Headers**: Proper cross-origin resource sharing
- **Content Security Policy**: Browser security configuration
- **Input Validation**: Frontend and backend validation
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM

## 🔧 Development Features

### Image Management
- **Local Storage**: Sweet images stored in `backend/sweet-images/`
- **CORS Support**: Images accessible from frontend with proper headers
- **Error Handling**: Graceful fallback for missing images
- **Optimization**: JPEG format for optimal loading

### Cart Functionality
- **Stock Validation**: Cannot exceed available inventory
- **Quantity Limits**: Smart quantity controls
- **Cart Persistence**: Survives browser refresh
- **Real-time Updates**: Instant UI feedback

### Admin Features
- **Stock Management**: Direct inventory control
- **Add New Sweets**: Create new products
- **Real-time Updates**: Immediate database synchronization

## 🤖 AI Development Approach

This project was built entirely with AI assistance following an iterative development process:

1. **Requirements Gathering**: Understanding e-commerce needs
2. **Architecture Design**: Full-stack application structure  
3. **Backend Development**: API creation and database setup
4. **Frontend Development**: React components and UI/UX
5. **Integration**: Connecting frontend to backend APIs
6. **Image Infrastructure**: Local image serving setup
7. **CORS Resolution**: Cross-origin request configuration
8. **Feature Enhancement**: Adding Google OAuth and cart functionality
9. **Code Cleanup**: Removing unnecessary files and optimizing code
10. **Polish & Refinement**: UI improvements and bug fixes

### AI Benefits Demonstrated:
- **Rapid Prototyping**: Quick feature implementation
- **Code Quality**: Clean, maintainable code structure
- **Problem Solving**: Creative solutions to technical challenges
- **User Experience**: Intuitive interface design
- **Debug Assistance**: Quick issue identification and resolution

## 🔮 Future Enhancements

- **Real Google OAuth**: Replace mock authentication with actual Google Identity Services
- **Payment Integration**: Add Stripe/Razorpay for real payments
- **Order History**: Track user purchase history
- **Sweet Reviews**: User ratings and reviews system
- **Mobile App**: React Native version
- **Admin Dashboard**: Comprehensive admin management panel
- **Image Upload**: Admin image management system
- **Search & Filter**: Advanced product discovery

---

**Built using AI-powered development**  
*Demonstrating the future of collaborative human-AI software creation*

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/code-abbi/sweet_shop_sys/issues).

## 📞 Support

If you have any questions or need help with setup, please open an issue on GitHub.

---

*Sweet Shop - Where tradition meets technology! 🍮*