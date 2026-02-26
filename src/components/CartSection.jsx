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
  LogIn,
  MapPin,
  Home,
  Package,
  ChevronRight,
  Shield,
} from "lucide-react";

const CartContext = createContext();

const PAYSTACK_PUBLIC_KEY = "pk_live_86028b6add1aa51c8bc8f41f5c87a7f52cfbed99";

const STATE_DELIVERY_FEES = {
  Abia: { park: 3500, doorstep: 5500 },
  Adamawa: { park: 3500, doorstep: 5500 },
  "Akwa Ibom": { park: 3500, doorstep: 5500 },
  Anambra: { park: 3500, doorstep: 5500 },
  Bauchi: { park: 3500, doorstep: 5500 },
  Bayelsa: { park: 3500, doorstep: 5500 },
  Benue: { park: 3500, doorstep: 5500 },
  Borno: { park: 3500, doorstep: 5500 },
  "Cross River": { park: 3500, doorstep: 5500 },
  Delta: { park: 3500, doorstep: 5500 },
  Ebonyi: { park: 3500, doorstep: 5500 },
  Edo: { park: 3500, doorstep: 5500 },
  Ekiti: { park: 3500, doorstep: 5500 },
  Enugu: { park: 3500, doorstep: 5500 },
  Gombe: { park: 3500, doorstep: 5500 },
  Imo: { park: 3500, doorstep: 5500 },
  Jigawa: { park: 3500, doorstep: 5500 },
  Kaduna: { park: 3500, doorstep: 5500 },
  Kano: { park: 3500, doorstep: 5500 },
  Katsina: { park: 3500, doorstep: 5500 },
  Kebbi: { park: 3500, doorstep: 5500 },
  Kogi: { park: 3500, doorstep: 5500 },
  Kwara: { park: 3500, doorstep: 5500 },
  Lagos: { park: 3500, doorstep: 5500 },
  Nasarawa: { park: 3500, doorstep: 5500 },
  Niger: { park: 3500, doorstep: 5500 },
  Ogun: { park: 3500, doorstep: 5500 },
  Ondo: { park: 3500, doorstep: 5500 },
  Osun: { park: 3500, doorstep: 5500 },
  Oyo: { park: 3500, doorstep: 5500 },
  Plateau: { park: 3500, doorstep: 5500 },
  Rivers: { park: 3500, doorstep: 5500 },
  Sokoto: { park: 3500, doorstep: 5500 },
  Taraba: { park: 3500, doorstep: 5500 },
  Yobe: { park: 3500, doorstep: 5500 },
  Zamfara: { park: 3500, doorstep: 5500 },
  "FCT – Abuja": { park: 3500, doorstep: 5500 },
};

const getDeliveryFee = (state, type) => {
  if (!state || !type) return 0;
  return (
    (STATE_DELIVERY_FEES[state] || { park: 3500, doorstep: 5500 })[type] || 0
  );
};

const STATES = Object.keys(STATE_DELIVERY_FEES);

