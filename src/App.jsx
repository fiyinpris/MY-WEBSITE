import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { ShopSection } from "./components/ShopSection";
import { ContactSection } from "./components/ContactSection";
import { CartSection, CartPage } from "./components/CartSection";
import { NavBar } from "./components/NavBar";
import { ThemeToggle } from "./components/ThemeToggle";
import { SigninSection } from "./components/SigninSection";
import { ProductSection } from "./components/ProductSection";
import { WishlistSection, WishlistPage } from "./components/WishlistSection";
import { SearchSection } from "./components/SearchSection";
import { SearchProvider } from "./components/SearchContext";
import { Footer } from "./components/Footer";
import GoogleCallback from "./components/GoogleCallback";
import { ProductManager } from "./components/ProductManager";
import { ProductDetail } from "./components/ProductDetail";

// ✅ ADMIN EMAIL - Only this email can access admin panel
const ADMIN_EMAIL = "fiyinolaleke@gmail.com";

/**
 * Protected Admin Route Component
 * Only allows access to fiyinolaleke@gmail.com
 */
const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Check for admin session
        let adminSession = null;

        if (typeof window !== "undefined" && window.storage) {
          const result = await window.storage.get("admin-session");
          if (result && result.value) {
            adminSession = JSON.parse(result.value);
          }
        } else {
          const stored = localStorage.getItem("admin-session");
          if (stored) {
            adminSession = JSON.parse(stored);
          }
        }

        // Verify admin session
        if (
          adminSession &&
          adminSession.email === ADMIN_EMAIL &&
          adminSession.expiry > Date.now()
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // ✅ Redirect non-admin users to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [formData, setFormData] = React.useState({ email: "" });

  return (
    <SearchProvider>
      <CartSection>
        <WishlistSection>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <ThemeToggle />
              <NavBar />

              <main className="flex-1 pt-[1rem]">
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="/shop" element={<ShopSection />} />
                  <Route path="/contact" element={<ContactSection />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/products" element={<ProductSection />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/signin" element={<SigninSection />} />
                  <Route path="/search" element={<SearchSection />} />
                  <Route path="/auth/callback" element={<GoogleCallback />} />

                  {/* ✅ PROTECTED ADMIN ROUTE */}
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedAdminRoute>
                        <ProductManager />
                      </ProtectedAdminRoute>
                    }
                  />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer formData={formData} setFormData={setFormData} />
            </div>
          </BrowserRouter>
        </WishlistSection>
      </CartSection>
    </SearchProvider>
  );
}

export default App;
