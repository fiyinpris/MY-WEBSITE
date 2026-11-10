import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  Smartphone,
  Banknote,
  LogIn,
  MapPin,
  Home,
  Package,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Lock,
  Truck,
  Check,
  Tag,
} from "lucide-react";
import { Modal } from "./ui/Modal";
import { Spinner } from "./ui/Spinner";
import { EmptyState } from "./ui/EmptyState";
import { cn } from "../lib/utils";
import { formatCategory, formatPrice } from "../lib/format";
import { optimizeImage, handleImageError } from "../lib/image";

const CartContext = createContext();
const EASE = [0.22, 1, 0.36, 1];

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
  return (STATE_DELIVERY_FEES[state] || { park: 3500, doorstep: 5500 })[type] || 0;
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

/* -------------------------------------------------------------------------- */
/*  Toast                                                                      */
/* -------------------------------------------------------------------------- */
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[10050] flex justify-center sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-[calc(var(--nav-height)+0.75rem)]"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lift sm:w-96"
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                toast.type === "error" ? "bg-danger/10 text-danger" : "bg-primary-soft text-primary",
              )}
            >
              {toast.type === "error" ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
            </span>
            <p className="flex-1 text-sm font-medium text-foreground">{toast.message}</p>
            <button onClick={onClose} className="icon-btn !size-8 shrink-0" aria-label="Dismiss notification">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Cart provider                                                              */
/* -------------------------------------------------------------------------- */
export const CartSection = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const toastId = useRef(0);

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
    } catch {
      /* storage full or unavailable */
    }
  }, []);
  const showToast = useCallback((message, type = "success") => {
    toastId.current += 1;
    setToast({ id: toastId.current, message, type });
  }, []);
  const closeToast = useCallback(() => setToast(null), []);

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
      if (product.soldOut) {
        showToast(`${product.name} is sold out`, "error");
        return;
      }
      setCartItems((prev) => {
        const ex = prev.find((i) => i.id === product.id);
        if (ex) {
          if (ex.quantity >= 10) {
            showToast("Maximum quantity (10) reached", "error");
            return prev;
          }
          showToast(`${product.name} added to cart`, "success");
          return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
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
    setCartItems((p) => p.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };
  const clearCart = () => setCartItems([]);
  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, showToast }}
    >
      <Toast toast={toast} onClose={closeToast} />
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartSection");
  return ctx;
};

/* -------------------------------------------------------------------------- */
/*  Shared checkout pieces                                                     */
/* -------------------------------------------------------------------------- */
const Steps = ({ current }) => {
  const steps = ["Cart", "Checkout", "Confirm", "Payment"];
  const idx = steps.indexOf(current);
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Checkout progress">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2 sm:gap-3 last:flex-none">
          <span className="flex items-center gap-2" aria-current={i === idx ? "step" : undefined}>
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                i < idx && "bg-primary text-primary-foreground",
                i === idx && "bg-foreground text-background",
                i > idx && "border text-muted-foreground",
              )}
            >
              {i < idx ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                i === idx ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
            </span>
          </span>
          {i < steps.length - 1 && (
            <span className={cn("h-px flex-1 min-w-3", i < idx ? "bg-primary/50" : "bg-border")} />
          )}
        </li>
      ))}
    </ol>
  );
};

const CheckoutShell = ({ step, title, subtitle, children }) => (
  <div className="container-page pb-20 pt-8 sm:pt-12">
    <div className="mb-8 flex flex-col gap-6 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="w-full lg:max-w-md">
        <Steps current={step} />
      </div>
    </div>
    {children}
  </div>
);

