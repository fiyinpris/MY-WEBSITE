import { createContext, useContext, useState, useEffect } from "react";
import { Trash2, Edit, Plus, Minus, ShoppingCart } from "lucide-react";

const CartContext = createContext();

export const CartSection = ({ children }) => {
  // ✅ Load saved cart items from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // ✅ Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  // Calculate total items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems, // ✅ Export total items count
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalItems } = useCart();
  const [couponCode, setCouponCode] = useState("");

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = subtotal * 0; // 15% discount
  const tax = 0;
  const shipping = 0;
  const total = subtotal - discount + tax + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Your cart is empty 🛒
          </h2>
          <p className="text-muted-foreground mb-6">
            Add some products to see them here.
          </p>
          <a href="/products" className="normal-button">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ✅ Cart Notification - Reduced top margin */}
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-6 rounded-lg flex items-center gap-2 sm:gap-3 mt-2">
          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          <p className="font-semibold text-sm sm:text-base">
            You have {totalItems} {totalItems === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 sm:mb-8">
          Cart
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-foreground font-semibold text-xs sm:text-base">
              1. Cart
            </span>
          </div>
          <div className="h-px flex-1 bg-border"></div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-muted-foreground text-xs sm:text-base">
              2. Checkout
            </span>
          </div>
          <div className="h-px flex-1 bg-border"></div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-muted-foreground text-xs sm:text-base">
              3. Payment
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-full sm:w-auto mx-auto sm:mx-0">
                    <img
                      src={item.image || item.img}
                      alt={item.name}
                      className="w-full h-48 sm:w-32 sm:h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description || item.desc || "Product description"}
                    </p>

                    <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                      <span>
                        Color:{" "}
                        <span className="font-medium text-foreground">
                          Default (Black)
                        </span>
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl font-bold text-foreground">
                        ₦{item.price.toLocaleString()}
                      </span>
                      {item.oldPrice && (
                        <span className="text-base sm:text-lg text-muted-foreground line-through">
                          ₦{item.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      aria-label="Delete item"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2
                        size={20}
                        className="text-muted-foreground hover:text-red-500"
                      />
                    </button>
                    <button
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      aria-label="Edit item"
                    >
                      <Edit size={20} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-foreground">
                  <span>Sub Total</span>
                  <span className="font-semibold">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-foreground">
                  <span>Discount</span>
                  <span className="font-semibold text-red-500">
                    -₦{discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-foreground">
                  <span>Tax</span>
                  <span className="font-semibold">₦{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-primary">Free</span>
                </div>
                <div className="border-t border-border pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors mb-4 sm:mb-6 text-sm sm:text-base">
                Proceed to Checkout
              </button>

              <p className="text-xs sm:text-sm text-center text-muted-foreground mb-4 sm:mb-6">
                Estimated Delivery by{" "}
                <span className="font-semibold text-foreground">
                  25 December, 2025
                </span>
              </p>

              {/* Coupon Code */}
              <div className="border-t border-border pt-4 sm:pt-6">
                <h3 className="font-semibold text-sm sm:text-base text-foreground mb-3">
                  Have a Referral code?
                </h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Referral Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="px-4 sm:px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors text-sm">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo wrapper with sample data
export default function App() {
  const sampleProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      description: "High-quality sound with noise cancellation",
      price: 45000,
      oldPrice: 60000,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      name: "Smart Watch Series 5",
      description: "Track your fitness and stay connected",
      price: 120000,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    },
  ];

  return (
    <CartSection>
      <CartDemo products={sampleProducts} />
    </CartSection>
  );
}

function CartDemo({ products }) {
  const { addToCart, cartItems } = useCart();

  return (
    <div>
      {cartItems.length === 0 && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
          <p className="text-sm text-gray-600 mb-3">Add sample items:</p>
          <div className="flex gap-2">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Add Item {product.id}
              </button>
            ))}
          </div>
        </div>
      )}
      <CartPage />
    </div>
  );
}
