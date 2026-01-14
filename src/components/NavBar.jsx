import { cn } from "../lib/utils";
import { useEffect, useState, useContext, useRef } from "react";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Heart,
  Loader2,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./CartSection";
import { useWishlist } from "./WishlistSection";
import { SearchContext } from "./SearchContext";

// Import your actual images
import ringlight from "../Images/image 6.webp";
import tripodStand from "../Images/image 8.jpg";
import ledLight from "../Images/image 10.jpg";
import softbox from "../Images/image 6.webp";
import podcastMic from "../Images/image 5.jpg";
import miniRinglight from "../Images/image 1.jpg";

// ✅ YOUR ACTUAL PRODUCTS
const products = [
  { id: 1, name: "RINGLIGHT", price: 35000, image: miniRinglight },
  { id: 2, name: "TRIPOD STAND", price: 120000, image: tripodStand },
  { id: 3, name: "LEDLIGHT", price: 35000, image: ledLight },
  { id: 4, name: "SOFTBOX", price: 100000, image: softbox },
  { id: 5, name: "PODCAST MICROPHONE", price: 30000, image: podcastMic },
  { id: 6, name: "RINGLIGHT", price: 35000, image: ringlight },
  { id: 101, name: "Ringlight", price: 25000, image: miniRinglight },
  { id: 102, name: "Tripod Stand", price: 20000, image: tripodStand },
  { id: 103, name: "Podcast Mic", price: 18000, image: podcastMic },
  { id: 104, name: "LED Light", price: 30000, image: ledLight },
  { id: 105, name: "Softbox", price: 40000, image: softbox },
];

const navItems = [
  { name: "Home", href: "/" },
  { name: "Our Products", href: "/products" },
  { name: "Shop", href: "/shop" },
  { name: "Contact us", href: "/contact" },
];

// ✅ NEW: Loading Overlay Component
const LoadingOverlay = () => {
  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/20"
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      ></div>

      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl pointer-events-auto">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div
              className="absolute inset-0 border-4 border-green-100 rounded-full animate-spin"
              style={{ animationDuration: "3s" }}
            ></div>
            <div className="absolute inset-2 border-4 border-green-300 rounded-full animate-pulse"></div>
            <div
              className="absolute inset-4 border-4 border-green-600 rounded-full border-t-transparent animate-spin"
              style={{ animationDuration: "1s" }}
            ></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-10 h-10 text-green-600 animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Loading Results
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait...
          </p>
        </div>
      </div>
    </>
  );
};

