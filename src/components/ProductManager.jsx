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
} from "lucide-react";

// ✅ ADMIN EMAIL - Only this email can access
const ADMIN_EMAIL = "fiyinolaleke@gmail.com";

export const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [deviceId, setDeviceId] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "RINGLIGHT",
    price: "",
    image: "",
    imageFile: null,
    thumbnail1: "", // First image thumbnail
    thumbnail2: "", // Second image thumbnail
    videoThumbnail: "", // Video thumbnail
    description: "",
    badge: "",
    rating: 5,
  });

  // Product categories
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

  // Generate device fingerprint
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

  // ✅ Check admin session with EMAIL verification
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const deviceId = generateDeviceId();
        setDeviceId(deviceId);

        if (typeof window !== "undefined" && window.storage) {
          const result = await window.storage.get("admin-session");
          if (result && result.value) {
            const session = JSON.parse(result.value);

            // ✅ Verify device, expiry, AND admin email
            if (
              session.deviceId === deviceId &&
              session.expiry > Date.now() &&
              session.email === ADMIN_EMAIL
            ) {
              setIsAdmin(true);
              setShowPasswordPrompt(false);
              setSessionToken(session.token);
              setAdminEmail(session.email);
            }
          }
        } else {
          const stored = localStorage.getItem("admin-session");
          if (stored) {
            const session = JSON.parse(stored);
            if (
              session.deviceId === deviceId &&
              session.expiry > Date.now() &&
              session.email === ADMIN_EMAIL
            ) {
              setIsAdmin(true);
              setShowPasswordPrompt(false);
              setSessionToken(session.token);
              setAdminEmail(session.email);
            }
          }
        }
      } catch (error) {
        console.error("Error checking admin session:", error);
      }
    };

    checkAdminSession();
  }, []);

  // Load products from storage
  useEffect(() => {
    if (isAdmin) {
      loadProducts();
    }
  }, [isAdmin]);

  const loadProducts = async () => {
    try {
      if (typeof window !== "undefined" && window.storage) {
        const result = await window.storage.get("products-database", true);
        if (result && result.value) {
          setProducts(JSON.parse(result.value));
        }
      } else {
        const stored = localStorage.getItem("products-database");
        if (stored) {
          setProducts(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

const saveProducts = (updatedProducts) => {
  try {
    localStorage.setItem(
      "products-database",
      JSON.stringify(updatedProducts)
    );
    setProducts(updatedProducts);
  } catch (error) {
    console.error("Error saving products:", error);
    alert("Error saving products!");
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

    const newProduct = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      price: parseInt(formData.price),
      image: formData.image,
      thumbnail1: formData.thumbnail1,
      thumbnail2: formData.thumbnail2,
      videoThumbnail: formData.videoThumbnail,
      description: formData.description,
      badge: formData.badge,
      rating: formData.rating,
      createdAt: new Date().toISOString(),
    };

    await saveProducts([...products, newProduct]);
    setShowAddModal(false);
    resetForm();
    alert("Product added successfully!");
  };

  const handleEditProduct = async () => {
    if (!formData.name || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    const updatedProduct = {
      ...editingProduct,
      name: formData.name,
      category: formData.category,
      price: parseInt(formData.price),
      image: formData.image || editingProduct.image,
      thumbnail1: formData.thumbnail1,
      thumbnail2: formData.thumbnail2,
      videoThumbnail: formData.videoThumbnail,
      description: formData.description,
      badge: formData.badge,
      rating: formData.rating,
      updatedAt: new Date().toISOString(),
    };

    const updated = products.map((p) =>
      p.id === editingProduct.id ? updatedProduct : p,
    );
    await saveProducts(updated);
    setShowEditModal(false);
    setEditingProduct(null);
    resetForm();
    alert("Product updated successfully!");
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const updated = products.filter((p) => p.id !== productId);
    await saveProducts(updated);
    alert("Product deleted successfully!");
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      image: product.image,
      imageFile: null,
      thumbnail1: product.thumbnail1 || "",
      thumbnail2: product.thumbnail2 || "",
      videoThumbnail: product.videoThumbnail || "",
      description: product.description || "",
      badge: product.badge || "",
      rating: product.rating || 5,
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
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "ALL" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ✅ ADMIN LOGIN - Verify both email and password
  const handleAdminLogin = async () => {
    // Check email first
    if (adminEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      alert("Access denied. You do not have admin privileges.");
      return;
    }

    // Simple password check (you should use a proper password in production)
    if (!adminPassword || adminPassword.length < 6) {
      alert("Please enter a valid password!");
      return;
    }

    // Both email and password correct
    const token = btoa(Date.now() + Math.random().toString());
    const session = {
      deviceId: deviceId,
      token: token,
      email: adminEmail,
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    try {
      if (typeof window !== "undefined" && window.storage) {
        await window.storage.set("admin-session", JSON.stringify(session));
      } else {
        localStorage.setItem("admin-session", JSON.stringify(session));
      }
    } catch (error) {
      console.error("Error saving admin session:", error);
    }

    setSessionToken(token);
    setIsAdmin(true);
    setShowPasswordPrompt(false);
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        if (typeof window !== "undefined" && window.storage) {
          await window.storage.delete("admin-session");
        } else {
          localStorage.removeItem("admin-session");
        }
      } catch (error) {
        console.error("Error removing admin session:", error);
      }

      setIsAdmin(false);
      setShowPasswordPrompt(true);
      setAdminPassword("");
      setAdminEmail("");
      setSessionToken("");
    }
  };

  // Render thumbnail upload section
  const renderThumbnailUploads = () => (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">
        Additional Media (2 Images + 1 Video)
      </label>
      <div className="grid grid-cols-3 gap-3">
        {/* Thumbnail 1 - Image */}
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

        {/* Thumbnail 2 - Image */}
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

        {/* Video Thumbnail */}
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

          {/* ✅ EMAIL INPUT */}
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="Enter admin email"
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-3"
            autoFocus
          />

          {/* PASSWORD INPUT */}
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 mt-14">
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
          </div>
        </div>

        {/* ✅ RESPONSIVE Products Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-40 sm:h-48 md:h-56 bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.badge && (
                  <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="p-3 sm:p-5">
                <div className="mb-2">
                  <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-foreground mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-base sm:text-xl font-bold text-primary mb-3 sm:mb-4">
                  ₦{product.price.toLocaleString()}
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold py-2 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <Edit size={14} className="sm:w-4 sm:h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 font-semibold py-2 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    Delete
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
              {searchQuery || filterCategory !== "ALL"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            {!searchQuery && filterCategory === "ALL" && (
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

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Add New Product
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
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
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      placeholder="Enter product name"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      placeholder="25000"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
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
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
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
                      placeholder="Product description..."
                      rows="3"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <button
                    onClick={handleAddProduct}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Add Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Edit Product
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
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
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      placeholder="Enter product name"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
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
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
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
                            Click to upload new image
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
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
                      rows="3"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <button
                    onClick={handleEditProduct}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Update Product
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
