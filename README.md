# Sweet Shop Management System 🍭

A full-stack sweet shop management system built with modern web technologies following Test-Driven Development (TDD) practices.

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with DrizzleORM
- **Authentication**: Clerk + JWT
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Authentication**: Clerk React
- **Testing**: React Testing Library + Jest

## 📋 Features

### Authentication
- User registration and login via Clerk
- JWT-based API protection
- Role-based access (Admin/User)

### Sweet Management
- ✅ Add new sweets (Admin only)
- ✅ View all sweets
- ✅ Search sweets by name, category, or price range
- ✅ Update sweet details (Admin only)
- ✅ Delete sweets (Admin only)

### Inventory Management
- ✅ Purchase sweets (decrease quantity)
- ✅ Restock sweets (Admin only)
- ✅ Prevent purchases when quantity is 0
- ✅ Real-time quantity updates

## 🏗️ Project Structure

```
sweet_shop_pro/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   ├── tests/
│   └── package.json
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Environment Setup
1. Clone the repository:
```bash
git clone https://github.com/code-abbi/sweet_shop_sys.git
cd sweet_shop_sys
```

2. Setup Backend:
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database and Clerk credentials
npm run dev
```

3. Setup Frontend:
```bash
cd ../frontend
npm install
cp .env.example .env
# Update .env with your Clerk publishable key
npm start
```

### Database Setup
```bash
# Create PostgreSQL database
createdb sweet_shop_db

# Run migrations
cd backend
npm run db:migrate
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Frontend Tests
```bash
cd frontend
npm test              # Run all tests
npm run test:coverage # Run tests with coverage
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Sweets (Protected)
- `GET /api/sweets` - List all sweets
- `POST /api/sweets` - Add new sweet (Admin only)
- `GET /api/sweets/search` - Search sweets
- `PUT /api/sweets/:id` - Update sweet (Admin only)
- `DELETE /api/sweets/:id` - Delete sweet (Admin only)

### Inventory (Protected)
- `POST /api/sweets/:id/purchase` - Purchase sweet
- `POST /api/sweets/:id/restock` - Restock sweet (Admin only)

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repo to Render
2. Set environment variables
3. Deploy with automatic builds

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set environment variables
3. Deploy with automatic builds

## 🤖 My AI Usage

This project was developed with assistance from GitHub Copilot and other AI tools:

- **Code Generation**: AI helped generate boilerplate code, test structures, and component scaffolding
- **Problem Solving**: AI assisted in debugging complex TypeScript type issues and database queries
- **Best Practices**: AI provided guidance on implementing SOLID principles and clean architecture patterns
- **Testing**: AI helped create comprehensive test suites following TDD methodology
- **Documentation**: AI assisted in writing clear, professional documentation and comments

All AI-generated code was carefully reviewed, modified, and tested to ensure quality and correctness.

## 📈 Development Process

This project follows Test-Driven Development (TDD):
1. **Red**: Write failing tests first
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Clean up code while maintaining tests

Each commit represents a meaningful step in the TDD cycle.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Write tests for your feature
4. Implement the feature
5. Ensure all tests pass
6. Commit with meaningful messages
7. Push to your branch
8. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ following TDD principles and modern web development best practices.

Co-authored-by: GitHub Copilot <copilot@users.noreply.github.com>