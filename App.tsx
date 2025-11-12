import React, { ReactNode } from 'react';
import { HashRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ChatbotWidget } from './components/ChatbotWidget';
import { PopupModal } from './components/PopupModal';
import { NotificationContainer } from './components/Notification';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { WishlistPage } from './pages/WishlistPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { PaymentVerificationPage } from './pages/PaymentVerificationPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminImportPage } from './pages/admin/AdminImportPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminFulfillmentPage } from './pages/admin/AdminFulfillmentPage';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { UserProtectedRoute } from './components/UserProtectedRoute';
import { useEffect } from 'react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainLayout: React.FC<{ children?: ReactNode }> = ({ children }) => (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
            {children || <Outlet />}
        </main>
        <Footer />
        <WhatsAppButton />
        <ChatbotWidget />
        <PopupModal />
        <NotificationContainer />
    </div>
);

const App: React.FC = () => {
    return (
        <AppProvider>
            <HashRouter>
                <ScrollToTop />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="shop" element={<ShopPage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="contact" element={<ContactPage />} />
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="product/:id" element={<ProductDetailPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />
                        <Route path="forgot-password" element={<ForgotPasswordPage />} />
                        
                        {/* Protected User Routes */}
                        <Route element={<UserProtectedRoute />}>
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="wishlist" element={<WishlistPage />} />
                            <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                            <Route path="payment-verification" element={<PaymentVerificationPage />} />
                            <Route path="notifications" element={<NotificationsPage />} />
                        </Route>
                    </Route>

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<AdminProtectedRoute />}>
                        <Route element={<AdminLayout />}>
                           <Route index element={<AdminDashboardPage />} />
                           <Route path="new" element={<AdminProductFormPage />} />
                           <Route path="edit/:id" element={<AdminProductFormPage />} />
                           <Route path="import" element={<AdminImportPage />} />
                           <Route path="users" element={<AdminUsersPage />} />
                           <Route path="orders" element={<AdminOrdersPage />} />
                           <Route path="fulfillment" element={<AdminFulfillmentPage />} />
                           <Route path="reviews" element={<AdminReviewsPage />} />
                           <Route path="settings" element={<AdminSettingsPage />} />
                           <Route path="coupons" element={<AdminCouponsPage />} />
                        </Route>
                    </Route>
                </Routes>
            </HashRouter>
        </AppProvider>
    );
};

export default App;
