import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import { SearchProvider } from "./components/SearchContext"; // ✅ Changed path
import { Footer } from "./components/Footer";
import GoogleCallback from "./components/GoogleCallback";

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
                  <Route path="/signin" element={<SigninSection />} />
                  <Route path="/search" element={<SearchSection />} />
                  <Route path="/auth/callback" element={<GoogleCallback />} />
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