export const NavBar = () => {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { searchQuery, setSearchQuery } = useContext(SearchContext);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isNavigating, setIsNavigating] = useState(false); // ✅ NEW STATE
  const navigate = useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const location = useLocation();

  // ✅ Autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef(null);
  const accountRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isMobileMenuOpen]);

  const handleNavClick = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const updateUserData = () => {
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      if (storedUser.name) setUserName(storedUser.name);
      if (storedUser.email) setUserEmail(storedUser.email);
    };

    updateUserData();
    window.addEventListener("userUpdated", updateUserData);
    return () => window.removeEventListener("userUpdated", updateUserData);
  }, []);

  const isLoggedIn = userName && userEmail;

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = products
        .filter((product) => product.name.toLowerCase().includes(query))
        .slice(0, 5);

      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth >= 1024) {
        if (accountRef.current && !accountRef.current.contains(event.target)) {
          setIsAccountOpen(false);
        }
      }
    };

    if (isAccountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isAccountOpen]);

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // ✅ UPDATED: Handle suggestion selection WITH LOADING
  const handleSelectSuggestion = (product) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    setIsSearchOpen(false);

    // Show loading overlay
    setIsNavigating(true);

    // Navigate after delay
    setTimeout(() => {
      navigate("/search");
      setIsNavigating(false);
    }, 800);
  };

  // ✅ UPDATED: Handle search submit WITH LOADING
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setShowSuggestions(false);

      // Show loading overlay
      setIsNavigating(true);

      // Navigate after delay
      setTimeout(() => {
        navigate("/search");
        setIsNavigating(false);
      }, 800);
    }
  };

  return (
    <>
      {/* ✅ NEW: Loading Overlay */}
      {isNavigating && <LoadingOverlay />}

      <nav
        className={cn(
          "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
          isScrolled
            ? "py-3 bg-background/80 backdrop-blur-md shadow-sm"
            : "py-4 bg-background"
        )}
      >
        {/* LARGE DESKTOP LAYOUT (lg and above) */}
        <div className="hidden lg:flex w-full items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold text-primary flex items-center"
          >
            <span className="relative z-10">
              <span className="text-glow text-foreground">my.</span>LIGHTSTORE
            </span>
          </Link>

          <div className="flex items-center gap-6 lg:gap-8">
            {!isSearchOpen ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "inline-block text-foreground hover:text-primary transition-colors duration-300 text-base lg:text-lg pb-1 whitespace-nowrap",
                      location.pathname === item.href &&
                        "text-primary border-b-2 border-primary"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            ) : (
              <div
                className="flex items-center gap-2 animate-fadeIn relative"
                ref={searchRef}
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      handleKeyDown(e);
                      if (e.key === "Enter") {
                        handleSearchSubmit();
                      }
                    }}
                    onFocus={() => searchQuery && setShowSuggestions(true)}
                    className="w-[500px] pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    size={18}
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-[60] w-full mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                      <div className="py-1">
                        {suggestions.map((product, index) => (
                          <button
                            key={product.id}
                            onClick={() => handleSelectSuggestion(product)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 transition-colors text-left",
                              index === highlightedIndex
                                ? "bg-primary/10"
                                : "hover:bg-muted"
                            )}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground">
                                {product.name}
                              </div>
                              <div className="text-xs text-primary font-semibold">
                                ₦{product.price.toLocaleString()}
                              </div>
                            </div>
                            <Search
                              size={14}
                              className="text-muted-foreground"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {searchQuery && (
                  <button
                    onClick={handleSearchSubmit}
                    disabled={isNavigating}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {isNavigating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center space-x-3 mr-5">
              <div className="relative group">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Search"
                  className="text-foreground/80 hover:text-primary transition-colors duration-300 hover:scale-110 cursor-pointer p-2"
                >
                  {isSearchOpen ? <X size={22} /> : <Search size={22} />}
                </button>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  {isSearchOpen ? "Close" : "Search"}
                </span>
              </div>

              <div className="relative group">
                <button
                  onClick={() => navigate("/wishlist")}
                  aria-label="Wishlist"
                  className="text-foreground/80 hover:text-primary transition-colors duration-300 hover:scale-110 relative cursor-pointer p-2"
                >
                  <Heart size={22} />
                  {totalWishlistItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {totalWishlistItems}
                    </span>
                  )}
                </button>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  Wishlist
                </span>
              </div>

              <div className="relative group">
                <button
                  onClick={() => navigate("/cart")}
                  aria-label="Shopping Cart"
                  className="text-foreground/80 hover:text-primary transition-colors duration-300 hover:scale-110 relative cursor-pointer p-2"
                >
                  <ShoppingCart size={22} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  Cart
                </span>
              </div>

              <div className="relative group" ref={accountRef}>
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  aria-label="User Account"
                  className="text-foreground/80 hover:text-primary transition-colors duration-300 hover:scale-110 cursor-pointer p-2"
                >
                  <User size={22} />
                </button>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  Account
                </span>

                {isAccountOpen && (
                  <div className="absolute right-0 top-12 w-72 bg-card border border-border rounded-xl shadow-lg p-4 z-50">
                    <button
                      onClick={() => setIsAccountOpen(false)}
                      className="absolute top-4 right-3 text-muted-foreground hover:text-foreground transition-colors p-2 cursor-pointer"
                    >
                      <X size={18} />
                    </button>

                    <h3 className="text-lg font-semibold text-foreground mb-3 pr-6">
                      My Account
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-foreground/70">Name</p>
                        <p className="font-medium text-foreground">
                          {userName || "Not available"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">Email</p>
                        <p className="font-medium text-foreground">
                          {userEmail || "Not available"}
                        </p>
                      </div>
                      <hr className="border-border my-2" />

                      {!isLoggedIn ? (
                        <Link
                          to="/signin"
                          onClick={() => {
                            setIsAccountOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 rounded-md border border-border hover:bg-primary/10 transition-colors"
                        >
                          Sign in
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            localStorage.removeItem("user");
                            setUserName("");
                            setUserEmail("");
                            setIsAccountOpen(false);
                            setIsMobileMenuOpen(false);
                            setShowLogoutPopup(true);
                          }}
                          className="w-full text-left px-4 py-2 rounded-md border border-border hover:bg-primary/10 transition-colors"
                        >
                          Sign out
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MEDIUM SCREEN LAYOUT (md to lg) */}
        <div className="hidden md:flex lg:hidden w-full items-center justify-between px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <Link
            to="/"
            className="text-xl font-bold text-primary flex items-center"
          >
            <span className="relative z-10">
              <span className="text-glow text-foreground">my.</span>LIGHTSTORE
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
              className="text-foreground p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Search size={20} />
            </button>

            <button
              onClick={() => navigate("/wishlist")}
              aria-label="Wishlist"
              className="text-foreground p-2 hover:bg-primary/10 rounded-lg transition-colors relative"
            >
              <Heart size={20} />
              {totalWishlistItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalWishlistItems}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/cart")}
              aria-label="Shopping Cart"
              className="text-foreground p-2 hover:bg-primary/10 rounded-lg transition-colors relative"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground p-2 hover:bg-primary/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE LAYOUT (below md) */}
        <div className="flex md:hidden w-full items-center justify-between">
          {!isSearchOpen && (
            <Link
              to="/"
              className="text-xl sm:text-2xl font-bold text-primary flex items-center px-4"
            >
              <span className="relative z-10">
                <span className="text-glow text-foreground">my.</span>LIGHTSTORE
              </span>
            </Link>
          )}

          {isSearchOpen && (
            <div className="flex-1 relative px-4" ref={searchRef}>
              <div className="relative w-full bg-muted rounded-xl">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    handleKeyDown(e);
                    if (e.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  className="w-full pl-4 pr-24 py-3.5 rounded-xl border-0 bg-muted text-foreground font-normal focus:outline-none focus:ring-0 placeholder:text-foreground/60"
                  autoFocus
                  style={{ fontSize: "16px" }}
                />

                <button
                  onClick={handleSearchSubmit}
                  disabled={isNavigating}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-foreground/70 p-1.5 hover:text-foreground transition-colors disabled:opacity-50"
                  aria-label="Search"
                >
                  {isNavigating ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <Search size={22} />
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 p-1.5 hover:text-foreground transition-colors"
                  aria-label="Close search"
                >
                  <X size={22} />
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-[60] w-full mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden left-0 right-0">
                  <div className="py-1">
                    {suggestions.map((product, index) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectSuggestion(product)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 transition-colors text-left",
                          index === highlightedIndex
                            ? "bg-primary/10"
                            : "hover:bg-muted"
                        )}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-primary font-semibold">
                            ₦{product.price.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isSearchOpen && (
            <div className="flex items-center space-x-2 px-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="text-foreground p-2 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Search size={20} />
              </button>

              <button
                onClick={() => navigate("/cart")}
                aria-label="Shopping Cart"
                className="text-foreground p-2 hover:bg-primary/10 rounded-lg transition-colors relative"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground p-2 hover:bg-primary/10 rounded-lg transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu size={24} />
              </button>
            </div>
          )}
        </div>

        {/* SEARCH MODAL FOR MEDIUM SCREENS */}
        {isSearchOpen && (
          <div
            className="hidden md:block lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setIsSearchOpen(false);
              setShowSuggestions(false);
            }}
          >
            <div
              className="bg-background p-4 max-w-2xl mx-auto mt-20"
              onClick={(e) => e.stopPropagation()}
              ref={searchRef}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    handleKeyDown(e);
                    if (e.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  size={20}
                />
                {searchQuery && (
                  <button
                    onClick={handleSearchSubmit}
                    disabled={isNavigating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isNavigating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </button>
                )}

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-[60] w-full mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                    <div className="py-1">
                      {suggestions.map((product, index) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelectSuggestion(product)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 transition-colors text-left",
                            index === highlightedIndex
                              ? "bg-primary/10"
                              : "hover:bg-muted"
                          )}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">
                              {product.name}
                            </div>
                            <div className="text-xs text-primary font-semibold">
                              ₦{product.price.toLocaleString()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REST OF YOUR EXISTING CODE: MOBILE OVERLAY, SLIDE MENU, ACCOUNT POPUP, LOGOUT POPUP */}
        {/* Keeping all the existing code exactly as is... */}

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div
          className={cn(
            "fixed top-0 right-0 w-[280px] h-screen bg-card border-l border-border z-50 transition-transform duration-300 ease-in-out overflow-y-auto",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex justify-end p-4 border-b border-border sticky top-0 bg-card z-10">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col p-6 space-y-6 pb-20">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "text-lg py-2 transition-colors duration-300",
                    location.pathname === item.href
                      ? "text-primary font-semibold"
                      : "text-foreground/80 hover:text-primary"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-col space-y-4 pt-4 border-t border-border">
              <button
                onClick={() => {
                  navigate("/wishlist");
                  handleNavClick();
                }}
                className="flex md:hidden items-center space-x-3 text-foreground/80 hover:text-primary transition-colors duration-300 py-2 relative"
              >
                <div className="relative">
                  <Heart size={20} />
                  {totalWishlistItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {totalWishlistItems}
                    </span>
                  )}
                </div>
                <span className="text-lg">Wishlist</span>
              </button>

              <button
                onClick={() => {
                  setIsAccountOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 text-foreground/80 hover:text-primary transition-colors duration-300 py-2"
              >
                <User size={20} />
                <span className="text-lg">Account</span>
              </button>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3 text-foreground/80">
                  {theme === "light" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m8.485-8.485h1M4.515 12.515h1m11.314-7.071l.707.707M6.464 17.536l.707.707M17.536 17.536l.707-.707M6.464 6.464l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                      />
                    </svg>
                  )}
                  <span className="text-lg font-medium">
                    {theme === "light" ? "Night Mode" : "Night Mode"}
                  </span>
                </div>

                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 ${
                    theme === "light" ? "bg-gray-300" : "bg-primary"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                      theme === "light" ? "translate-x-1" : "translate-x-6"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {isAccountOpen && (
          <div
            className="lg:hidden fixed inset-0 flex items-center justify-center z-[999] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAccountOpen(false)}
          >
            <div
              className="relative w-[90%] max-w-sm bg-card border border-border rounded-2xl shadow-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAccountOpen(false)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-2 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center space-y-3 mt-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {userName ? `Hi, ${userName}!` : "Hi there!"}
                </p>
                <p className="text-sm text-foreground/70">
                  {userEmail || "Welcome to my.LIGHTSTORE"}
                </p>
              </div>

              <hr className="border-border my-4" />

              <div className="space-y-3">
                <Link
                  to="/cart"
                  onClick={() => {
                    setIsAccountOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 rounded-md border border-border hover:bg-primary/10 transition-colors mb-4"
                >
                  My Orders
                </Link>

                {!isLoggedIn ? (
                  <Link
                    to="/signin"
                    onClick={() => {
                      setIsAccountOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 rounded-md border border-border hover:bg-primary/10 transition-colors"
                  >
                    Sign in
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      setUserName("");
                      setUserEmail("");
                      setIsAccountOpen(false);
                      setIsMobileMenuOpen(false);
                      setShowLogoutPopup(true);
                    }}
                    className="block w-full text-left px-4 py-2 rounded-md border border-border hover:bg-primary/10 transition-colors"
                  >
                    Sign out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showLogoutPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999] p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg p-6 w-[90%] max-w-sm text-center animate-fadeIn">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-2">
                Logged Out Successfully
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                You have been logged out of your account.
              </p>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