const SummaryRow = ({ label, value, muted, strong, className }) => (
  <div className={cn("flex items-center justify-between gap-4", className)}>
    <span className={cn(strong ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
    <span
      className={cn(
        "tabular-nums",
        strong ? "text-lg font-bold text-foreground" : muted ? "text-muted-foreground" : "font-semibold text-foreground",
      )}
    >
      {value}
    </span>
  </div>
);

const ItemThumb = ({ item, size = "size-16" }) => (
  <div className={cn("relative shrink-0", size)}>
    <img
      src={optimizeImage(item.image || item.img, 200)}
      alt={item.name}
      onError={handleImageError}
      className="size-full rounded-xl bg-muted object-cover"
    />
    {item.quantity > 1 && (
      <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[0.65rem] font-bold text-background">
        {item.quantity}
      </span>
    )}
  </div>
);

const SecureNote = () => (
  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
    <Lock size={12} /> Payments secured & encrypted by <strong className="font-semibold">Paystack</strong>
  </p>
);

const SignInModal = ({ open, onSignIn, onClose }) => (
  <Modal open={open} onClose={onClose} size="sm">
    <div className="text-center">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary-soft">
        <LogIn className="text-primary" size={24} />
      </div>
      <h2 className="text-xl font-bold text-foreground">Sign in to check out</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        You need to be signed in before you can proceed to checkout.
      </p>
      <div className="mt-6 flex flex-col gap-2.5">
        <button onClick={onSignIn} className="btn btn-primary w-full">
          <LogIn size={17} /> Sign in to continue
        </button>
        <button onClick={onClose} className="btn btn-ghost w-full">
          Cancel
        </button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Your cart items will be saved while you sign in.</p>
    </div>
  </Modal>
);

const DeliverySelector = ({ value, onChange, state, error }) => {
  const fees = STATE_DELIVERY_FEES[state] || { park: 3500, doorstep: 5500 };
  return (
    <fieldset>
      <legend className="field-label">
        Delivery method <span className="text-danger">*</span>
        {state && <span className="ml-1 font-normal text-muted-foreground">— {state}</span>}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { type: "doorstep", Icon: Home, label: "Doorstep delivery", desc: "Delivered to your door", fee: fees.doorstep },
          { type: "park", Icon: Package, label: "Park pickup", desc: "Pick up at the nearest park", fee: fees.park },
        ].map(({ type, Icon, label, desc, fee }) => {
          const active = value === type;
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(type)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                active
                  ? "border-primary bg-primary-soft/60 ring-1 ring-primary"
                  : "bg-card hover:border-foreground/30",
                error && !value && "border-danger/60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  active ? "border-primary" : "border-foreground/25",
                )}
              >
                {active && <span className="size-2.5 rounded-full bg-primary" />}
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon size={16} className="text-primary" /> {label}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
              </span>
              <span className="text-sm font-bold text-foreground">{formatPrice(fee)}</span>
            </button>
          );
        })}
      </div>
      {!state && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin size={13} /> Select your state to confirm delivery prices
        </p>
      )}
      {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}
    </fieldset>
  );
};

/* -------------------------------------------------------------------------- */
/*  STEP 2: Checkout form                                                      */
/* -------------------------------------------------------------------------- */
const AUTO_COMPLETE_MAP = {
  fullName: "name",
  email: "email",
  phone: "tel",
  address: "street-address",
  city: "address-level2",
};

