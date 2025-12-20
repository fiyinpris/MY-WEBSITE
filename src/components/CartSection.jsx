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
  Copy,
  Check,
  Loader2,
  CreditCard,
  Building2,
  Smartphone,
} from "lucide-react";

const CartContext = createContext();

// Paystack Configuration
const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxx"; // Replace with your public key
const PAYSTACK_SECRET_KEY = "sk_test_xxxxxxxxxxxxx"; // Replace with your secret key

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

  // Safe localStorage operations
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

  useEffect(() => {
    const savedCart = safeGetFromStorage("cartItems");
    if (savedCart && Array.isArray(savedCart)) {
      setCartItems(savedCart);
    }
    setIsInitialized(true);
  }, []);

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
          if (existingItem.quantity >= 10) {
            showToast("Maximum quantity (10) reached for this item", "error");
            return prev;
          }
          showToast(`${product.name} added to cart`, "success");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg flex items-center gap-2 sm:gap-3 mt-2 shadow-sm">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
          <p className="font-semibold text-xs sm:text-sm md:text-base">
            You have {totalItems} {totalItems === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6 md:mb-8">
          Checkout
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-12 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span
              className="text-slate-500 text-xs sm:text-sm md:text-base cursor-pointer whitespace-nowrap hover:text-slate-700 transition-colors"
              onClick={onBack}
            >
              1. Cart
            </span>
          </div>
          <div className="h-px flex-1 bg-slate-300 min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-slate-900 font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
              2. Checkout
            </span>
          </div>
          <div className="h-px flex-1 bg-slate-300 min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-slate-500 text-xs sm:text-sm md:text-base whitespace-nowrap">
              3. Payment
            </span>
          </div>
        </div>

        <div className="w-full px-0 sm:px-4 lg:px-0 grid lg:grid-cols-3 gap-0 lg:gap-8">
          <div className="lg:col-span-2">
            <form className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">
                Shipping Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Street address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.city}
                      </p>
                    )}
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
                      className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-slate-600 group-hover:text-slate-900 transition-colors">
                      Save this information for next time
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 border-2 border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm sm:text-base"
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
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200 lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-slate-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                <div className="border-t border-slate-200 pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-slate-900">
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

// Bank Transfer Component
const BankTransferPayment = ({
  amount,
  email,
  reference,
  onBack,
  onComplete,
}) => {
  const [copied, setCopied] = useState({ account: false, amount: false });
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const { showToast } = useCart();

  // Bank details
  const bankDetails = {
    bankName: "Paystack-Titan",
    accountNumber: "9903311438",
    accountName: "Paystack Checkout",
    amount: amount,
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [field]: true }));
      showToast(
        `${field === "account" ? "Account number" : "Amount"} copied!`,
        "success"
      );
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [field]: false }));
      }, 2000);
    } catch (error) {
      showToast("Failed to copy", "error");
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <Building2 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Pay with Transfer
          </h3>
          <p className="text-sm text-slate-600">
            Transfer to the account below
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-700">Email</span>
        </div>
        <p className="text-base font-medium text-slate-900">{email}</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-700">Amount to Pay</span>
          <button
            onClick={() => copyToClipboard(amount.toString(), "amount")}
            className="p-1.5 hover:bg-emerald-100 rounded transition-colors"
          >
            {copied.amount ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 text-emerald-600" />
            )}
          </button>
        </div>
        <p className="text-2xl font-bold text-emerald-700">
          NGN {amount.toLocaleString()}
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-xs text-slate-500 uppercase mb-1">Bank Name</div>
          <div className="text-base font-semibold text-slate-900">
            {bankDetails.bankName}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-slate-500 uppercase">
              Account Number
            </div>
            <button
              onClick={() =>
                copyToClipboard(bankDetails.accountNumber, "account")
              }
              className="p-1.5 hover:bg-slate-200 rounded transition-colors"
            >
              {copied.account ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-wider">
            {bankDetails.accountNumber}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-xs text-slate-500 uppercase mb-1">Amount</div>
          <div className="text-xl font-bold text-slate-900">
            NGN {bankDetails.amount.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 mb-6">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
          <AlertCircle className="w-4 h-4" />
          <span>
            This account is for this transaction only and expires in{" "}
            <span className="font-semibold text-red-600">
              {formatTime(timeRemaining)}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/30"
        >
          I've sent the money
        </button>
        <button
          onClick={onBack}
          className="w-full border-2 border-slate-300 text-slate-700 font-medium py-3 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Change Payment Method
        </button>
      </div>
    </div>
  );
};

