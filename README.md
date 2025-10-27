# 🛍️ TechMart Haiti - E-Commerce Platform

A full-featured e-commerce platform with admin dashboard, built with React, Tailwind CSS, and **Supabase**. The interface is in **Haitian Creole** for local accessibility.

## ✨ Features

### 🛒 Client Store
- **Product Catalog** with search and category filtering
- **Shopping Cart** with quantity management
- **Wishlist** functionality
- **Flash Sale** banner with countdown
- **Price Range Filters**
- **Grid/List View** toggle
- **Responsive Design**
- Real-time cart updates

### 👨‍💼 Admin Dashboard
- **Dashboard Overview**
  - Revenue, orders, products, and customer statistics
  - Sales by category charts
  - Recent orders list
  - Real-time updates

- **Product Management**
  - View all products in a table
  - Stock level indicators
  - Sales tracking
  - Edit/Delete functionality (UI ready)

- **Order Management**
  - Order status tracking (Pending, Processing, Shipped, Delivered)
  - Customer information
  - Order value and items count
  - Status badges with color coding

- **Customer Management**
  - Customer profiles
  - Order history
  - Total spending tracking
  - Registration dates

- **Coupon Management**
  - Percentage and fixed discount coupons
  - Active/Inactive status
  - Usage tracking
  - Beautiful coupon cards

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure Supabase:**
   - The app is already connected to a Supabase project
   - Database schema and sample data are pre-configured
   - Configuration is in `src/lib/supabase.js`
   
   **To use your own Supabase project:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Update the credentials in `src/lib/supabase.js`:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   ```
   - Run the migrations found in the Supabase dashboard or use the MCP tools

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - The app will automatically open in your default browser
   - Data loads from Supabase in real-time

### Build for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🎨 Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service (PostgreSQL database, authentication, real-time subscriptions)
- **Lucide React** - Beautiful icon library
- **ESLint** - Code linting

## 🗄️ Database Schema

The Supabase PostgreSQL database includes the following tables:

### Products
- Product catalog with pricing, categories, ratings, stock levels
- Discount support
- Sales tracking

### Orders
- Order management with multiple statuses (pending, processing, shipped, delivered)
- Customer relationships
- Order totals and item counts

### Customers
- Customer profiles
- Order history tracking
- Total spending analytics

### Coupons
- Percentage and fixed discount coupons
- Active/inactive status
- Usage tracking

All tables include Row Level Security (RLS) policies for data protection.

## 📱 Usage

### Client View
1. Browse products by category
2. Search for specific items
3. Add products to cart or wishlist
4. Adjust quantities in the cart
5. View cart total with discounts applied
6. Click **Admin** button to switch to admin panel

### Admin View
1. View dashboard statistics
2. Navigate between different sections using the sidebar
3. Manage products, orders, customers, and coupons
4. Click **Retounen nan Store** to return to the client store

## 🌐 Language

The interface uses **Haitian Creole** (Kreyòl Ayisyen) for:
- Button labels
- Navigation items
- Product information
- Status messages
- Form labels

## 📊 Database & Sample Data

The Supabase database is pre-populated with sample data:
- **6 products** across Electronics, Fashion, and Shoes categories
- **4 orders** with various statuses (delivered, processing, shipped, pending)
- **3 customers** with purchase history
- **3 discount coupons** (percentage and fixed discounts)

All data is stored in Supabase and fetched in real-time using custom React hooks.

## 🎯 Future Enhancements

- ✅ ~~Backend integration~~ (Supabase connected!)
- User authentication with Supabase Auth
- Real-time updates with Supabase Realtime
- Payment gateway integration (Stripe/PayPal)
- Advanced analytics dashboard
- Email notifications
- Multi-currency support
- Product image uploads to Supabase Storage
- Order fulfillment workflow
- Customer reviews and ratings
- Product search optimization

## 🔧 Project Structure

```
ecom/
├── src/
│   ├── components/
│   │   └── EcommercePlatform.jsx  # Main app component
│   ├── hooks/
│   │   ├── useProducts.js         # Fetch products from Supabase
│   │   ├── useOrders.js          # Fetch orders from Supabase
│   │   ├── useCustomers.js       # Fetch customers from Supabase
│   │   └── useCoupons.js         # Fetch coupons from Supabase
│   ├── lib/
│   │   └── supabase.js           # Supabase client configuration
│   ├── types/
│   │   └── database.types.ts     # TypeScript types for database
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── README.md
```

## 🔐 Security

The application uses Supabase Row Level Security (RLS) policies:
- **Products**: Public read access, authenticated write access
- **Orders**: Authenticated access only
- **Customers**: Authenticated access only
- **Coupons**: Public read for active coupons, authenticated write access

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

---

Made with ❤️ for Haiti 🇭🇹

