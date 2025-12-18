import { createContext, useContext, useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Plus,
  Minus,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

const CartContext = createContext();
const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT – Abuja",
];

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "error"
      ? "bg-red-50 border-red-200"
      : "bg-green-50 border-green-200";
  const textColor = type === "error" ? "text-red-800" : "text-green-800";
  const Icon = type === "error" ? AlertCircle : CheckCircle;

  return (
    <div
      className={`fixed top-20 right-4 ${bgColor} border rounded-lg p-4 shadow-lg z-[9999] max-w-md`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${textColor} flex-shrink-0 mt-0.5`} />
        <p className={`${textColor} text-sm flex-1`}>{message}</p>
        <button onClick={onClose} className={`${textColor} hover:opacity-70`}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const CartSection = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Safe localStorage operations with error handling
  const safeGetFromStorage = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      showToast("Failed to load saved cart data", "error");
      return null;
    }
  };

  const safeSaveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
      if (error.name === "QuotaExceededError") {
        showToast("Storage limit reached. Please clear some items.", "error");
      } else {
        showToast("Failed to save cart data", "error");
      }
      return false;
    }
  };

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = safeGetFromStorage("cartItems");
    if (savedCart && Array.isArray(savedCart)) {
      setCartItems(savedCart);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage with error handling
  useEffect(() => {
    if (isInitialized) {
      safeSaveToStorage("cartItems", cartItems);
    }
  }, [cartItems, isInitialized]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const validateProduct = (product) => {
    if (!product || typeof product !== "object") {
      throw new Error("Invalid product data");
    }
    if (!product.id) {
      throw new Error("Product must have an ID");
    }
    if (typeof product.price !== "number" || product.price <= 0) {
      throw new Error("Product must have a valid price");
    }
    if (!product.name || typeof product.name !== "string") {
      throw new Error("Product must have a name");
    }
  };

  const addToCart = (product) => {
    try {
      validateProduct(product);

      setCartItems((prev) => {
        const existingItem = prev.find((item) => item.id === product.id);
        if (existingItem) {
          // Check stock limit (example: max 10 per item)
          if (existingItem.quantity >= 10) {
            showToast("Maximum quantity (10) reached for this item", "error");
            return prev;
          }
          showToast(` ${product.name} added to cart`, "success");
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        showToast(`${product.name} added to cart`, "success");
        return [...prev, { ...product, quantity: 1 }];
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast(error.message || "Failed to add item to cart", "error");
    }
  };

  const removeFromCart = (id) => {
    try {
      const item = cartItems.find((item) => item.id === id);
      if (!item) {
        throw new Error("Item not found in cart");
      }
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      showToast(`${item.name} removed from cart`, "success");
    } catch (error) {
      console.error("Error removing from cart:", error);
      showToast(error.message || "Failed to remove item", "error");
    }
  };

  const updateQuantity = (id, newQuantity) => {
    try {
      if (typeof newQuantity !== "number" || newQuantity < 1) {
        throw new Error("Quantity must be at least 1");
      }
      if (newQuantity > 10) {
        showToast("Maximum quantity is 10 per item", "error");
        return;
      }

      setCartItems((prev) => {
        const item = prev.find((item) => item.id === id);
        if (!item) {
          throw new Error("Item not found in cart");
        }
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      showToast(error.message || "Failed to update quantity", "error");
    }
  };

  const clearCart = () => {
    try {
      setCartItems([]);
      showToast("Cart cleared", "success");
    } catch (error) {
      console.error("Error clearing cart:", error);
      showToast("Failed to clear cart", "error");
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        showToast,
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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

// Checkout Page Component
const CheckoutPage = ({ onProceedToPayment, onBack }) => {
  const { cartItems, totalItems, showToast } = useCart();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    city: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.city.trim()) newErrors.city = "City is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onProceedToPayment(formData);
      }, 1000);
    } else {
      showToast("Please fill in all required fields correctly", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg flex items-center gap-2 sm:gap-3 mt-2">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
          <p className="font-semibold text-xs sm:text-sm md:text-base">
            You have {totalItems} {totalItems === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8">
          Checkout
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-12 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span
              className="text-muted-foreground text-xs sm:text-sm md:text-base cursor-pointer whitespace-nowrap"
              onClick={onBack}
            >
              1. Cart
            </span>
          </div>
          <div className="h-px flex-1 bg-border min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-foreground font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
              2. Checkout
            </span>
          </div>
          <div className="h-px flex-1 bg-border min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-muted-foreground text-xs sm:text-sm md:text-base whitespace-nowrap">
              3. Payment
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-none sm:rounded-xl p-4 sm:p-6 shadow-sm border-y sm:border border-border -mx-4 sm:mx-0"
            >
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Shipping Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select State</option>

                      {STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>

                    {errors.state && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2 text-sm sm:text-base cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.saveInfo || false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          saveInfo: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    Save this information for next time
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm sm:text-base"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {isSubmitting ? "Processing..." : "Proceed to Payment"}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-primary">Free</span>
                </div>
                <div className="border-t border-border pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Page Component
const PaymentPage = ({ shippingInfo, onBack }) => {
  const { cartItems, totalItems, clearCart, showToast } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePayment = () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      showToast("Payment successful! Order confirmed.", "success");
      clearCart();
      // Navigate to order confirmation
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg flex items-center gap-2 sm:gap-3 mt-2">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
          <p className="font-semibold text-xs sm:text-sm md:text-base">
            You have {totalItems} {totalItems === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8">
          Payment
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-12 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-muted-foreground text-xs sm:text-sm md:text-base whitespace-nowrap">
              1. Cart
            </span>
          </div>
          <div className="h-px flex-1 bg-border min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span
              className="text-muted-foreground text-xs sm:text-sm md:text-base cursor-pointer whitespace-nowrap"
              onClick={onBack}
            >
              2. Checkout
            </span>
          </div>
          <div className="h-px flex-1 bg-border min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-foreground font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
              3. Payment
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
                Shipping To
              </h2>
              <div className="text-xs sm:text-sm text-foreground space-y-1">
                <p className="font-semibold">{shippingInfo.fullName}</p>
                <p>{shippingInfo.address}</p>
                <p>
                  {shippingInfo.city}, {shippingInfo.state}{" "}
                </p>
                <p>{shippingInfo.phone}</p>
                <p>{shippingInfo.email}</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Payment Method
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <label className="flex items-center gap-3 p-3 sm:p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-foreground text-sm sm:text-base">
                    Credit/Debit Card
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 sm:p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-foreground text-sm sm:text-base">
                    Bank Transfer
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 sm:p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-foreground text-sm sm:text-base">
                    Mobile Wallet
                  </span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                <button
                  onClick={onBack}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm sm:text-base"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {isProcessing ? "Processing..." : "Complete Payment"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs sm:text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-foreground font-medium">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalItems, showToast } =
    useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [currentPage, setCurrentPage] = useState("cart"); // 'cart', 'checkout', 'payment'
  const [shippingInfo, setShippingInfo] = useState(null);

  const calculateTotals = () => {
    try {
      const subtotal = cartItems.reduce((sum, item) => {
        if (
          typeof item.price !== "number" ||
          typeof item.quantity !== "number"
        ) {
          throw new Error("Invalid item data in cart");
        }
        return sum + item.price * item.quantity;
      }, 0);
      const discount = subtotal * appliedDiscount;
      const tax = 0;
      const shipping = 0;
      const total = subtotal - discount + tax + shipping;

      return { subtotal, discount, tax, shipping, total };
    } catch (error) {
      console.error("Error calculating totals:", error);
      showToast("Error calculating cart total", "error");
      return { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 };
    }
  };

  const { subtotal, discount, tax, shipping, total } = calculateTotals();

  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true);

    setTimeout(() => {
      try {
        if (!couponCode.trim()) {
          throw new Error("Please enter a coupon code");
        }

        if (couponCode.toUpperCase() === "SAVE15") {
          setAppliedDiscount(0.15);
          showToast("Coupon applied! 15% discount added", "success");
          setCouponCode("");
        } else {
          throw new Error("Invalid coupon code");
        }
      } catch (error) {
        showToast(error.message, "error");
      } finally {
        setIsApplyingCoupon(false);
      }
    }, 800);
  };

  const handleProceedToCheckout = () => {
    try {
      if (cartItems.length === 0) {
        throw new Error("Your cart is empty");
      }
      if (total <= 0) {
        throw new Error("Invalid cart total");
      }

      cartItems.forEach((item) => {
        if (!item.id || !item.name || typeof item.price !== "number") {
          throw new Error("Invalid item data detected");
        }
      });

      setCurrentPage("checkout");
    } catch (error) {
      console.error("Checkout error:", error);
      showToast(error.message || "Cannot proceed to checkout", "error");
    }
  };

  const handleProceedToPayment = (formData) => {
    setShippingInfo(formData);
    setCurrentPage("payment");
  };

  if (currentPage === "checkout") {
    return (
      <CheckoutPage
        onProceedToPayment={handleProceedToPayment}
        onBack={() => setCurrentPage("cart")}
      />
    );
  }

  if (currentPage === "payment") {
    return (
      <PaymentPage
        shippingInfo={shippingInfo}
        onBack={() => setCurrentPage("checkout")}
      />
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 sm:pt-20">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Your cart is empty 🛒
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Add some products to see them here.
          </p>
          <a
            href="/products"
            className="normal-button inline-block px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg flex items-center gap-2 sm:gap-3 mt-2">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
          <p className="font-semibold text-xs sm:text-sm md:text-base">
            You have {totalItems} {totalItems === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8">
          Cart
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-12 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-foreground font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
              1. Cart
            </span>
          </div>
          <div className="h-px flex-1 bg-border min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-muted-foreground text-xs sm:text-sm md:text-base whitespace-nowrap">
              2. Checkout
            </span>
          </div>
          <div className="h-px flex-1 bg-border min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-muted-foreground text-xs sm:text-sm md:text-base whitespace-nowrap">
              3. Payment
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-full sm:w-auto mx-auto sm:mx-0">
                    <img
                      src={item.image || item.img}
                      alt={item.name}
                      className="w-full h-48 sm:w-32 sm:h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                  </div>

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

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity >= 10}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
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
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm sm:text-base text-foreground">
                    <span>Discount</span>
                    <span className="font-semibold text-red-500">
                      -₦{discount.toLocaleString()}
                    </span>
                  </div>
                )}
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

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors mb-4 sm:mb-6 text-sm sm:text-base"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs sm:text-sm text-center text-muted-foreground mb-4 sm:mb-6">
                Estimated Delivery by{" "}
                <span className="font-semibold text-foreground">
                  25 December, 2025
                </span>
              </p>

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
                    onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-4 sm:px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingCoupon ? "Applying..." : "Apply"}
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
