import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Providers
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts & Route Guards
import RootLayout from './layouts/RootLayout';
import SellerLayout from './layouts/SellerLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// User Protected Pages
import ProfilePage from './pages/ProfilePage';
import MyGaragePage from './pages/MyGaragePage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import BecomeSellerPage from './pages/BecomeSellerPage';

// Seller Pages
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerAddEditProductPage from './pages/seller/SellerAddEditProductPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerInventoryPage from './pages/seller/SellerInventoryPage';
import SellerProfilePage from './pages/seller/SellerProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSellersPage from './pages/admin/AdminSellersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-black text-red-500 mb-2">404</h1>
      <h2 className="text-xl font-bold text-white mb-2">Wrong Turn / Pitstop Not Found</h2>
      <p className="text-xs text-slate-400 mb-6 max-w-sm">
        The automotive page or component you are looking for does not exist on this route.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/30"
      >
        Return to Track Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public & Customer Routes */}
                  <Route path="/" element={<RootLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="products/:slugOrId" element={<ProductDetailPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="contact" element={<ContactPage />} />

                    {/* Authenticated User Routes */}
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="my-garage"
                      element={
                        <ProtectedRoute>
                          <MyGaragePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="wishlist"
                      element={
                        <ProtectedRoute>
                          <WishlistPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="cart"
                      element={
                        <ProtectedRoute>
                          <CartPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="checkout"
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="orders/:id"
                      element={
                        <ProtectedRoute>
                          <OrderDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="become-seller"
                      element={
                        <ProtectedRoute>
                          <BecomeSellerPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 inside root layout */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Seller Dedicated Portal (Strict Role Protection) */}
                  <Route
                    path="/seller"
                    element={
                      <RoleRoute allowedRoles={['SELLER', 'ADMIN']}>
                        <SellerLayout />
                      </RoleRoute>
                    }
                  >
                    <Route index element={<SellerDashboardPage />} />
                    <Route path="products" element={<SellerProductsPage />} />
                    <Route path="products/new" element={<SellerAddEditProductPage />} />
                    <Route path="products/:id/edit" element={<SellerAddEditProductPage />} />
                    <Route path="orders" element={<SellerOrdersPage />} />
                    <Route path="inventory" element={<SellerInventoryPage />} />
                    <Route path="profile" element={<SellerProfilePage />} />
                  </Route>

                  {/* Admin Dedicated Control Center (Strict Admin Role Protection) */}
                  <Route
                    path="/admin"
                    element={
                      <RoleRoute allowedRoles={['ADMIN']}>
                        <AdminLayout />
                      </RoleRoute>
                    }
                  >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="sellers" element={<AdminSellersPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