const trackPurchase = async (items, userEmail) => {
  try {
    let purchases = [];
    const stored = localStorage.getItem("user-purchases");
    if (stored) purchases = JSON.parse(stored);
    items.forEach((item) =>
      purchases.push({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        date: new Date().toISOString(),
        email: userEmail,
      }),
    );
    localStorage.setItem("user-purchases", JSON.stringify(purchases));
    return true;
  } catch {
    return false;
  }
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg =
    type === "error"
      ? "bg-red-50 border-red-200"
      : "bg-green-50 border-green-200";
  const text = type === "error" ? "text-red-800" : "text-green-800";
  const Icon = type === "error" ? AlertCircle : CheckCircle;
  return (
    <div
      className={`fixed top-20 right-4 ${bg} border rounded-lg px-3 py-2 shadow-lg z-[9999] max-w-xs`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${text} shrink-0`} />
        <p className={`${text} text-xs font-medium flex-1`}>{message}</p>
        <button onClick={onClose} className={`${text} hover:opacity-70`}>
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/20 dark:bg-gray-900/30 z-50 flex items-center justify-center">
    <div className="flex gap-3">
      {[0, 0.2, 0.4].map((d, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </div>
  </div>
);

const SignInModal = ({ onSignIn, onClose }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-foreground/50 hover:text-foreground"
      >
        <X size={20} />
      </button>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <LogIn className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-foreground text-center mb-2">
        Sign in to Checkout
      </h2>
      <p className="text-sm text-foreground/60 text-center mb-6">
        You need to be signed in before you can proceed to checkout.
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onSignIn}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <LogIn size={18} /> Sign In to Continue
        </button>
        <button
          onClick={onClose}
          className="w-full border border-border text-foreground/70 font-medium py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <X size={16} /> Cancel
        </button>
      </div>
      <p className="text-xs text-foreground/40 text-center mt-4">
        Your cart items will be saved while you sign in.
      </p>
    </div>
  </div>
);

// Step indicator — matches original style with flex-1 growing connectors
const Steps = ({ current }) => {
  const steps = ["Cart", "Checkout", "Confirm", "Payment"];
  const idx = steps.indexOf(current);
  return (
    <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto">
      {steps.map((s, i) => (
        <div
          key={s}
          className="flex items-center gap-2 sm:gap-4 shrink-0 flex-1 last:flex-none"
        >
          <span
            className={`text-xs sm:text-sm whitespace-nowrap font-medium ${i === idx ? "text-foreground font-semibold" : i < idx ? "text-primary" : "text-foreground/50"}`}
          >
            {i + 1}. {s}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`h-px flex-1 min-w-4 ${i < idx ? "bg-primary/40" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export const CartSection = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const safeGet = useCallback((k) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  }, []);
  const safeSave = useCallback((k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  }, []);
  const showToast = useCallback(
    (message, type = "success") => setToast({ message, type }),
    [],
  );
  useEffect(() => {
    const s = safeGet("cartItems");
    if (s && Array.isArray(s)) setCartItems(s);
    setIsInitialized(true);
  }, [safeGet]);
  useEffect(() => {
    if (isInitialized) safeSave("cartItems", cartItems);
  }, [cartItems, isInitialized, safeSave]);

  const addToCart = (product) => {
    try {
      if (!product?.id || !product?.name || typeof product?.price !== "number")
        throw new Error("Invalid product");
      setCartItems((prev) => {
        const ex = prev.find((i) => i.id === product.id);
        if (ex) {
          if (ex.quantity >= 10) {
            showToast("Maximum quantity (10) reached", "error");
            return prev;
          }
          showToast(`${product.name} added to cart`, "success");
          return prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
          );
        }
        showToast(`${product.name} added to cart`, "success");
        return [...prev, { ...product, quantity: 1 }];
      });
    } catch (e) {
      showToast(e.message || "Failed to add item", "error");
    }
  };
  const removeFromCart = (id) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      setCartItems((p) => p.filter((i) => i.id !== id));
      showToast(`${item.name} removed`, "success");
    }
  };
  const updateQuantity = (id, qty) => {
    if (qty < 1 || qty > 10) return;
    setCartItems((p) =>
      p.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  };
  const clearCart = () => setCartItems([]);
  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
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
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartSection");
  return ctx;
};

