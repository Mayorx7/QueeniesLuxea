import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { ToastProvider } from "./context/ToastContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import LookbookPage from "./pages/LookbookPage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import ShippingPage from "./pages/ShippingPage";
import ReturnsPage from "./pages/ReturnsPage";
import CollectionsPage from "./pages/CollectionsPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AddressesPage from "./pages/AddressesPage";
import NotFoundPage from "./pages/NotFoundPage";

// Customer Dashboard
import CustomerDashboardLayout from "./layouts/CustomerDashboardLayout";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

// Admin Dashboard
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

// Vendor Dashboard
import VendorDashboardLayout from "./layouts/VendorDashboardLayout";
import VendorOverview from "./pages/vendor/VendorOverview";
import VendorProductsPage from "./pages/vendor/VendorProductsPage";
import VendorAddProductPage from "./pages/vendor/VendorAddProductPage";
import VendorOrdersPage from "./pages/vendor/VendorOrdersPage";
import VendorCustomersPage from "./pages/vendor/VendorCustomersPage";
import VendorInventoryPage from "./pages/vendor/VendorInventoryPage";
import VendorAnalyticsPage from "./pages/vendor/VendorAnalyticsPage";
import VendorEarningsPage from "./pages/vendor/VendorEarningsPage";
import VendorSettingsPage from "./pages/vendor/VendorSettingsPage";
import VendorProfilePage from "./pages/vendor/VendorProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Main Application Layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:category" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/lookbook" element={<LookbookPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />
                
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Customer Dashboard Layout */}
              <Route path="/account" element={<CustomerDashboardLayout />}>
                <Route index element={<CustomerDashboard />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:orderId" element={<OrderDetailPage />} />
                <Route path="addresses" element={<AddressesPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Dashboard Layout */}
              <Route path="/admin" element={<AdminDashboardLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="orders/:orderId" element={<AdminOrderDetail />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Vendor Dashboard Layout */}
              <Route path="/vendor" element={<VendorDashboardLayout />}>
                <Route index element={<VendorOverview />} />
                <Route path="products" element={<VendorProductsPage />} />
                <Route path="products/add" element={<VendorAddProductPage />} />
                <Route path="orders" element={<VendorOrdersPage />} />
                <Route path="customers" element={<VendorCustomersPage />} />
                <Route path="inventory" element={<VendorInventoryPage />} />
                <Route path="analytics" element={<VendorAnalyticsPage />} />
                <Route path="earnings" element={<VendorEarningsPage />} />
                <Route path="settings" element={<VendorSettingsPage />} />
                <Route path="profile" element={<VendorProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
