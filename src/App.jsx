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
import { Footer } from "./components/Footer"; // ✅ Import Footer

function App() {
  // You need state for the newsletter form
  const [formData, setFormData] = React.useState({ email: "" });

  return (
    <CartSection>
      <WishlistSection>
        <BrowserRouter>
          {/* Use flex-col so footer stays at bottom */}
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
              </Routes>
            </main>

            {/* Footer always at bottom */}
            <Footer formData={formData} setFormData={setFormData} />
          </div>
        </BrowserRouter>
      </WishlistSection>
    </CartSection>
  );
}

export default App;
