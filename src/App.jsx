import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { MotionConfig, motion } from "framer-motion";
import { Home } from "./pages/Home";
import { ShopSection } from "./components/ShopSection";
import { ContactSection } from "./components/ContactSection";
import { CartSection, CartPage } from "./components/CartSection";
import { NavBar } from "./components/NavBar";
import { SigninSection } from "./components/SigninSection";
import { ProductSection } from "./components/ProductSection";
import { WishlistSection, WishlistPage } from "./components/WishlistSection";
import { SearchSection } from "./components/SearchSection";
import { SearchProvider } from "./components/SearchContext";
import { Footer } from "./components/Footer";
import GoogleCallback from "./components/GoogleCallback";
import { ProductManager } from "./components/ProductManager";
import { ProductDetail } from "./components/ProductDetail";
import { ThemeProvider } from "./lib/theme";
import { ScrollProgress, FloatingActions } from "./components/ui/FloatingActions";

/** Scroll to the top on route change, or to the #hash target if present. */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
};

/** Soft fade/rise when moving between pages. */
const PageTransition = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <SearchProvider>
          <CartSection>
            <WishlistSection>
              <BrowserRouter>
                <ScrollManager />
                <div className="flex min-h-screen flex-col">
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10001] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
                  >
                    Skip to content
                  </a>
                  <ScrollProgress />
                  <NavBar />

                  <main id="main-content" className="flex-1 pt-[var(--nav-height)]">
                    <PageTransition>
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

                      {/* ✅ ADMIN ROUTE - ProductManager handles its own authentication */}
                      <Route path="/admin/products" element={<ProductManager />} />

                      {/* Catch-all redirect */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    </PageTransition>
                  </main>

                  <Footer />
                  <FloatingActions />
                </div>
              </BrowserRouter>
            </WishlistSection>
          </CartSection>
        </SearchProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
