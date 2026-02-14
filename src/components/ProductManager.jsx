import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Search,
  Filter,
  Lock,
  Loader2,
  Tag,
  Star,
} from "lucide-react";
import { productsAPI, adminAPI } from "../services/firebase";

// ✅ ADMIN EMAIL - Only this email can access
const ADMIN_EMAIL = "fiyinolaleke@gmail.com";

export const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterTag, setFilterTag] = useState("ALL");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [deviceId, setDeviceId] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "RINGLIGHT",
    price: "",
    image: "",
    imageFile: null,
    thumbnail1: "",
    thumbnail2: "",
    videoThumbnail: "",
    description: "",
    badge: "",
    rating: 5,
    tags: {
      sale: false,
      hot: false,
      newArrivals: false,
    },
    discount: "",
    bestSelling: false,
  });

  const PRODUCT_CATEGORIES = [
    "RINGLIGHT",
    "LED LIGHT",
    "INFLUENCER LIGHT",
    "TRIPOD STAND",
    "MICROPHONE",
    "SOFTBOX",
    "ACCESSORIES",
    "BACKDROP",
  ];

  const generateDeviceId = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillText("fingerprint", 2, 2);
    const canvasData = canvas.toDataURL();

    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasData.slice(0, 100),
    };

    return btoa(JSON.stringify(deviceInfo));
  };

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const deviceId = generateDeviceId();
        setDeviceId(deviceId);

        const session = await adminAPI.getSession(deviceId);
        if (session && session.email === ADMIN_EMAIL) {
          setIsAdmin(true);
          setShowPasswordPrompt(false);
          setSessionToken(session.token);
          setAdminEmail(session.email);
        }
      } catch (error) {
        console.error("Error checking admin session:", error);
      }
    };

    checkAdminSession();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
    }
  }, [isAdmin]);

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const loadedProducts = await productsAPI.getAll();
      setProducts(loadedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Error loading products. Please refresh the page.");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result,
          imageFile: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnail1Upload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          thumbnail1: reader.result,
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image file for Thumbnail 1");
    }
  };

  const handleThumbnail2Upload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          thumbnail2: reader.result,
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image file for Thumbnail 2");
    }
  };

  const handleVideoThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          videoThumbnail: reader.result,
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a video file for Video Thumbnail");
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.image) {
      alert("Please fill in all required fields and upload an image");
      return;
    }

    try {
      setIsAddingProduct(true);

      const priceString = String(formData.price).trim();
      const cleanPrice = parseInt(priceString, 10);

      if (isNaN(cleanPrice) || cleanPrice < 0) {
        alert("Please enter a valid price");
        setIsAddingProduct(false);
        return;
      }

      const newProduct = {
        name: formData.name,
        category: formData.category,
        price: cleanPrice,
        image: formData.image,
        thumbnail1: formData.thumbnail1 || "",
        thumbnail2: formData.thumbnail2 || "",
        videoThumbnail: formData.videoThumbnail || "",
        description: formData.description || "",
        badge: formData.badge || "",
        rating: formData.rating || 5,
        tags: formData.tags,
        discount: formData.discount || "",
        bestSelling: formData.bestSelling || false,
      };

      await productsAPI.create(newProduct);
      await loadProducts();
      setShowAddModal(false);
      resetForm();
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert(`Error adding product: ${error.message}`);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleEditProduct = async () => {
    if (!formData.name || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsUpdatingProduct(true);

      const priceString = String(formData.price).trim();
      const cleanPrice = parseInt(priceString, 10);

      if (isNaN(cleanPrice) || cleanPrice < 0) {
        alert("Please enter a valid price");
        setIsUpdatingProduct(false);
        return;
      }

      const updatedProduct = {
        name: formData.name,
        category: formData.category,
        price: cleanPrice,
        image: formData.image || editingProduct.image,
        thumbnail1: formData.thumbnail1 || editingProduct.thumbnail1 || "",
        thumbnail2: formData.thumbnail2 || editingProduct.thumbnail2 || "",
        videoThumbnail:
          formData.videoThumbnail || editingProduct.videoThumbnail || "",
        description: formData.description || "",
        badge: formData.badge || "",
        rating: formData.rating || 5,
        tags: formData.tags,
        discount: formData.discount || "",
        bestSelling: formData.bestSelling || false,
      };

      await productsAPI.update(editingProduct.id, updatedProduct);
      await loadProducts();
      setShowEditModal(false);
      setEditingProduct(null);
      resetForm();
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert(`Error updating product: ${error.message || "Unknown error"}`);
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setIsDeletingProduct(productId);
      await productsAPI.delete(productId);
      await loadProducts();
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(`Error deleting product: ${error.message}`);
    } finally {
      setIsDeletingProduct(null);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      image: product.image,
      imageFile: null,
      thumbnail1: product.thumbnail1 || "",
      thumbnail2: product.thumbnail2 || "",
      videoThumbnail: product.videoThumbnail || "",
      description: product.description || "",
      badge: product.badge || "",
      rating: product.rating || 5,
      tags: product.tags || { sale: false, hot: false, newArrivals: false },
      discount: product.discount || "",
      bestSelling: product.bestSelling || false,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "RINGLIGHT",
      price: "",
      image: "",
      imageFile: null,
      thumbnail1: "",
      thumbnail2: "",
      videoThumbnail: "",
      description: "",
      badge: "",
      rating: 5,
      tags: { sale: false, hot: false, newArrivals: false },
      discount: "",
      bestSelling: false,
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "ALL" || product.category === filterCategory;

    let matchesTag = true;
    if (filterTag === "SALE") {
      matchesTag = product.tags?.sale === true;
    } else if (filterTag === "HOT") {
      matchesTag = product.tags?.hot === true;
    } else if (filterTag === "NEW") {
      matchesTag = product.tags?.newArrivals === true;
    } else if (filterTag === "BESTSELLING") {
      matchesTag = product.bestSelling === true;
    }

    return matchesSearch && matchesCategory && matchesTag;
  });

  const handleAdminLogin = async () => {
    if (adminEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      alert("Access denied. You do not have admin privileges.");
      return;
    }

    if (!adminPassword || adminPassword.length < 6) {
      alert("Please enter a valid password!");
      return;
    }

    const token = btoa(Date.now() + Math.random().toString());
    const session = {
      deviceId: deviceId,
      token: token,
      email: adminEmail,
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    try {
      await adminAPI.saveSession(session);
      setSessionToken(token);
      setIsAdmin(true);
      setShowPasswordPrompt(false);
    } catch (error) {
      console.error("Error saving session:", error);
      alert(`Error logging in: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await adminAPI.deleteSession(deviceId);
        setIsAdmin(false);
        setShowPasswordPrompt(true);
        setAdminPassword("");
        setAdminEmail("");
        setSessionToken("");
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  const renderThumbnailUploads = () => (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">
        Additional Media (2 Images + 1 Video)
      </label>
      <div className="grid grid-cols-3 gap-3">
        <div className="border-2 border-dashed border-border rounded-lg p-2 text-center">
          {formData.thumbnail1 ? (
            <div className="relative">
              <img
                src={formData.thumbnail1}
                alt="Thumbnail 1"
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => setFormData({ ...formData, thumbnail1: "" })}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <Upload
                className="mx-auto text-muted-foreground mb-1"
                size={24}
              />
              <p className="text-xs text-muted-foreground">Image 1</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnail1Upload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-2 text-center">
          {formData.thumbnail2 ? (
            <div className="relative">
              <img
                src={formData.thumbnail2}
                alt="Thumbnail 2"
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => setFormData({ ...formData, thumbnail2: "" })}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <Upload
                className="mx-auto text-muted-foreground mb-1"
                size={24}
              />
              <p className="text-xs text-muted-foreground">Image 2</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnail2Upload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-2 text-center">
          {formData.videoThumbnail ? (
            <div className="relative">
              <video
                src={formData.videoThumbnail}
                className="w-full h-24 object-cover rounded-lg"
                controls={false}
              />
              <button
                onClick={() => setFormData({ ...formData, videoThumbnail: "" })}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-2">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <Upload
                className="mx-auto text-muted-foreground mb-1"
                size={24}
              />
              <p className="text-xs text-muted-foreground">Video</p>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoThumbnailUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Upload 2 additional images and 1 video to show in product details
      </p>
    </div>
  );

  const renderTagsSection = () => {
    const bestSellingCount = products.filter((p) => p.bestSelling).length;

    return (
      <div className="space-y-4">
        {/* Best Selling Section - Prominent */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-700 rounded-xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Star className="text-white fill-white" size={20} />
            </div>
            <label className="block text-base font-bold text-foreground">
              ⭐ Best Selling Product
            </label>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/50 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-800 mb-3">
            <p className="text-sm text-foreground font-semibold mb-2">
              📊 Best Selling Status: {bestSellingCount} product
              {bestSellingCount !== 1 ? "s" : ""} marked
            </p>
            <p className="text-xs text-muted-foreground">
              Mark products as "Best Selling" to feature them in the homepage
              carousel. You can select as many as you want!
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-colors border-2 hover:bg-white/70 dark:hover:bg-yellow-900/40 border-transparent hover:border-yellow-400">
            <input
              type="checkbox"
              checked={formData.bestSelling}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  bestSelling: e.target.checked,
                });
              }}
              className="w-6 h-6 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500 cursor-pointer"
            />
            <span className="text-sm font-semibold flex-1">
              ⭐ Mark as Best Selling (Shows on homepage carousel)
            </span>
          </label>
        </div>

        {/* Homepage Featured Sections */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Tag className="text-white" size={20} />
            </div>
            <label className="block text-base font-bold text-foreground">
              Homepage Featured Sections
            </label>
          </div>
          <p className="text-sm text-muted-foreground mb-4 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            💡 <strong>Optional:</strong> Check tags to also display this
            product in specific sections on the homepage.
          </p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-white/70 dark:hover:bg-blue-900/40 p-3 rounded-lg transition-colors border-2 border-transparent hover:border-red-300">
              <input
                type="checkbox"
                checked={formData.tags.sale}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: { ...formData.tags, sale: e.target.checked },
                  })
                }
                className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
              />
              <span className="text-sm font-semibold flex-1">
                🔥 SALE - Display in "Sale" section
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer hover:bg-white/70 dark:hover:bg-blue-900/40 p-3 rounded-lg transition-colors border-2 border-transparent hover:border-orange-300">
              <input
                type="checkbox"
                checked={formData.tags.hot}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: { ...formData.tags, hot: e.target.checked },
                  })
                }
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
              />
              <span className="text-sm font-semibold flex-1">
                ⚡ HOT - Display in "Hot" section
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer hover:bg-white/70 dark:hover:bg-blue-900/40 p-3 rounded-lg transition-colors border-2 border-transparent hover:border-green-300">
              <input
                type="checkbox"
                checked={formData.tags.newArrivals}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: { ...formData.tags, newArrivals: e.target.checked },
                  })
                }
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
              />
              <span className="text-sm font-semibold flex-1">
                ✨ NEW ARRIVALS - Display in "New Arrivals" section
              </span>
            </label>
          </div>

          <div className="mt-5 pt-4 border-t-2 border-blue-200 dark:border-blue-800">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Discount Badge (Optional)
            </label>
            <input
              type="text"
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: e.target.value })
              }
              placeholder="e.g., SAVE 90%"
              className="w-full px-4 py-2.5 border-2 border-border rounded-lg bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              💳 This will show as a red badge on the product card (e.g., "SAVE
              90%")
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Password prompt
  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Admin Access Required
            </h2>
            <p className="text-muted-foreground mb-4">
              This area is restricted to authorized administrators only
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                🔒 <strong>Security Notice:</strong> Access is logged and
                monitored
              </p>
            </div>
          </div>

          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="Enter admin email"
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-3"
            autoFocus
          />

          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
          />

          <button
            onClick={handleAdminLogin}
            disabled={!adminEmail || !adminPassword}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Access Admin Panel
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Session will remain active for 7 days on this device
          </p>
        </div>
      </div>
    );
  }

  const bestSellingCount = products.filter((p) => p.bestSelling).length;

  return (
    <div className="admin-product-manager min-h-screen bg-background p-4 md:p-8 mt-14">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Product Management
              </h1>
              <p className="text-muted-foreground">
                Manage your store's products - {products.length} total products
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 font-semibold">
                ⭐ Best Selling: {bestSellingCount} product
                {bestSellingCount !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-primary mt-1">
                Logged in as: {adminEmail}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center"
              >
                <Plus size={20} />
                Add New Product
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center"
              >
                <Lock size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Tag
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="pl-10 pr-8 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="ALL">All Tags</option>
                <option value="BESTSELLING">⭐ BEST SELLING</option>
                <option value="SALE">🔥 SALE</option>
                <option value="HOT">⚡ HOT</option>
                <option value="NEW">✨ NEW ARRIVALS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-card rounded-lg shadow-md hover:shadow-xl overflow-hidden transition-all duration-300"
                >
                  {/* Image Section */}
                  <div className="relative h-48 md:h-52 bg-gray-100 dark:bg-gray-800">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Best Selling Badge - Top Left, Most Prominent */}
                    {product.bestSelling && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-lg flex items-center gap-1">
                        <Star size={12} className="fill-white" />
                        BEST SELLING
                      </span>
                    )}

                    {/* Other Tags - Below Best Selling */}
                    <div className="absolute top-12 left-2 flex flex-col gap-1">
                      {product.tags?.sale && (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-md">
                          SALE
                        </span>
                      )}
                      {product.tags?.hot && (
                        <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-md">
                          HOT
                        </span>
                      )}
                      {product.tags?.newArrivals && (
                        <span className="bg-green-500 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow-md">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Discount Badge - Right side */}
                    {product.discount && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md">
                        {product.discount}
                      </span>
                    )}
                  </div>

                  {/* Product Info Section */}
                  <div className="p-4">
                    {/* Category Badge */}
                    <div className="mb-2">
                      <span className="inline-block text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-sm font-bold text-foreground mb-2 line-clamp-2 h-10">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-4">
                      ₦{product.price.toLocaleString()}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        disabled={isDeletingProduct === product.id}
                        className="flex-1 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-medium py-2 rounded-md transition-all flex items-center justify-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={isDeletingProduct === product.id}
                        className="flex-1 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium py-2 rounded-md transition-all flex items-center justify-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeletingProduct === product.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={14} />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="bg-card rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  No Products Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ||
                  filterCategory !== "ALL" ||
                  filterTag !== "ALL"
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first product"}
                </p>
                {!searchQuery &&
                  filterCategory === "ALL" &&
                  filterTag === "ALL" && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add First Product
                    </button>
                  )}
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal - Same code for both, just showing the tags section rendering */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {showAddModal ? "Add New Product" : "Edit Product"}
                  </h2>
                  <button
                    onClick={() => {
                      showAddModal
                        ? setShowAddModal(false)
                        : setShowEditModal(false);
                      if (showEditModal) setEditingProduct(null);
                      resetForm();
                    }}
                    disabled={isAddingProduct || isUpdatingProduct}
                    className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      disabled={isAddingProduct || isUpdatingProduct}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      disabled={isAddingProduct || isUpdatingProduct}
                      placeholder="Enter product name"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      disabled={isAddingProduct || isUpdatingProduct}
                      placeholder="16000"
                      step="1"
                      min="0"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter whole numbers only (e.g., 16000, not 16000.50)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Main Product Image *
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      {formData.image ? (
                        <div className="relative">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />
                          <button
                            onClick={() =>
                              setFormData({
                                ...formData,
                                image: "",
                                imageFile: null,
                              })
                            }
                            disabled={isAddingProduct || isUpdatingProduct}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <Upload
                            className="mx-auto text-muted-foreground mb-2"
                            size={48}
                          />
                          <p className="text-foreground font-medium mb-1">
                            Click to upload image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isAddingProduct || isUpdatingProduct}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {renderThumbnailUploads()}

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      disabled={isAddingProduct || isUpdatingProduct}
                      placeholder="Product description..."
                      rows="3"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
                    />
                  </div>

                  {renderTagsSection()}

                  <button
                    onClick={
                      showAddModal ? handleAddProduct : handleEditProduct
                    }
                    disabled={isAddingProduct || isUpdatingProduct}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAddingProduct || isUpdatingProduct ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {showAddModal
                          ? "Adding Product..."
                          : "Updating Product..."}
                      </>
                    ) : showAddModal ? (
                      "Add Product"
                    ) : (
                      "Update Product"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
