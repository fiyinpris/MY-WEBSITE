import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  CreditCard,
  Building2,
  Smartphone,
  Banknote,
} from "lucide-react";

const CartContext = createContext();

// Paystack Configuration
const PAYSTACK_PUBLIC_KEY = "pk_test_efd6d18db02f5a001af1b1016bdc30622a381cf7";
const EMAILJS_PUBLIC_KEY = "Abc123XyZ_MyRealPublicKey456";
const EMAILJS_SERVICE_ID = "service_gmail_7d8f9a0";
const EMAILJS_TEMPLATE_ID = "template_order_confirmation_x1y2z3";

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

// ✅ PURCHASE TRACKING FUNCTION - Added for review eligibility
const trackPurchase = async (items, userEmail) => {
  try {
    let purchases = [];

    if (typeof window !== "undefined" && window.storage) {
      const result = await window.storage.get("user-purchases", false);
      if (result?.value) {
        purchases = JSON.parse(result.value);
      }
    } else {
      const stored = localStorage.getItem("user-purchases");
      if (stored) {
        purchases = JSON.parse(stored);
      }
    }

    // Add all purchased items
    items.forEach((item) => {
      purchases.push({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        date: new Date().toISOString(),
        email: userEmail,
      });
    });

    // Save purchases
    if (typeof window !== "undefined" && window.storage) {
      await window.storage.set(
        "user-purchases",
        JSON.stringify(purchases),
        false, // private to this user
      );
    } else {
      localStorage.setItem("user-purchases", JSON.stringify(purchases));
    }

    console.log(
      "✅ Purchases tracked successfully:",
      purchases.length,
      "items",
    );
    return true;
  } catch (error) {
    console.error("❌ Error tracking purchases:", error);
    throw error;
  }
};

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
      className={`fixed top-20 right-4 ${bgColor} border rounded-lg p-4 shadow-lg z-9999 max-w-md`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${textColor} shrink-0 mt-0.5`} />
        <p className={`${textColor} text-sm flex-1`}>{message}</p>
        <button onClick={onClose} className={`${textColor} hover:opacity-70`}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Full Screen Loading Overlay Component
const LoadingOverlay = () => {
  return (
    <>
      <div className="fixed inset-0 bg-white/20 dark:bg-gray-900/30 z-50 flex items-center justify-center">
        <div className="flex gap-3">
          <div
            className="w-4 h-4 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-4 h-4 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-4 h-4 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </>
  );
};

export const CartSection = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const safeGetFromStorage = useCallback((key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }, []);

  const safeSaveToStorage = useCallback((key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
      return false;
    }
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    const savedCart = safeGetFromStorage("cartItems");
    if (savedCart && Array.isArray(savedCart)) {
      setCartItems(savedCart);
    }
    setIsInitialized(true);
  }, [safeGetFromStorage]);

  useEffect(() => {
    if (isInitialized) {
      safeSaveToStorage("cartItems", cartItems);
    }
  }, [cartItems, isInitialized, safeSaveToStorage]);

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
          if (existingItem.quantity >= 10) {
            showToast("Maximum quantity (10) reached for this item", "error");
            return prev;
          }
          showToast(`${product.name} added to cart`, "success");
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
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
          item.id === id ? { ...item, quantity: newQuantity } : item,
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

// eslint-disable-next-line react-refresh/only-export-components
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
    country: "Nigeria",
    state: "",
    city: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
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
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

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
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg flex items-center gap-2 sm:gap-3 mt-2 shadow-sm">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" />
          <p className="font-semibold text-xs sm:text-sm md:text-base">
            You have {totalItems} {totalItems === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8">
          Checkout
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-12 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span
              className="text-foreground/60 dark:text-foreground/70 text-xs sm:text-sm md:text-base cursor-pointer whitespace-nowrap hover:text-foreground transition-colors"
              onClick={onBack}
            >
              1. Cart
            </span>
          </div>
          <div className="h-px flex-1 bg-border min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="text-foreground font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
              2. Checkout
            </span>
          </div>
          <div className="h-px flex-1 bg-border min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="text-foreground/60 dark:text-foreground/70 text-xs sm:text-sm md:text-base whitespace-nowrap">
              3. Payment
            </span>
          </div>
        </div>

        <div className="w-full px-0 sm:px-4 lg:px-0 grid lg:grid-cols-3 gap-0 lg:gap-8">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-xl p-4 sm:p-6 shadow-lg border border-border"
            >
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Shipping Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    style={{ fontSize: "16px" }}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      style={{ fontSize: "16px" }}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      style={{ fontSize: "16px" }}
                      placeholder="080XXXXXXXX"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    style={{ fontSize: "16px" }}
                    placeholder="Street address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      style={{ fontSize: "16px" }}
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.country && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-2">
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      style={{ fontSize: "16px" }}
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
                    <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-2">
                      City{" "}
                      <span className="text-foreground/40 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      style={{ fontSize: "16px" }}
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 text-sm sm:text-base cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.saveInfo || false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          saveInfo: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-foreground/60 group-hover:text-foreground transition-colors">
                      Save this information for next time
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 border-2 border-border text-foreground font-medium rounded-lg hover:bg-background/50 transition-colors text-sm sm:text-base"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-lg border border-border lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-foreground/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-foreground/70">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
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

// Payment Page Component with Paystack Inline Checkout
const PaymentPage = ({ shippingInfo, onBack }) => {
  const { cartItems, totalItems, clearCart, showToast } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Load Paystack script on mount
  useEffect(() => {
    // Check if script already exists
    if (window.PaystackPop) {
      setIsScriptLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      'script[src="https://js.paystack.co/v1/inline.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsScriptLoaded(true));
      return;
    }

    // Create and load script
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      console.log("Paystack script loaded successfully");
    };
    script.onerror = () => {
      showToast(
        "Failed to load payment system. Please check your internet connection.",
        "error",
      );
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [showToast]);

  // Generate unique reference
  const generateReference = () => {
    return `PSK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initiate Paystack payment with all channels
  const initiatePaystackPayment = () => {
    if (!isScriptLoaded || !window.PaystackPop) {
      showToast(
        "Payment system is still loading. Please wait a moment and try again.",
        "error",
      );
      return;
    }

    setIsProcessing(true);

    try {
      const config = {
        key: PAYSTACK_PUBLIC_KEY,
        email: shippingInfo.email,
        amount: subtotal * 100, // Convert to kobo (NGN smallest unit)
        currency: "NGN",
        ref: generateReference(),
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: shippingInfo.fullName,
            },
            {
              display_name: "Phone Number",
              variable_name: "phone_number",
              value: shippingInfo.phone,
            },
            {
              display_name: "Shipping Address",
              variable_name: "shipping_address",
              value: `${shippingInfo.address}, ${shippingInfo.city ? shippingInfo.city + ", " : ""}${shippingInfo.state}, ${shippingInfo.country}`,
            },
          ],
          cart_items: cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        callback: function (response) {
          setIsProcessing(false);
          console.log("Payment successful:", response);

          // ✅ TRACK PURCHASE FOR REVIEW ELIGIBILITY
          trackPurchase(cartItems, shippingInfo.email)
            .then(() => {
              showToast(
                "Payment successful! You can now leave reviews.",
                "success",
              );
              console.log("✅ Purchase tracked! User can now leave reviews.");
            })
            .catch((err) => {
              console.error("Error tracking purchase:", err);
              showToast("Payment successful! Order confirmed.", "success");
            });

          // IMPORTANT: Verify payment on your backend before fulfilling order
          // Example API call:
          // fetch('/api/verify-payment', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ reference: response.reference })
          // }).then(res => res.json()).then(data => {
          //   if (data.status === 'success') {
          //     clearCart();
          //     window.location.href = "/order-success";
          //   }
          // });

          setTimeout(() => {
            clearCart();
            // Redirect to home page where user can leave reviews
            window.location.href = "/";
          }, 2000);
        },
        onClose: function () {
          setIsProcessing(false);
          showToast("Payment window closed", "error");
        },
      };

      const handler = window.PaystackPop.setup(config);
      handler.openIframe();
    } catch (error) {
      setIsProcessing(false);
      console.error("Payment initialization error:", error);
      showToast(
        error.message || "Failed to initialize payment. Please try again.",
        "error",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Paystack Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            PAYSTACK CHECKOUT
          </h1>
          <p className="text-foreground/70">
            Use one of the payment methods below to pay NGN{" "}
            {subtotal.toLocaleString()} to {shippingInfo.fullName}
          </p>
        </div>

        {/* Payment Methods */}
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Pay with Zap */}
          <button
            onClick={initiatePaystackPayment}
            disabled={isProcessing || !isScriptLoaded}
            className="w-full flex items-center gap-4 p-5 border-b border-border hover:bg-background/50 transition-colors text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                Z
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    Pay with Zap
                  </span>
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                    NEW
                  </span>
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Pay with Card */}
          <button
            onClick={initiatePaystackPayment}
            disabled={isProcessing || !isScriptLoaded}
            className="w-full flex items-center gap-4 p-5 border-b border-border hover:bg-background/50 transition-colors text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 flex-1">
              <CreditCard className="w-6 h-6 text-foreground/60" />
              <span className="font-medium text-foreground">Pay with Card</span>
            </div>
            <svg
              className="w-5 h-5 text-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Pay with Transfer */}
          <button
            onClick={initiatePaystackPayment}
            disabled={isProcessing || !isScriptLoaded}
            className="w-full flex items-center gap-4 p-5 border-b border-border hover:bg-background/50 transition-colors text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 flex-1">
              <Banknote className="w-6 h-6 text-foreground/60" />
              <span className="font-medium text-foreground">
                Pay with Transfer
              </span>
            </div>
            <svg
              className="w-5 h-5 text-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Pay with Bank */}
          <button
            onClick={initiatePaystackPayment}
            disabled={isProcessing || !isScriptLoaded}
            className="w-full flex items-center gap-4 p-5 border-b border-border hover:bg-background/50 transition-colors text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 flex-1">
              <Building2 className="w-6 h-6 text-foreground/60" />
              <span className="font-medium text-foreground">Pay with Bank</span>
            </div>
            <svg
              className="w-5 h-5 text-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Pay with USSD */}
          <button
            onClick={initiatePaystackPayment}
            disabled={isProcessing || !isScriptLoaded}
            className="w-full flex items-center gap-4 p-5 border-b border-border hover:bg-background/50 transition-colors text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 flex-1">
              <Smartphone className="w-6 h-6 text-foreground/60" />
              <span className="font-medium text-foreground">Pay with USSD</span>
            </div>
            <svg
              className="w-5 h-5 text-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Pay with OPay */}
          <button
            onClick={initiatePaystackPayment}
            disabled={isProcessing || !isScriptLoaded}
            className="w-full flex items-center gap-4 p-5 hover:bg-background/50 transition-colors text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">O</span>
              </div>
              <span className="font-medium text-foreground">Pay with OPay</span>
            </div>
            <svg
              className="w-5 h-5 text-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Loading Indicator */}
        {!isScriptLoaded && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-foreground/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading payment methods...</span>
            </div>
          </div>
        )}

        {/* Cancel Payment Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-6 py-3 text-foreground/60 hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            <span>Cancel Payment</span>
          </button>
        </div>

        {/* Secured by Paystack */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-foreground/50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
          <span>
            Secured by <strong className="text-foreground">paystack</strong>
          </span>
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
            <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Initializing Payment
            </h3>
            <p className="text-sm text-foreground/60">Please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Cart Page Component
export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalItems, showToast } =
    useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [currentPage, setCurrentPage] = useState("cart");
  const [shippingInfo, setShippingInfo] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

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
      const total = subtotal - discount;

      return { subtotal, discount, total };
    } catch (error) {
      console.error("Error calculating totals:", error);
      showToast("Error calculating cart total", "error");
      return { subtotal: 0, discount: 0, total: 0 };
    }
  };

  const { subtotal, discount, total } = calculateTotals();

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

      window.scrollTo({ top: 0, behavior: "smooth" });
      setCurrentPage("checkout");
    } catch (error) {
      console.error("Checkout error:", error);
      showToast(error.message || "Cannot proceed to checkout", "error");
    }
  };

  const handleProceedToPayment = (formData) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShippingInfo(formData);
    setCurrentPage("payment");
  };

  const handleStartShopping = () => {
    setIsNavigating(true);
    setTimeout(() => {
      window.location.href = "/products";
    }, 1500);
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
      <>
        {isNavigating && <LoadingOverlay />}
        <div className="min-h-screen flex items-center justify-center px-4 pt-16 sm:pt-20 bg-gradient-to-br from-primary/20 via-background to-primary/10">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-foreground/10 rounded-full flex items-center justify-center animate-pulse">
              <ShoppingCart className="w-12 h-12 text-foreground/40" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm sm:text-base text-foreground/60 mb-8">
              Add some products to see them here.
            </p>
            <button
              onClick={handleStartShopping}
              disabled={isNavigating}
              className="relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all text-sm sm:text-base shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px]"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span>Start Shopping</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg flex items-center gap-2 sm:gap-3 mt-2 shadow-sm">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" />
          <p className="font-semibold text-xs sm:text-sm md:text-base">
            You have {totalItems} {totalItems === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8">
          Shopping Cart
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-12 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="text-foreground font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
              1. Cart
            </span>
          </div>
          <div className="h-px flex-1 bg-border min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="text-foreground/60 dark:text-foreground/70 text-xs sm:text-sm md:text-base whitespace-nowrap">
              2. Checkout
            </span>
          </div>
          <div className="h-px flex-1 bg-border min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="text-foreground/60 dark:text-foreground/70 text-xs sm:text-sm md:text-base whitespace-nowrap">
              3. Payment
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-xl p-4 sm:p-6 shadow-lg border border-border hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="shrink-0 w-full sm:w-auto mx-auto sm:mx-0">
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
                    <p className="text-xs sm:text-sm text-foreground/60 mb-3 line-clamp-2">
                      {item.description || item.desc || "Product description"}
                    </p>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl font-bold text-foreground">
                        ₦{item.price.toLocaleString()}
                      </span>
                      {item.oldPrice && (
                        <span className="text-base sm:text-lg text-foreground/40 line-through">
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
                      className="w-10 h-10 rounded-lg border-2 border-border hover:bg-background/50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} className="text-foreground" />
                    </button>
                    <span className="w-12 text-center font-semibold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-lg border-2 border-border hover:bg-background/50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity >= 10}
                    >
                      <Plus size={16} className="text-foreground" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors group"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2
                        size={20}
                        className="text-foreground/40 group-hover:text-red-500"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-lg border border-border lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-foreground/70">
                  <span>Sub Total</span>
                  <span className="font-semibold text-foreground">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm sm:text-base text-foreground/70">
                    <span>Discount</span>
                    <span className="font-semibold text-red-500">
                      -₦{discount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base text-foreground/70">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
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
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all mb-4 sm:mb-6 text-sm sm:text-base shadow-lg"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs sm:text-sm text-center text-foreground/60 mb-4 sm:mb-6">
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
                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ fontSize: "16px" }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-4 sm:px-6 py-2 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

// Default export
export default function CartDemo({ products }) {
  const { addToCart, cartItems } = useCart();

  return (
    <div>
      {cartItems.length === 0 && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-xl border border-slate-200 z-50">
          <p className="text-sm text-slate-600 mb-3 font-medium">
            Add sample items to cart:
          </p>
          <div className="flex gap-2">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
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