// USSD Payment Component
const USSDPayment = ({ amount, email, reference, onBack, onComplete }) => {
  const [selectedBank, setSelectedBank] = useState(null);
  const { showToast } = useCart();

  const banks = [
    { name: "Guaranty Trust Bank", code: "*737#", shortCode: "737" },
    { name: "Access Bank", code: "*901#", shortCode: "901" },
    { name: "Zenith Bank", code: "*966#", shortCode: "966" },
    { name: "First Bank", code: "*894#", shortCode: "894" },
    { name: "UBA", code: "*919#", shortCode: "919" },
    { name: "Sterling Bank", code: "*822#", shortCode: "822" },
  ];

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <Smartphone className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Pay with USSD</h3>
          <p className="text-sm text-slate-600">
            Choose your bank to start the payment
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600 mb-1">{email}</div>
            <div className="text-lg font-bold text-slate-900">
              Pay NGN {amount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {!selectedBank ? (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Choose your bank to start the payment
          </h4>
          {banks.map((bank) => (
            <button
              key={bank.shortCode}
              onClick={() => handleBankSelect(bank)}
              className="w-full flex items-center justify-between p-4 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <span className="font-medium text-slate-900 group-hover:text-green-700">
                {bank.name}
              </span>
              <span className="text-sm text-slate-500 font-mono">
                *{bank.shortCode}#
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-3">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Dial on your phone
              </h4>
              <div className="text-4xl font-bold text-green-700 tracking-wider mb-3">
                {selectedBank.code}
              </div>
              <p className="text-sm text-slate-600">
                Follow the prompts on your phone to complete the payment
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-900">1.</span>
                <span>Dial {selectedBank.code} on your phone</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-900">2.</span>
                <span>Select "Paystack" or "Make Payment"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-900">3.</span>
                <span>Enter the amount: NGN {amount.toLocaleString()}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-900">4.</span>
                <span>Confirm the transaction with your PIN</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-green-500/30"
            >
              I've completed the payment
            </button>
            <button
              onClick={() => setSelectedBank(null)}
              className="w-full border-2 border-slate-300 text-slate-700 font-medium py-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Choose another bank
            </button>
          </div>
        </div>
      )}

      {!selectedBank && (
        <button
          onClick={onBack}
          className="w-full border-2 border-slate-300 text-slate-700 font-medium py-3 rounded-lg hover:bg-slate-50 transition-colors mt-3"
        >
          Change Payment Method
        </button>
      )}

      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Payment confirmation may take a few minutes. If you don't see
            confirmation immediately, please wait before trying again.
          </p>
        </div>
      </div>
    </div>
  );
};

// Payment Page Component with Paystack Integration
const PaymentPage = ({ shippingInfo, onBack }) => {
  const { cartItems, totalItems, clearCart, showToast } = useCart();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Generate unique reference
  const generateReference = () => {
    return `PSK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method === "card") {
      initiateCardPayment();
    } else {
      const reference = generateReference();
      setPaymentReference(reference);
    }
  };

  const initiateCardPayment = () => {
    setIsProcessing(true);

    // Initialize Paystack Popup
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: shippingInfo.email,
      amount: subtotal * 100, // Paystack expects amount in kobo
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
        ],
      },
      callback: function (response) {
        setIsProcessing(false);
        showToast("Payment successful! Order confirmed.", "success");
        // Verify payment on backend here
        clearCart();
        // Redirect to success page
      },
      onClose: function () {
        setIsProcessing(false);
        showToast("Payment cancelled", "error");
      },
    });

    handler.openIframe();
  };

  const handlePaymentComplete = () => {
    setIsProcessing(true);
    // Simulate payment verification
    setTimeout(() => {
      setIsProcessing(false);
      showToast("Payment received! Verifying transaction...", "success");
      setTimeout(() => {
        showToast("Payment confirmed! Order successful.", "success");
        clearCart();
        // Redirect to order confirmation
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg flex items-center gap-2 sm:gap-3 mt-2 shadow-sm">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
          <p className="font-semibold text-xs sm:text-sm md:text-base">
            You have {totalItems} {totalItems === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6 md:mb-8">
          Payment
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-12 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-slate-500 text-xs sm:text-sm md:text-base whitespace-nowrap">
              1. Cart
            </span>
          </div>
          <div className="h-px flex-1 bg-slate-300 min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span
              className="text-slate-500 text-xs sm:text-sm md:text-base cursor-pointer whitespace-nowrap hover:text-slate-700 transition-colors"
              onClick={onBack}
            >
              2. Checkout
            </span>
          </div>
          <div className="h-px flex-1 bg-slate-300 min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-slate-900 font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
              3. Payment
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">
                Shipping To
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 space-y-1 bg-slate-50 p-4 rounded-lg">
                <p className="font-semibold text-slate-900">
                  {shippingInfo.fullName}
                </p>
                <p>{shippingInfo.address}</p>
                <p>
                  {shippingInfo.city}, {shippingInfo.state}
                </p>
                <p>{shippingInfo.phone}</p>
                <p className="text-green-600">{shippingInfo.email}</p>
              </div>
            </div>

            {!paymentMethod ? (
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">
                  Choose Payment Method
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <button
                    onClick={() => handlePaymentMethodSelect("card")}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-4 p-4 sm:p-5 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-slate-900 group-hover:text-green-700 transition-colors">
                        Credit/Debit Card
                      </div>
                      <div className="text-sm text-slate-500">
                        Pay with Visa, Mastercard, or Verve
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodSelect("transfer")}
                    className="w-full flex items-center gap-4 p-4 sm:p-5 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                  >
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-slate-900 group-hover:text-green-700 transition-colors">
                        Bank Transfer
                      </div>
                      <div className="text-sm text-slate-500">
                        Transfer from your bank app
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodSelect("ussd")}
                    className="w-full flex items-center gap-4 p-4 sm:p-5 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                  >
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Smartphone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-slate-900 group-hover:text-green-700 transition-colors">
                        USSD
                      </div>
                      <div className="text-sm text-slate-500">
                        Dial a code on your phone
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={onBack}
                  className="w-full mt-6 py-3 border-2 border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Back to Checkout
                </button>
              </div>
            ) : paymentMethod === "transfer" ? (
              <BankTransferPayment
                amount={subtotal}
                email={shippingInfo.email}
                reference={paymentReference}
                onBack={() => setPaymentMethod(null)}
                onComplete={handlePaymentComplete}
              />
            ) : paymentMethod === "ussd" ? (
              <USSDPayment
                amount={subtotal}
                email={shippingInfo.email}
                reference={paymentReference}
                onBack={() => setPaymentMethod(null)}
                onComplete={handlePaymentComplete}
              />
            ) : null}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200 lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs sm:text-sm"
                  >
                    <span className="text-slate-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-slate-900 font-medium">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-slate-900">
                    <span>Total</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-200">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                <span>Secured by Paystack</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Page Component (same as before with minor styling updates)
export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalItems, showToast } =
    useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [currentPage, setCurrentPage] = useState("cart");
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
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 sm:pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mb-6">
            Add some products to see them here.
          </p>
          <a
            href="/products"
            className="inline-block px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all text-sm sm:text-base shadow-lg"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg flex items-center gap-2 sm:gap-3 mt-2 shadow-sm">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
          <p className="font-semibold text-xs sm:text-sm md:text-base">
            You have {totalItems} {totalItems === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6 md:mb-8">
          Shopping Cart
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-12 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-slate-900 font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
              1. Cart
            </span>
          </div>
          <div className="h-px flex-1 bg-slate-300 min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-slate-500 text-xs sm:text-sm md:text-base whitespace-nowrap">
              2. Checkout
            </span>
          </div>
          <div className="h-px flex-1 bg-slate-300 min-w-4"></div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-slate-500 text-xs sm:text-sm md:text-base whitespace-nowrap">
              3. Payment
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
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
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 line-clamp-2">
                      {item.description || item.desc || "Product description"}
                    </p>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl font-bold text-slate-900">
                        ₦{item.price.toLocaleString()}
                      </span>
                      {item.oldPrice && (
                        <span className="text-base sm:text-lg text-slate-400 line-through">
                          ₦{item.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-lg border-2 border-slate-300 hover:bg-slate-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} className="text-slate-700" />
                    </button>
                    <span className="w-12 text-center font-semibold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-lg border-2 border-slate-300 hover:bg-slate-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity >= 10}
                    >
                      <Plus size={16} className="text-slate-700" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2
                        size={20}
                        className="text-slate-400 group-hover:text-red-500"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200 lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-slate-700">
                  <span>Sub Total</span>
                  <span className="font-semibold text-slate-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm sm:text-base text-slate-700">
                    <span>Discount</span>
                    <span className="font-semibold text-red-500">
                      -₦{discount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base text-slate-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                <div className="border-t border-slate-200 pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-slate-900">
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

              <p className="text-xs sm:text-sm text-center text-slate-600 mb-4 sm:mb-6">
                Estimated Delivery by{" "}
                <span className="font-semibold text-slate-900">
                  25 December, 2025
                </span>
              </p>

              <div className="border-t border-slate-200 pt-4 sm:pt-6">
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-3">
                  Have a Referral code?
                </h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Referral Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg border-2 border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-4 sm:px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
      {/* Add Paystack Script */}
      <script src="https://js.paystack.co/v1/inline.js"></script>

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
