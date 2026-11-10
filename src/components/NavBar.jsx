import { cn } from "../lib/utils";
import { useEffect, useState, useContext, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Heart,
  ArrowRight,
  CornerDownLeft,
  LogIn,
  LogOut,
  Wrench,
  Check,
  MessageCircle,
} from "lucide-react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import { SearchContext } from "./SearchContext";
import { Logo } from "./ui/Logo";
import { Modal } from "./ui/Modal";
import { useScrollLock } from "./ui/useScrollLock";
import { ThemeToggle, ThemeSwitch } from "./ThemeToggle";
import { formatPrice, categoryNavLabel, PRODUCT_CATEGORIES } from "../lib/format";
import { optimizeImage, handleImageError } from "../lib/image";
import { STORE_CONTACT } from "../lib/contact";

// ✅ ADMIN EMAIL CONSTANT
const ADMIN_EMAIL = "fiyinolaleke@gmail.com";
const EASE = [0.22, 1, 0.36, 1];

const navItems = [
  { name: "Home", href: "/" },
  { name: "Our Products", href: "/products" },
  { name: "Shop", href: "/shop" },
  { name: "Contact us", href: "/contact" },
];

/** Wraps an icon button with a small tooltip shown underneath on desktop. */
const Tip = ({ label, children, className }) => (
  <span className={cn("group/tip relative inline-flex", className)}>
    {children}
    <span className="nav-tip hidden lg:block" aria-hidden="true">
      {label}
    </span>
  </span>
);