const DeliverySelector = ({ value, onChange, state }) => {
  const fees = STATE_DELIVERY_FEES[state] || { park: 3500, doorstep: 5500 };
  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-3">
        Delivery Method <span className="text-red-500">*</span>
        {state && <span className="ml-1 text-primary text-xs">— {state}</span>}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            type: "doorstep",
            Icon: Home,
            label: "Doorstep Delivery",
            desc: "Delivered to your door",
            fee: fees.doorstep,
          },
          {
            type: "park",
            Icon: Package,
            label: "Park Pickup",
            desc: "Pick up at nearest park",
            fee: fees.park,
          },
        ].map(({ type, Icon, label, desc, fee }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${value === type ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-background"}`}
          >
            <div
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${value === type ? "border-primary" : "border-foreground/30"}`}
            >
              {value === type && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">
                  {label}
                </span>
              </div>
              <p className="text-xs text-foreground/50">{desc}</p>
              <p className="text-sm font-bold text-primary mt-1">
                ₦{fee.toLocaleString()}
              </p>
            </div>
          </button>
        ))}
      </div>
      {!state && (
        <p className="text-amber-500 text-xs mt-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Select your state to see prices
        </p>
      )}
    </div>
  );
};

// ── STEP 2: Checkout Form ─────────────────────────────────────────────────────
const CheckoutPage = ({ onNext, onBack }) => {
  const { cartItems, showToast } = useCart();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    country: "Nigeria",
    state: "",
    city: "",
    deliveryType: "",
    saveInfo: false,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const saved = JSON.parse(
        localStorage.getItem("savedShippingInfo") || "{}",
      );
      setForm((p) => ({
        ...p,
        fullName: saved.fullName || user.name || "",
        email: saved.email || user.email || "",
        phone: saved.phone || "",
        address: saved.address || "",
        state: saved.state || "",
        city: saved.city || "",
        country: saved.country || "Nigeria",
        deliveryType: saved.deliveryType || "",
      }));
    } catch (_) {}
  }, []);

  const deliveryFee = getDeliveryFee(form.state, form.deliveryType);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + deliveryFee;

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!form.deliveryType) e.deliveryType = "Please select a delivery method";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setBusy(true);
    if (form.saveInfo) {
      try {
        localStorage.setItem(
          "savedShippingInfo",
          JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            state: form.state,
            city: form.city,
            country: form.country,
            deliveryType: form.deliveryType,
          }),
        );
      } catch (_) {}
    }
    setTimeout(() => {
      setBusy(false);
      onNext({ ...form, deliveryFee, total });
    }, 700);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "state" ? { deliveryType: "" } : {}),
    }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const Field = ({ label, name, type = "text", placeholder, required }) => (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        style={{ fontSize: "16px" }}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto mt-2">
        <Steps current="Checkout" />
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
          Checkout
        </h1>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-xl p-5 shadow-lg border border-border"
            >
              <h2 className="text-lg font-bold text-foreground mb-5">
                Shipping Information
              </h2>
              <div className="space-y-4">
                <Field
                  label="Full Name"
                  name="fullName"
                  placeholder="Your full name"
                  required
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                  <Field
                    label="Phone"
                    name="phone"
                    type="tel"
                    placeholder="080XXXXXXXX"
                    required
                  />
                </div>
                <Field
                  label="Address"
                  name="address"
                  placeholder="Street address"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ fontSize: "16px" }}
                    >
                      {[
                        "Nigeria",
                        "Ghana",
                        "Kenya",
                        "South Africa",
                        "Other",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground/70 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ fontSize: "16px" }}
                    >
                      <option value="">Select State</option>
                      {STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">
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
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                </div>
                <DeliverySelector
                  value={form.deliveryType}
                  onChange={(t) => {
                    setForm((p) => ({ ...p, deliveryType: t }));
                    if (errors.deliveryType)
                      setErrors((p) => ({ ...p, deliveryType: "" }));
                  }}
                  state={form.state}
                />
                {errors.deliveryType && (
                  <p className="text-red-500 text-xs">{errors.deliveryType}</p>
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="saveInfo"
                    checked={form.saveInfo}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-2 border-border text-primary shrink-0"
                    style={{ minWidth: 20, minHeight: 20 }}
                  />
                  <span className="text-sm text-foreground/60 select-none">
                    Save this information for next time
                  </span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full sm:w-auto sm:px-6 py-3 border-2 border-border text-foreground font-medium rounded-lg hover:bg-background/50 text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg disabled:opacity-50 text-sm shadow-lg flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Review Order <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div>
            <div className="bg-card rounded-xl p-4 sm:p-5 shadow-lg border border-border lg:sticky lg:top-24">
              <h2 className="text-base font-bold text-foreground mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-foreground/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-foreground/70">
                  <span>Delivery</span>
                  <span
                    className={
                      deliveryFee > 0
                        ? "font-semibold text-foreground"
                        : "text-foreground/40"
                    }
                  >
                    {deliveryFee > 0
                      ? `₦${deliveryFee.toLocaleString()}`
                      : !form.state
                        ? "Select state"
                        : "Select method"}
                  </span>
                </div>
                {form.deliveryType && form.state && (
                  <div className="flex items-center gap-1 text-xs text-foreground/50 bg-primary/5 rounded-lg px-2 py-1.5">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>
                      {form.deliveryType === "doorstep"
                        ? "Doorstep"
                        : "Park Pickup"}{" "}
                      · {form.state}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── STEP 3: Confirm Order ─────────────────────────────────────────────────────
const ConfirmPage = ({ shippingInfo, onPay, onBack }) => {
  const { cartItems } = useCart();
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = shippingInfo?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-xl mx-auto mt-2">
        <Steps current="Confirm" />
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
          Review Your Order
        </h1>

        {/* Items */}
        <div className="bg-card rounded-xl shadow-lg border border-border mb-4 overflow-hidden">
          <div className="px-4 py-3 bg-foreground/5 border-b border-border">
            <h2 className="font-bold text-foreground text-sm">Items Ordered</h2>
          </div>
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 border-b border-border last:border-0"
            >
              <img
                src={item.image || item.img}
                alt={item.name}
                className="w-14 h-14 object-cover rounded-lg shrink-0"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/56?text=?";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {item.name}
                </p>
                <p className="text-xs text-foreground/50 mt-0.5">
                  Qty: {item.quantity} × ₦{item.price.toLocaleString()}
                </p>
              </div>
              <p className="font-bold text-foreground text-sm shrink-0">
                ₦{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="bg-card rounded-xl shadow-lg border border-border mb-4 p-4">
          <h2 className="font-bold text-foreground text-sm mb-3">
            Payment Breakdown
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-foreground/70">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-foreground/70">
              <span>
                {shippingInfo?.deliveryType === "doorstep"
                  ? "Doorstep Delivery"
                  : "Park Pickup"}{" "}
                · {shippingInfo?.state}
              </span>
              <span>₦{deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-foreground border-t border-border pt-2">
              <span>Total</span>
              <span className="text-green-600">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-card rounded-xl shadow-lg border border-border mb-6 overflow-hidden">
          <div className="px-4 py-3 bg-foreground/5 border-b border-border">
            <h2 className="font-bold text-foreground text-sm">
              Delivery Details
            </h2>
          </div>
          <div className="p-4 space-y-2 text-sm">
            {[
              ["Name", shippingInfo?.fullName],
              ["Email", shippingInfo?.email],
              ["Phone", shippingInfo?.phone],
              [
                "Address",
                `${shippingInfo?.address}${shippingInfo?.city ? ", " + shippingInfo?.city : ""}, ${shippingInfo?.state}`,
              ],
              [
                "Method",
                shippingInfo?.deliveryType === "doorstep"
                  ? "Doorstep Delivery"
                  : "Park Pickup",
              ],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4">
                <span className="text-foreground/50 shrink-0">{l}</span>
                <span className="text-foreground font-medium text-right">
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="w-full sm:w-auto sm:px-6 py-3 border-2 border-border text-foreground font-medium rounded-lg hover:bg-background/50 text-sm"
          >
            ← Edit Details
          </button>
          <button
            onClick={onPay}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-lg text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" /> Pay ₦{total.toLocaleString()} Now
          </button>
        </div>
        <p className="text-center text-xs text-foreground/40 mt-4 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" /> Payment secured by Paystack
        </p>
      </div>
    </div>
  );
};

// ── STEP 4: Payment ───────────────────────────────────────────────────────────
const PaymentPage = ({ shippingInfo, onBack }) => {
  const { cartItems, clearCart, showToast } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptState, setScriptState] = useState("loading"); // loading | ready | error

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = shippingInfo?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  // ✅ Load Paystack script with polling fallback
  useEffect(() => {
    if (window.PaystackPop) {
      setScriptState("ready");
      return;
    }
    const existing = document.querySelector(
      'script[src="https://js.paystack.co/v1/inline.js"]',
    );
    if (existing) {
      const poll = setInterval(() => {
        if (window.PaystackPop) {
          setScriptState("ready");
          clearInterval(poll);
        }
      }, 300);
      setTimeout(() => {
        clearInterval(poll);
        if (!window.PaystackPop) setScriptState("error");
      }, 15000);
      return () => clearInterval(poll);
    }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.onload = () => setScriptState("ready");
    s.onerror = () => setScriptState("error");
    document.body.appendChild(s);
  }, []);

  const pay = () => {
    if (scriptState !== "ready" || !window.PaystackPop) {
      showToast("Payment system not ready yet. Please wait.", "error");
      return;
    }
    setIsProcessing(true);
    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: shippingInfo.email,
        amount: Math.round(total) * 100, // ✅ kobo, must be integer
        currency: "NGN",
        ref: `PSK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: shippingInfo.fullName,
            },
            {
              display_name: "Phone",
              variable_name: "phone",
              value: shippingInfo.phone,
            },
            {
              display_name: "Delivery",
              variable_name: "delivery",
              value:
                shippingInfo.deliveryType === "doorstep"
                  ? "Doorstep"
                  : "Park Pickup",
            },
            {
              display_name: "State",
              variable_name: "state",
              value: shippingInfo.state,
            },
            {
              display_name: "Address",
              variable_name: "address",
              value: `${shippingInfo.address}${shippingInfo.city ? ", " + shippingInfo.city : ""}, ${shippingInfo.state}`,
            },
          ],
        },
        callback: (response) => {
          setIsProcessing(false);
          trackPurchase(cartItems, shippingInfo.email);
          showToast(
            "🎉 Payment successful! Your order is confirmed.",
            "success",
          );
          setTimeout(() => {
            clearCart();
            window.location.href = "/";
          }, 2500);
        },
        onClose: () => {
          setIsProcessing(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      setIsProcessing(false);
      showToast(
        err.message || "Failed to open payment. Please try again.",
        "error",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 pt-16 sm:pt-20 pb-16 px-4">
      <div className="max-w-md mx-auto mt-2">
        <Steps current="Payment" />

        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground mb-4 disabled:opacity-50 text-sm font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to review
        </button>

        {/* Paystack-style header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            PAYSTACK CHECKOUT
          </h1>
          <p className="text-foreground/70 text-sm sm:text-base">
            Pay NGN {total.toLocaleString()} for {shippingInfo?.fullName}
          </p>
        </div>

        {/* Payment methods */}
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden mb-5">
          <div className="px-4 py-3 bg-foreground/5 border-b border-border">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
              Pay With
            </p>
          </div>

          {scriptState === "loading" && (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm text-foreground/60">
                Loading secure payment options...
              </p>
            </div>
          )}

          {scriptState === "error" && (
            <div className="p-8 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-red-600 mb-1">
                Failed to load payment
              </p>
              <p className="text-xs text-foreground/50 mb-4">
                Check your internet and try again
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg"
              >
                Refresh Page
              </button>
            </div>
          )}

          {scriptState === "ready" && (
            <div>
              {/* Zap */}
              <button
                onClick={pay}
                disabled={isProcessing}
                className="w-full flex items-center gap-3 p-4 border-b border-border hover:bg-primary/5 transition-colors disabled:opacity-50 group"
              >
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                  Z
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      Pay with Zap
                    </span>
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-tight">
                      NEW
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-primary" />
              </button>
              {[
                {
                  Icon: CreditCard,
                  label: "Pay with Card",
                  iconBg: "bg-blue-50",
                  iconColor: "text-blue-500",
                },
                {
                  Icon: Banknote,
                  label: "Pay with Transfer",
                  iconBg: "bg-emerald-50",
                  iconColor: "text-emerald-500",
                },
                {
                  Icon: Building2,
                  label: "Pay with Bank",
                  iconBg: "bg-violet-50",
                  iconColor: "text-violet-500",
                },
                {
                  Icon: Smartphone,
                  label: "Pay with USSD",
                  iconBg: "bg-orange-50",
                  iconColor: "text-orange-500",
                },
              ].map(({ Icon, label, iconBg, iconColor }) => (
                <button
                  key={label}
                  onClick={pay}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-3 p-4 border-b border-border hover:bg-primary/5 transition-colors disabled:opacity-50 group"
                >
                  <div
                    className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <span className="flex-1 font-semibold text-foreground text-sm text-left">
                    {label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-primary" />
                </button>
              ))}
              {/* OPay */}
              <button
                onClick={pay}
                disabled={isProcessing}
                className="w-full flex items-center gap-3 p-4 hover:bg-primary/5 transition-colors disabled:opacity-50 group"
              >
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-green-600 font-bold">O</span>
                </div>
                <span className="flex-1 font-semibold text-foreground text-sm text-left">
                  Pay with OPay
                </span>
                <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-primary" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-foreground/40">
          <Shield className="w-3 h-3" />
          <span>
            Secured & encrypted by{" "}
            <strong className="text-foreground/60">Paystack</strong>
          </span>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card rounded-2xl p-8 text-center max-w-xs mx-4 shadow-2xl">
            <Loader2 className="w-14 h-14 text-green-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">
              Opening Payment
            </h3>
            <p className="text-sm text-foreground/60">Please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Cart Page ─────────────────────────────────────────────────────────────────
export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalItems, showToast } =
    useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [page, setPage] = useState("cart");
  const [shippingInfo, setShippingInfo] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = subtotal * appliedDiscount;
  const total = subtotal - discount;

  const applyCoupon = () => {
    setIsApplyingCoupon(true);
    setTimeout(() => {
      if (!couponCode.trim()) {
        showToast("Enter a coupon code", "error");
      } else if (couponCode.toUpperCase() === "SAVE15") {
        setAppliedDiscount(0.15);
        showToast("15% discount applied!", "success");
        setCouponCode("");
      } else {
        showToast("Invalid coupon code", "error");
      }
      setIsApplyingCoupon(false);
    }, 700);
  };

  const handleCheckout = () => {
    if (!cartItems.length) {
      showToast("Your cart is empty", "error");
      return;
    }
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}");
      } catch {
        return {};
      }
    })();
    if (!(user.name && (user.email || user.phone))) {
      setShowSignIn(true);
      return;
    }
    setPage("checkout");
  };

  if (page === "checkout")
    return (
      <CheckoutPage
        onNext={(fd) => {
          setShippingInfo(fd);
          setPage("confirm");
        }}
        onBack={() => setPage("cart")}
      />
    );
  if (page === "confirm")
    return (
      <ConfirmPage
        shippingInfo={shippingInfo}
        onPay={() => setPage("payment")}
        onBack={() => setPage("checkout")}
      />
    );
  if (page === "payment")
    return (
      <PaymentPage
        shippingInfo={shippingInfo}
        onBack={() => setPage("confirm")}
      />
    );

  if (!cartItems.length)
    return (
      <>
        {isNavigating && <LoadingOverlay />}
        <div className="min-h-screen flex items-center justify-center px-4 pt-16 bg-gradient-to-br from-primary/20 via-background to-primary/10">
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
              onClick={() => {
                setIsNavigating(true);
                setTimeout(() => {
                  window.location.href = "/shop";
                }, 1500);
              }}
              disabled={isNavigating}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-70"
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> Start Shopping
            </button>
          </div>
        </div>
      </>
    );

  return (
    <>
      {showSignIn && (
        <SignInModal
          onSignIn={() => {
            setShowSignIn(false);
            sessionStorage.setItem("returnTo", "/cart");
            window.location.href = "/signin";
          }}
          onClose={() => setShowSignIn(false)}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 pt-16 sm:pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 sm:p-4 mb-4 rounded-lg flex items-center gap-2 mt-2">
            <ShoppingCart className="w-5 h-5 shrink-0" />
            <p className="font-semibold text-xs sm:text-sm">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4">
            Shopping Cart
          </h1>
          <Steps current="Cart" />

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-xl p-4 sm:p-5 shadow-lg border border-border hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={item.image || item.img}
                      alt={item.name}
                      className="w-full h-44 sm:w-28 sm:h-28 object-cover rounded-lg shrink-0"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-foreground/60 mb-3 line-clamp-2">
                        {item.description || item.desc || ""}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground">
                          ₦{item.price.toLocaleString()}
                        </span>
                        {item.oldPrice && (
                          <span className="text-base text-foreground/40 line-through">
                            ₦{item.oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="w-9 h-9 rounded-lg border-2 border-border hover:bg-background/50 flex items-center justify-center disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= 10}
                        className="w-9 h-9 rounded-lg border-2 border-border hover:bg-background/50 flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 hover:bg-red-50 rounded-lg group"
                    >
                      <Trash2
                        size={18}
                        className="text-foreground/40 group-hover:text-red-500"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="bg-card rounded-xl p-4 sm:p-5 shadow-lg border border-border lg:sticky lg:top-24">
                <h2 className="text-base font-bold text-foreground mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between text-foreground/70">
                    <span>Sub Total</span>
                    <span className="font-semibold text-foreground">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-foreground/70">
                      <span>Discount</span>
                      <span className="font-semibold text-red-500">
                        -₦{discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-foreground/70">
                    <span>Delivery</span>
                    <span className="text-foreground/40">At checkout</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg mb-4 text-sm shadow-lg flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-xs text-center text-foreground/60 mb-4">
                  Estimated Delivery:{" "}
                  <span className="font-semibold text-foreground">
                    2–5 days
                  </span>
                </p>
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-sm text-foreground mb-3">
                    Have a Referral code?
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Referral Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && applyCoupon()}
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ fontSize: "16px" }}
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-foreground text-background font-semibold rounded-lg text-sm disabled:opacity-50"
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

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
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-semibold rounded-lg"
              >
                Add Item {p.id}
              </button>
            ))}
          </div>
        </div>
      )}
      <CartPage />
    </div>
  );
}