const Field = ({ label, name, type = "text", placeholder, required, form, errors, onChange, optional }) => (
  <div>
    <label htmlFor={`field-${name}`} className="field-label">
      {label} {required && <span className="text-danger">*</span>}
      {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
    </label>
    <input
      type={type}
      name={name}
      id={`field-${name}`}
      value={form[name]}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={AUTO_COMPLETE_MAP[name] || "off"}
      aria-invalid={errors[name] ? "true" : undefined}
      className="input"
    />
    {errors[name] && <p className="mt-1.5 text-xs font-medium text-danger">{errors[name]}</p>}
  </div>
);

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
      const saved = JSON.parse(localStorage.getItem("savedShippingInfo") || "{}");
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
    } catch {
      /* ignore malformed saved data */
    }
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
      } catch {
        /* storage unavailable */
      }
    }
    setTimeout(() => {
      setBusy(false);
      onNext({ ...form, deliveryFee, total });
    }, 400);
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

  return (
    <CheckoutShell step="Checkout" title="Checkout" subtitle="Where should we deliver your order?">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-7 xl:col-span-8">
          <div className="surface-card p-5 sm:p-8">
            <h2 className="text-lg font-bold text-foreground">Contact information</h2>
            <div className="mt-5 space-y-4">
              <Field label="Full name" name="fullName" placeholder="Your full name" required form={form} errors={errors} onChange={handleChange} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" name="email" type="email" placeholder="you@example.com" required form={form} errors={errors} onChange={handleChange} />
                <Field label="Phone" name="phone" type="tel" placeholder="080XXXXXXXX" required form={form} errors={errors} onChange={handleChange} />
              </div>
            </div>

            <h2 className="mt-10 border-t pt-8 text-lg font-bold text-foreground">Delivery address</h2>
            <div className="mt-5 space-y-4">
              <Field label="Address" name="address" placeholder="Street address" required form={form} errors={errors} onChange={handleChange} />
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="field-country" className="field-label">
                    Country
                  </label>
                  <select id="field-country" name="country" value={form.country} onChange={handleChange} className="input">
                    {["Nigeria", "Ghana", "Kenya", "South Africa", "Other"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="field-state" className="field-label">
                    State <span className="text-danger">*</span>
                  </label>
                  <select
                    id="field-state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    aria-invalid={errors.state ? "true" : undefined}
                    className="input"
                  >
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="mt-1.5 text-xs font-medium text-danger">{errors.state}</p>}
                </div>
                <Field label="City" name="city" placeholder="City" optional form={form} errors={errors} onChange={handleChange} />
              </div>
            </div>

            <div className="mt-8 border-t pt-8">
              <DeliverySelector
                value={form.deliveryType}
                onChange={(t) => {
                  setForm((p) => ({ ...p, deliveryType: t }));
                  if (errors.deliveryType) setErrors((p) => ({ ...p, deliveryType: "" }));
                }}
                state={form.state}
                error={errors.deliveryType}
              />
            </div>

            <label className="mt-6 flex cursor-pointer items-center gap-3 select-none">
              <input
                type="checkbox"
                name="saveInfo"
                checked={form.saveInfo}
                onChange={handleChange}
                className="size-5 shrink-0 cursor-pointer rounded accent-primary"
              />
              <span className="text-sm text-muted-foreground">Save this information for next time</span>
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={onBack} className="btn btn-outline btn-lg">
              <ChevronLeft size={18} /> Back to cart
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary btn-lg flex-1">
              {busy ? (
                <>
                  <Spinner size={18} /> Processing…
                </>
              ) : (
                <>
                  Review order <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="surface-card p-5 sm:p-6 lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)]">
            <h2 className="text-base font-bold text-foreground">Order summary</h2>
            <ul className="mt-5 space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <ItemThumb item={item} size="size-14" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
                  <span className="text-sm font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-3 border-t pt-5 text-sm">
              <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
              <SummaryRow
                label="Delivery"
                value={deliveryFee > 0 ? formatPrice(deliveryFee) : !form.state ? "Select state" : "Select method"}
                muted={deliveryFee === 0}
              />
              {form.deliveryType && form.state && (
                <p className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <MapPin size={13} className="text-primary" />
                  {form.deliveryType === "doorstep" ? "Doorstep" : "Park pickup"} · {form.state}
                </p>
              )}
              <SummaryRow label="Total" value={formatPrice(total)} strong className="border-t pt-4" />
            </div>
          </div>
        </aside>
      </div>
    </CheckoutShell>
  );
};

/* -------------------------------------------------------------------------- */
/*  STEP 3: Confirm order                                                      */
/* -------------------------------------------------------------------------- */
const ConfirmPage = ({ shippingInfo, onPay, onBack }) => {
  const { cartItems } = useCart();
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = shippingInfo?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  return (
    <CheckoutShell step="Confirm" title="Review your order" subtitle="Check everything looks right before paying.">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          <section className="surface-card overflow-hidden">
            <h2 className="border-b px-5 py-4 text-sm font-bold sm:px-6">Items ordered</h2>
            <ul className="divide-y">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                  <ItemThumb item={item} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{item.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-bold tabular-nums text-foreground">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
              <h2 className="text-sm font-bold">Delivery details</h2>
              <button onClick={onBack} className="text-sm font-semibold text-primary hover:underline">
                Edit
              </button>
            </div>
            <dl className="grid gap-x-8 gap-y-4 p-5 text-sm sm:grid-cols-2 sm:p-6">
              {[
                ["Name", shippingInfo?.fullName],
                ["Email", shippingInfo?.email],
                ["Phone", shippingInfo?.phone],
                ["State", shippingInfo?.state],
                ["Address", `${shippingInfo?.address}${shippingInfo?.city ? ", " + shippingInfo?.city : ""}`],
                ["Method", shippingInfo?.deliveryType === "doorstep" ? "Doorstep delivery" : "Park pickup"],
              ].map(([l, v]) => (
                <div key={l}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{l}</dt>
                  <dd className="mt-1 font-medium text-foreground break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="surface-card space-y-5 p-5 sm:p-6 lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)]">
            <h2 className="text-base font-bold text-foreground">Order summary</h2>
            <div className="space-y-3 text-sm">
              <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
              <SummaryRow
                label={`${shippingInfo?.deliveryType === "doorstep" ? "Doorstep" : "Park pickup"} · ${shippingInfo?.state}`}
                value={formatPrice(deliveryFee)}
              />
              <SummaryRow label="Total" value={formatPrice(total)} strong className="border-t pt-4" />
            </div>
            <button onClick={onPay} className="btn btn-primary btn-lg w-full">
              <ShieldCheck size={18} /> Pay {formatPrice(total)} now
            </button>
            <button onClick={onBack} className="btn btn-ghost w-full">
              <ChevronLeft size={17} /> Edit details
            </button>
            <SecureNote />
          </div>
        </aside>
      </div>
    </CheckoutShell>
  );
};

/* -------------------------------------------------------------------------- */
/*  STEP 4: Payment                                                            */
/* -------------------------------------------------------------------------- */
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
    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) {
      const poll = setInterval(() => {
        if (window.PaystackPop) {
          setScriptState("ready");
          clearInterval(poll);
        }
      }, 300);
      const timeout = setTimeout(() => {
        clearInterval(poll);
        if (!window.PaystackPop) setScriptState("error");
      }, 15000);
      return () => {
        clearInterval(poll);
        clearTimeout(timeout);
      };
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
            { display_name: "Customer Name", variable_name: "customer_name", value: shippingInfo.fullName },
            { display_name: "Phone", variable_name: "phone", value: shippingInfo.phone },
            {
              display_name: "Delivery",
              variable_name: "delivery",
              value: shippingInfo.deliveryType === "doorstep" ? "Doorstep" : "Park Pickup",
            },
            { display_name: "State", variable_name: "state", value: shippingInfo.state },
            {
              display_name: "Address",
              variable_name: "address",
              value: `${shippingInfo.address}${shippingInfo.city ? ", " + shippingInfo.city : ""}, ${shippingInfo.state}`,
            },
          ],
        },
        callback: () => {
          setIsProcessing(false);
          trackPurchase(cartItems, shippingInfo.email);
          showToast("🎉 Payment successful! Your order is confirmed.", "success");
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
      showToast(err.message || "Failed to open payment. Please try again.", "error");
    }
  };

  const methods = [
    { Icon: CreditCard, label: "Pay with card", tone: "bg-[hsl(214_90%_95%)] text-[hsl(214_80%_45%)]" },
    { Icon: Banknote, label: "Pay with transfer", tone: "bg-primary-soft text-primary" },
    { Icon: Building2, label: "Pay with bank", tone: "bg-[hsl(262_80%_95%)] text-[hsl(262_60%_50%)]" },
    { Icon: Smartphone, label: "Pay with USSD", tone: "bg-[hsl(28_95%_93%)] text-[hsl(24_80%_45%)]" },
  ];

  return (
    <div className="container-page max-w-xl pb-20 pt-8 sm:pt-12">
      <Steps current="Payment" />

      <button
        onClick={onBack}
        disabled={isProcessing}
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <ChevronLeft size={17} /> Back to review
      </button>

      <div className="mt-6 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Lock size={22} />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-foreground">Secure checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Pay <span className="font-bold text-foreground">NGN {total.toLocaleString()}</span> for {shippingInfo?.fullName}
        </p>
      </div>

      <div className="surface-card mt-8 overflow-hidden">
        <p className="border-b px-5 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Pay with
        </p>

        {scriptState === "loading" && (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Spinner size={28} className="text-primary" />
            <p className="text-sm text-muted-foreground">Loading secure payment options…</p>
          </div>
        )}

        {scriptState === "error" && (
          <div className="p-10 text-center">
            <AlertCircle className="mx-auto text-danger" size={28} />
            <p className="mt-3 font-semibold text-foreground">Failed to load payment</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your internet connection and try again.</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary btn-sm mt-5">
              Refresh page
            </button>
          </div>
        )}

        {scriptState === "ready" && (
          <ul className="divide-y">
            <li>
              <button
                onClick={pay}
                disabled={isProcessing}
                className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/60 disabled:opacity-50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(0_80%_55%)] text-sm font-bold text-white">
                  Z
                </span>
                <span className="flex flex-1 items-center gap-2 font-semibold text-foreground">
                  Pay with Zap
                  <span className="chip !h-5 bg-[hsl(0_80%_55%)] !px-1.5 text-[0.6rem] text-white">New</span>
                </span>
                <ChevronRight size={18} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
            {methods.map(({ Icon, label, tone }) => (
              <li key={label}>
                <button
                  onClick={pay}
                  disabled={isProcessing}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/60 disabled:opacity-50"
                >
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone)}>
                    <Icon size={19} />
                  </span>
                  <span className="flex-1 font-semibold text-foreground">{label}</span>
                  <ChevronRight size={18} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={pay}
                disabled={isProcessing}
                className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/60 disabled:opacity-50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft font-bold text-primary">
                  O
                </span>
                <span className="flex-1 font-semibold text-foreground">Pay with OPay</span>
                <ChevronRight size={18} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          </ul>
        )}
      </div>

      <div className="mt-6">
        <SecureNote />
      </div>

      <Modal open={isProcessing} onClose={() => {}} dismissible={false} showClose={false} size="sm">
        <div className="flex flex-col items-center py-2 text-center">
          <Spinner size={44} className="text-primary" />
          <h3 className="mt-5 text-lg font-bold text-foreground">Opening payment</h3>
          <p className="mt-1 text-sm text-muted-foreground">Please wait…</p>
        </div>
      </Modal>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Cart page                                                                  */
/* -------------------------------------------------------------------------- */
export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalItems, showToast } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [page, setPage] = useState("cart");
  const [shippingInfo, setShippingInfo] = useState(null);
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
    }, 500);
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
    return <ConfirmPage shippingInfo={shippingInfo} onPay={() => setPage("payment")} onBack={() => setPage("checkout")} />;
  if (page === "payment") return <PaymentPage shippingInfo={shippingInfo} onBack={() => setPage("confirm")} />;

  if (!cartItems.length)
    return (
      <div className="container-page py-16 sm:py-24">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our lighting and creator gear to get started."
        >
          <Link to="/shop" className="btn btn-primary btn-lg">
            Start shopping
          </Link>
          <Link to="/wishlist" className="btn btn-outline btn-lg">
            View wishlist
          </Link>
        </EmptyState>
      </div>
    );

  return (
    <>
      <SignInModal
        open={showSignIn}
        onSignIn={() => {
          setShowSignIn(false);
          sessionStorage.setItem("returnTo", "/cart");
          navigate("/signin");
        }}
        onClose={() => setShowSignIn(false)}
      />

      <CheckoutShell
        step="Cart"
        title="Shopping cart"
        subtitle={`${totalItems} ${totalItems === 1 ? "item" : "items"} in your cart`}
      >
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <section className="lg:col-span-7 xl:col-span-8" aria-label="Cart items">
            <ul className="surface-card divide-y overflow-hidden">
              <AnimatePresence initial={false}>
                {cartItems.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex gap-4 p-4 sm:gap-5 sm:p-6"
                  >
                    <img
                      src={optimizeImage(item.image || item.img, 260)}
                      alt={item.name}
                      onError={handleImageError}
                      className="size-24 shrink-0 rounded-2xl bg-muted object-cover sm:size-28"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {item.category && (
                            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              {formatCategory(item.category)}
                            </p>
                          )}
                          <h3 className="mt-0.5 font-semibold leading-snug text-foreground line-clamp-2">{item.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatPrice(item.price)}
                            {item.oldPrice && (
                              <span className="ml-2 line-through opacity-60">{formatPrice(item.oldPrice)}</span>
                            )}
                          </p>
                        </div>
                        <p className="shrink-0 font-bold tabular-nums text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <div className="inline-flex items-center rounded-full border bg-card p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="icon-btn !size-8 disabled:opacity-35"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="icon-btn !size-8 disabled:opacity-35"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 size={15} /> <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <Link
              to="/shop"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary"
            >
              <ChevronLeft size={16} /> Continue shopping
            </Link>
          </section>

          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="surface-card p-5 sm:p-6 lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)]">
              <h2 className="text-base font-bold text-foreground">Order summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
                {appliedDiscount > 0 && <SummaryRow label="Discount (15%)" value={`−${formatPrice(discount)}`} />}
                <SummaryRow label="Delivery" value="Calculated at checkout" muted />
                <SummaryRow label="Total" value={formatPrice(total)} strong className="border-t pt-4" />
              </div>

              <button onClick={handleCheckout} className="btn btn-primary btn-lg mt-6 w-full">
                Proceed to checkout <ChevronRight size={18} />
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Truck size={14} /> Estimated delivery: <span className="font-semibold text-foreground">2–5 days</span>
              </p>

              <div className="mt-6 border-t pt-6">
                <label htmlFor="coupon" className="field-label flex items-center gap-1.5">
                  <Tag size={14} /> Have a referral code?
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    type="text"
                    placeholder="Referral code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    className="input !h-11 uppercase placeholder:normal-case"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="btn btn-dark h-11 shrink-0 !rounded-xl"
                  >
                    {isApplyingCoupon ? <Spinner size={16} /> : "Apply"}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <SecureNote />
              </div>
            </div>
          </aside>
        </div>
      </CheckoutShell>
    </>
  );
};

export default function CartDemo({ products }) {
  const { addToCart, cartItems } = useCart();
  return (
    <div>
      {cartItems.length === 0 && (
        <div className="surface-card fixed right-4 top-4 z-50 p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Add sample items to cart:</p>
          <div className="flex gap-2">
            {products.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)} className="btn btn-primary btn-sm">
                Add item {p.id}
              </button>
            ))}
          </div>
        </div>
      )}
      <CartPage />
    </div>
  );
}