/* -------------------------------------------------------------------------- */
/*  Account panel (shared by the desktop dropdown and the mobile modal)        */
/* -------------------------------------------------------------------------- */
const AccountPanel = ({ userName, userEmail, isLoggedIn, isAdmin, onAdmin, onSignIn, onSignOut, onNavigate }) => (
  <div>
    <div className="flex items-center gap-3">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-bold text-primary">
        {userName ? userName.charAt(0).toUpperCase() : <User size={20} />}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">{isLoggedIn ? `Hi, ${userName.split(" ")[0]}` : "Welcome"}</p>
        <p className="truncate text-sm text-muted-foreground">{userEmail || "Sign in for a faster checkout"}</p>
      </div>
    </div>

    <div className="mt-5 space-y-1">
      {/* ✅ Admin Link - ONLY for the store admin */}
      {isAdmin && (
        <button
          onClick={onAdmin}
          className="flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary-soft px-3 py-2.5 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          <Wrench size={17} /> Manage Products
        </button>
      )}
      <Link
        to="/wishlist"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-muted"
      >
        <Heart size={17} /> My wishlist
      </Link>
      <Link
        to="/cart"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-muted"
      >
        <ShoppingBag size={17} /> My cart &amp; orders
      </Link>
    </div>

    <div className="mt-4 border-t pt-4">
      {!isLoggedIn ? (
        <Link to="/signin" onClick={onSignIn} className="btn btn-primary w-full">
          <LogIn size={17} /> Sign in
        </Link>
      ) : (
        <button onClick={onSignOut} className="btn btn-outline w-full">
          <LogOut size={17} /> Sign out
        </button>
      )}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Search overlay (command-palette style, all screen sizes)                  */
/* -------------------------------------------------------------------------- */
const SearchOverlay = ({ open, onClose, products }) => {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const navigate = useNavigate();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  useScrollLock(open);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 6);
  }, [searchQuery, products]);

  const availableCategories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return PRODUCT_CATEGORIES.filter((c) => present.has(c));
  }, [products]);

  useEffect(() => setHighlightedIndex(-1), [searchQuery]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const submit = () => {
    if (!searchQuery.trim()) return;
    onClose();
    navigate("/search");
  };

  const selectProduct = (product) => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setHighlightedIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) selectProduct(suggestions[highlightedIndex]);
      else submit();
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[10000]" role="dialog" aria-modal="true" aria-label="Search products">
          <motion.div
            className="absolute inset-0 bg-[hsl(160_25%_4%/0.5)] backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative mx-auto w-full max-w-2xl px-3 pt-3 sm:px-6 sm:pt-[12vh]"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="overflow-hidden rounded-3xl border bg-card shadow-lift">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="flex items-center gap-3 border-b px-4 sm:px-5"
              >
                <Search size={20} className="shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search ringlights, tripods, mics…"
                  aria-label="Search products"
                  aria-autocomplete="list"
                  className="h-16 w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/80 focus:outline-none sm:text-lg [&::-webkit-search-cancel-button]:hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      inputRef.current?.focus();
                    }}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
                <button type="button" onClick={onClose} className="icon-btn -mr-2" aria-label="Close search">
                  <X size={19} />
                </button>
              </form>

              <div className="max-h-[60dvh] overflow-y-auto p-2">
                {!searchQuery.trim() && (
                  <div className="p-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Browse categories</p>
                    <div className="flex flex-wrap gap-2">
                      {(availableCategories.length ? availableCategories : PRODUCT_CATEGORIES).map((c, i) => (
                        <motion.button
                          key={c}
                          type="button"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + i * 0.03 }}
                          onClick={() => {
                            onClose();
                            navigate(`/shop?category=${encodeURIComponent(c)}`);
                          }}
                          className="rounded-full border px-3.5 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                        >
                          {categoryNavLabel(c)}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery.trim() && suggestions.length > 0 && (
                  <ul role="listbox" aria-label="Suggestions">
                    {suggestions.map((product, index) => (
                      <li key={product.id} role="option" aria-selected={index === highlightedIndex}>
                        <button
                          type="button"
                          onClick={() => selectProduct(product)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                            index === highlightedIndex ? "bg-muted" : "hover:bg-muted",
                          )}
                        >
                          <img
                            src={optimizeImage(product.image, 120)}
                            alt=""
                            onError={handleImageError}
                            className="size-12 shrink-0 rounded-xl bg-muted object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{categoryNavLabel(product.category)}</p>
                          </div>
                          <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {searchQuery.trim() && suggestions.length === 0 && (
                  <p className="px-4 py-6 text-sm text-muted-foreground">
                    No product names match “{searchQuery}”. Press Enter to search descriptions and categories.
                  </p>
                )}

                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={submit}
                    className="mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                  >
                    <span className="flex items-center gap-2">
                      <Search size={16} /> See all results for “{searchQuery.trim()}”
                    </span>
                    <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                      <CornerDownLeft size={13} /> Enter
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

/* -------------------------------------------------------------------------- */
/*  Mobile / tablet slide-out menu                                             */
/* -------------------------------------------------------------------------- */
const MobileMenu = ({ open, onClose, pathname, totalWishlistItems, isAdmin, onAdmin, onAccount }) => {
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.div
            className="absolute inset-0 bg-[hsl(160_25%_4%/0.5)] backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-[100dvh] w-[86%] max-w-sm flex-col bg-card shadow-lift"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="flex h-[var(--nav-height)] items-center justify-between border-b px-5">
              <Logo onClick={onClose} />
              <button onClick={onClose} className="icon-btn -mr-2" aria-label="Close menu">
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
              <ul className="space-y-1">
                {navItems.map((item, i) => {
                  const active = pathname === item.href;
                  return (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05, duration: 0.4, ease: EASE }}
                    >
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-3 py-3.5 text-[1.35rem] font-semibold tracking-tight transition-colors",
                          active ? "text-primary" : "text-foreground hover:bg-muted",
                        )}
                      >
                        {item.name}
                        <ArrowRight size={18} className={cn("transition-opacity", active ? "opacity-100" : "opacity-30")} />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-6 space-y-1 border-t pt-6">
                {/* ✅ Admin Link in Mobile Menu - ONLY for the store admin */}
                {isAdmin && (
                  <button
                    onClick={onAdmin}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold text-primary transition-colors hover:bg-primary-soft"
                  >
                    <Wrench size={19} /> Manage Products
                  </button>
                )}
                <Link
                  to="/wishlist"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-3 font-medium text-foreground/85 transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <Heart size={19} /> Wishlist
                  </span>
                  {totalWishlistItems > 0 && (
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                      {totalWishlistItems}
                    </span>
                  )}
                </Link>
                <button
                  onClick={onAccount}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-medium text-foreground/85 transition-colors hover:bg-muted"
                >
                  <User size={19} /> Account
                </button>
                <ThemeSwitch />
              </div>
            </nav>

            <div className="border-t px-5 py-5">
              <a href={STORE_CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
                <MessageCircle size={17} /> Chat with us on WhatsApp
              </a>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

/* -------------------------------------------------------------------------- */
/*  NavBar                                                                     */
/* -------------------------------------------------------------------------- */
export const NavBar = () => {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  // ✅ Products come from the shared SearchContext (already loaded + refreshed)
  const { allProducts } = useContext(SearchContext);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const accountRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut: "/" or Ctrl/Cmd+K opens search
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const updateUserData = () => {
      let storedUser = {};
      try {
        storedUser = JSON.parse(localStorage.getItem("user")) || {};
      } catch {
        storedUser = {};
      }
      setUserName(storedUser.name || "");
      setUserEmail(storedUser.email || "");
    };
    updateUserData();
    window.addEventListener("userUpdated", updateUserData);
    return () => window.removeEventListener("userUpdated", updateUserData);
  }, []);

  const isLoggedIn = Boolean(userName && userEmail);
  // ✅ Check if current user is admin
  const isAdmin = isLoggedIn && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Desktop dropdown: close on outside click / Escape
  useEffect(() => {
    if (!isAccountOpen || !isDesktop) return;
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setIsAccountOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setIsAccountOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [isAccountOpen, isDesktop]);

  // ✅ Handle admin link click
  const handleAdminClick = (e) => {
    e?.preventDefault();
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/admin/products");
  };

  const handleSignInClick = () => {
    // Save current page before redirecting
    sessionStorage.setItem("returnTo", location.pathname);
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUserName("");
    setUserEmail("");
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
    setShowLogoutPopup(true);
    window.dispatchEvent(new Event("userUpdated"));
  };

  const accountPanelProps = {
    userName,
    userEmail,
    isLoggedIn,
    isAdmin,
    onAdmin: handleAdminClick,
    onSignIn: handleSignInClick,
    onSignOut: handleSignOut,
    onNavigate: () => setIsAccountOpen(false),
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-[var(--nav-height)] transition-[background-color,box-shadow,border-color] duration-300",
          "border-b backdrop-blur-xl backdrop-saturate-150",
          isScrolled
            ? "border-border bg-background/80 shadow-[0_1px_0_0_hsl(var(--border)),0_8px_24px_-16px_hsl(var(--shadow-color)/0.25)]"
            : "border-transparent bg-background/95",
        )}
      >
        <div className="container-page flex h-full items-center justify-between gap-4">
          <Logo />

          {/* Desktop navigation */}
          <nav className="hidden lg:block" aria-label="Main">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    end={item.href === "/"}
                    className={({ isActive }) =>
                      cn(
                        "relative inline-flex h-10 items-center rounded-full px-4 text-[0.9375rem] font-medium transition-colors",
                        isActive ? "text-foreground" : "text-foreground/65 hover:text-primary",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-0 rounded-full bg-muted"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className="relative">{item.name}</span>
                        {isActive && (
                          <motion.span
                            layoutId="nav-dot"
                            className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Tip label="Search">
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="icon-btn lg:w-auto lg:gap-2 lg:rounded-full lg:border lg:pl-3 lg:pr-2 lg:text-sm lg:text-muted-foreground lg:hover:border-primary/40 lg:hover:text-foreground"
              >
                <Search size={19} />
                <span className="hidden lg:inline">Search</span>
                <kbd className="hidden h-5 items-center rounded-md border bg-muted px-1.5 font-sans text-[0.65rem] font-semibold text-muted-foreground lg:inline-flex">
                  /
                </kbd>
              </button>
            </Tip>

            <Tip label="Wishlist" className="hidden sm:inline-flex">
              <Link to="/wishlist" aria-label={`Wishlist (${totalWishlistItems} items)`} className="icon-btn">
                <Heart size={19} />
                {totalWishlistItems > 0 && <span className="count-badge !bg-danger">{totalWishlistItems}</span>}
              </Link>
            </Tip>

            <Tip label="Cart">
              <Link to="/cart" aria-label={`Cart (${totalItems} items)`} className="icon-btn">
                <ShoppingBag size={19} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      className="count-badge"
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.3, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </Tip>

            {/* Account — dropdown on desktop */}
            <div className="relative hidden lg:block" ref={accountRef}>
              <Tip label="Account">
                <button
                  onClick={() => setIsAccountOpen((o) => !o)}
                  aria-label="Account"
                  aria-expanded={isAccountOpen && isDesktop}
                  aria-haspopup="menu"
                  className="icon-btn"
                >
                  {isLoggedIn ? (
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User size={19} />
                  )}
                </button>
              </Tip>
              <AnimatePresence>
                {isAccountOpen && isDesktop && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="absolute right-0 top-[calc(100%+0.75rem)] w-80 origin-top-right rounded-3xl border bg-card p-5 shadow-lift"
                  >
                    <AccountPanel {...accountPanelProps} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Tip label="Theme" className="hidden lg:inline-flex">
              <ThemeToggle />
            </Tip>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="icon-btn -mr-1.5 lg:hidden"
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} products={allProducts} />

      <MobileMenu
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        pathname={location.pathname}
        totalWishlistItems={totalWishlistItems}
        isAdmin={isAdmin}
        onAdmin={handleAdminClick}
        onAccount={() => {
          setIsMobileMenuOpen(false);
          setIsAccountOpen(true);
        }}
      />

      {/* Account — modal on mobile / tablet */}
      <Modal open={isAccountOpen && !isDesktop} onClose={() => setIsAccountOpen(false)} size="sm" variant="sheet">
        <h2 className="sr-only">My account</h2>
        <AccountPanel {...accountPanelProps} />
      </Modal>

      {/* ✅ LOGOUT CONFIRMATION */}
      <Modal open={showLogoutPopup} onClose={() => setShowLogoutPopup(false)} size="sm" showClose={false}>
        <div className="text-center">
          <motion.div
            className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary-soft"
            initial={{ scale: 0.5, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Check className="text-primary" size={26} strokeWidth={2.5} />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground">Signed out</h2>
          <p className="mt-2 text-sm text-muted-foreground">You have been logged out of your account.</p>
          <button onClick={() => setShowLogoutPopup(false)} className="btn btn-dark mt-6 w-full">
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};
