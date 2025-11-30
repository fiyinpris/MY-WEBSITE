import { cn } from "../lib/utils";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, User, Search, Menu, X, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartSection"; // ✅ Import useCart
import { useWishlist } from "./WishlistSection"; // ✅ Import useWishlist

const navItems = [
  { name: "Home", href: "/" },
  { name: "Our Products", href: "/products" },
  { name: "Shop", href: "/shop" },
  { name: "Contact us", href: "/contact" },
];

export const NavBar = () => {
  const { totalItems } = useCart(); // ✅ Get total items from cart
  const { totalWishlistItems } = useWishlist(); // ✅ Get total wishlist items
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("light");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Disable background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isMobileMenuOpen]);

  // Close menu when clicking nav link
  const handleNavClick = () => setIsMobileMenuOpen(false);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // ✅ Fetch user info from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    if (storedUser.name) setUserName(storedUser.name);
    if (storedUser.email) setUserEmail(storedUser.email);
  }, []);

  // ✅ Check if user is logged in
  const isLoggedIn = userName && userEmail;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "py-3 bg-background/80 backdrop-blur-md shadow-sm"
          : "py-4 bg-background"
      )}
    >
      <div className="container flex items-center justify-between px-4 md:px-8 lg:px-12">
        <Link
          to="/"
          className="text-2xl font-bold text-primary flex items-center"
        >
          <span className="relative z-10">
            <span className="text-glow text-foreground">my.</span>LIGHTSTORE
          </span>
        </Link>

        {/* Desktop view */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8 lg:mr-10 relative">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-foreground/80 hover:text-primary transition-colors duration-300 font-medium text-sm md:text-base lg:text-lg"
            >
              {item.name}
            </Link>
          ))}

          {/* Desktop Icons */}
          <div className="flex items-center space-x-4 ml-4 relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
              className="text-foreground/80 hover:text-primary transition-colors duration-300 hover:scale-110 transition-transform"
            >
              <Search size={22} />
            </button>

            {/* ✅ WISHLIST WITH BADGE */}
            <button
              onClick={() => navigate("/wishlist")}
              aria-label="Wishlist"
              className="text-foreground/80 cursor-pointer hover:text-primary transition-colors duration-300 hover:scale-110 transition-transform relative"
            >
              <Heart size={22} />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalWishlistItems}
                </span>
              )}
            </button>

            {/* ✅ SHOPPING CART WITH BADGE */}
            <button
              onClick={() => navigate("/cart")}
              aria-label="Shopping Cart"
              className="text-foreground/80 cursor-pointer hover:text-primary transition-colors duration-300 hover:scale-110 transition-transform relative"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              aria-label="User Account"
              className="text-foreground/80 hover:text-primary transition-colors duration-300 hover:scale-110 transition-transform"
            >
              <User size={22} />
            </button>

            {/* ACCOUNT DROPDOWN */}
            {isAccountOpen && (
              <div className="fixed right-4 top-20 w-72 bg-card border border-border rounded-xl shadow-lg p-4 z-50 hidden md:block">
                {/* Close Button */}
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
                      {userName || "Guest User"}
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
                        navigate("/signin");
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

        {/* ✅ MOBILE ICONS - Search, Cart, and Hamburger */}
        <div className="flex md:hidden items-center">
          {/* Mobile Search Icon */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Search"
            className="text-foreground p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Search size={20} />
          </button>

          {/* Mobile Cart Icon with Badge */}
          <button
            onClick={() => navigate("/cart")}
            aria-label="Shopping Cart"
            className="text-foreground p-2 hover:bg-primary/10 rounded-lg transition-colors relative"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Menu */}
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

      {/* SEARCH DROPDOWN */}
      {isSearchOpen && (
        <div
          ref={searchRef}
          className="absolute left-0 top-full w-full bg-card border-t border-border shadow-md z-50 animate-slideDown"
        >
          <div className="container mx-auto max-w-2xl px-4 py-4 relative">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
            >
              <X size={20} />
            </button>
            <input
              type="text"
              placeholder="Search content tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background text-foreground focus:outline-none"
            />
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Searching for:{" "}
                <span className="font-medium">{searchQuery}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE SLIDE MENU */}
      <div
        className={cn(
          "fixed top-0 right-0 w-[280px] h-screen bg-card border-l border-border z-50 md:hidden transition-transform duration-300 ease-in-out overflow-y-auto",
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
                className="text-foreground hover:text-primary transition-colors duration-300 text-lg text-foreground/80 py-2 border-b border-border/50"
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
              className="flex items-center space-x-3 text-foreground/80 hover:text-primary transition-colors duration-300 py-2 relative"
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

            {/* THEME TOGGLE */}
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

              {/* Toggle Button */}
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

      {/* ✅ ACCOUNT POPUP — CENTERED ON SMALL SCREEN */}
      {isAccountOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[999] bg-black/50 backdrop-blur-sm md:hidden">
          <div className="relative w-[90%] max-w-sm bg-card border border-border rounded-2xl shadow-lg p-6">
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
                    alert("You have been logged out successfully.");
                    navigate("/signin");
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs z-[9999]">
          <div className="bg-card border border-border rounded-xl shadow-lg p-6 w-[90%] max-w-sm text-center animate-fadeIn">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Logged Out
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              You have been logged out successfully.
            </p>
            <button
              onClick={() => setShowLogoutPopup(false)}
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/80 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
