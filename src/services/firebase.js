import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";

// 🔥 YOUR FIREBASE CONFIG (Database Only - No Storage)
const firebaseConfig = {
  apiKey: "AIzaSyDe09lnanWgfxep2oxh8OdpYfd6uOka3XY",
  authDomain: "my-lightstore.firebaseapp.com",
  projectId: "my-lightstore",
  storageBucket: "my-lightstore.firebasestorage.app",
  messagingSenderId: "194413954719",
  appId: "1:194413954719:web:df733c9d76072d386a44aa",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================== CLOUDINARY CONFIG ====================

// ==================== CLOUDINARY CONFIG ====================

const CLOUDINARY_CLOUD_NAME = "deefu274z"; // ✅ Changed from "my_LIGHTSTORE"
const CLOUDINARY_UPLOAD_PRESET = "lightstore"; // ✅ This is correct
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_VIDEO_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;
// ==================== IMAGE COMPRESSION (Still useful!) ====================

/**
 * ✅ Compress images before uploading to Cloudinary
 */
const compressImage = async (
  base64Image,
  maxWidth = 1200,
  quality = 0.85,
  format = "webp",
) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = format === "webp" ? "image/webp" : "image/jpeg";
      const compressedBase64 = canvas.toDataURL(mimeType, quality);

      const originalSize = (base64Image.length / 1024).toFixed(2);
      const compressedSize = (compressedBase64.length / 1024).toFixed(2);
      const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      console.log(
        `✅ Compressed: ${originalSize}KB → ${compressedSize}KB (${reduction}% reduction)`,
      );

      resolve(compressedBase64);
    };

    img.onerror = (error) => {
      console.error("❌ Error compressing image:", error);
      resolve(base64Image);
    };

    img.src = base64Image;
  });
};

// ==================== CLOUDINARY UPLOAD FUNCTIONS ====================

/**
 * ✅ Upload image to Cloudinary
 * @param {string} base64Image - Base64 encoded image
 * @param {string} folder - Folder name in Cloudinary (e.g., 'products')
 * @param {object} compressionOptions - Compression settings
 * @returns {Promise<string>} - Cloudinary URL
 */
export const uploadImageToCloudinary = async (
  base64Image,
  folder = "products",
  compressionOptions = {},
) => {
  try {
    if (!base64Image || !base64Image.startsWith("data:")) {
      // If it's already a URL, return it
      return base64Image;
    }

    console.log(`📤 Uploading image to Cloudinary (${folder})`);

    // ✅ COMPRESS IMAGE FIRST
    const {
      maxWidth = 1200,
      quality = 0.85,
      format = "webp",
    } = compressionOptions;
    const compressedImage = await compressImage(
      base64Image,
      maxWidth,
      quality,
      format,
    );

    // Create form data
    const formData = new FormData();
    formData.append("file", compressedImage);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Image uploaded to Cloudinary: ${data.secure_url}`);

    return data.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading to Cloudinary:`, error);
    throw error;
  }
};

/**
 * ✅ Upload video to Cloudinary
 * @param {string} base64Video - Base64 encoded video
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<string>} - Cloudinary URL
 */
export const uploadVideoToCloudinary = async (
  base64Video,
  folder = "products",
) => {
  try {
    if (!base64Video || !base64Video.startsWith("data:")) {
      return base64Video;
    }

    console.log(`📤 Uploading video to Cloudinary (${folder})`);

    const formData = new FormData();
    formData.append("file", base64Video);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);

    const response = await fetch(CLOUDINARY_VIDEO_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Cloudinary video upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Video uploaded to Cloudinary: ${data.secure_url}`);

    return data.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading video to Cloudinary:`, error);
    throw error;
  }
};

// ==================== COMPRESSION SETTINGS ====================

const COMPRESSION_SETTINGS = {
  main: {
    maxWidth: 1200,
    quality: 0.85,
    format: "webp",
  },
  thumbnail: {
    maxWidth: 400,
    quality: 0.65,
    format: "webp",
  },
  additionalMedia: {
    maxWidth: 800,
    quality: 0.75,
    format: "webp",
  },
};

// ==================== PRODUCTS API ====================

export const productsAPI = {
  // Get all products
  getAll: async () => {
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Loaded ${products.length} products from Firebase`);
      return products;
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      throw error;
    }
  },

  // Get single product by ID
  getById: async (id) => {
    try {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log(`✅ Found product: ${id}`);
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        console.warn(`⚠️ Product not found: ${id}`);
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching product:", error);
      throw error;
    }
  },

  // Create new product with Cloudinary upload
  create: async (productData) => {
    try {
      console.log("📝 Creating product:", productData.name);

      // ✅ Upload main image to Cloudinary
      let imageUrl = productData.image;
      if (productData.image && productData.image.startsWith("data:")) {
        imageUrl = await uploadImageToCloudinary(
          productData.image,
          "products/main",
          COMPRESSION_SETTINGS.main,
        );
      }

      // ✅ Upload thumbnail 1 to Cloudinary
      let thumbnail1Url = productData.thumbnail1;
      if (
        productData.thumbnail1 &&
        productData.thumbnail1.startsWith("data:")
      ) {
        thumbnail1Url = await uploadImageToCloudinary(
          productData.thumbnail1,
          "products/thumbnails",
          COMPRESSION_SETTINGS.thumbnail,
        );
      }

      // ✅ Upload thumbnail 2 to Cloudinary
      let thumbnail2Url = productData.thumbnail2;
      if (
        productData.thumbnail2 &&
        productData.thumbnail2.startsWith("data:")
      ) {
        thumbnail2Url = await uploadImageToCloudinary(
          productData.thumbnail2,
          "products/thumbnails",
          COMPRESSION_SETTINGS.thumbnail,
        );
      }

      // ✅ Upload video to Cloudinary
      let videoThumbnailUrl = productData.videoThumbnail;
      if (
        productData.videoThumbnail &&
        productData.videoThumbnail.startsWith("data:")
      ) {
        videoThumbnailUrl = await uploadVideoToCloudinary(
          productData.videoThumbnail,
          "products/videos",
        );
      }

      // Create product in Firestore with Cloudinary URLs
      const productsRef = collection(db, "products");
      const docRef = await addDoc(productsRef, {
        ...productData,
        image: imageUrl,
        thumbnail1: thumbnail1Url || "",
        thumbnail2: thumbnail2Url || "",
        videoThumbnail: videoThumbnailUrl || "",
        createdAt: new Date().toISOString(),
      });

      console.log(`✅ Product created with ID: ${docRef.id}`);

      return {
        id: docRef.id,
        ...productData,
        image: imageUrl,
        thumbnail1: thumbnail1Url || "",
        thumbnail2: thumbnail2Url || "",
        videoThumbnail: videoThumbnailUrl || "",
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error creating product:", error);
      throw error;
    }
  },

  // Update product with Cloudinary upload
  update: async (id, productData) => {
    try {
      console.log(`📝 Updating product ${id}:`, productData);

      if (!id) {
        throw new Error("Product ID is required for update");
      }

      const docRef = doc(db, "products", id);

      // Check if document exists first
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Product with ID ${id} does not exist`);
      }

      const existingData = docSnap.data();

      // ✅ Upload new main image if it's base64
      let imageUrl = productData.image;
      if (productData.image && productData.image.startsWith("data:")) {
        imageUrl = await uploadImageToCloudinary(
          productData.image,
          "products/main",
          COMPRESSION_SETTINGS.main,
        );
      }

      // ✅ Upload new thumbnail 1
      let thumbnail1Url = productData.thumbnail1;
      if (
        productData.thumbnail1 &&
        productData.thumbnail1.startsWith("data:")
      ) {
        thumbnail1Url = await uploadImageToCloudinary(
          productData.thumbnail1,
          "products/thumbnails",
          COMPRESSION_SETTINGS.thumbnail,
        );
      }

      // ✅ Upload new thumbnail 2
      let thumbnail2Url = productData.thumbnail2;
      if (
        productData.thumbnail2 &&
        productData.thumbnail2.startsWith("data:")
      ) {
        thumbnail2Url = await uploadImageToCloudinary(
          productData.thumbnail2,
          "products/thumbnails",
          COMPRESSION_SETTINGS.thumbnail,
        );
      }

      // ✅ Upload new video
      let videoThumbnailUrl = productData.videoThumbnail;
      if (
        productData.videoThumbnail &&
        productData.videoThumbnail.startsWith("data:")
      ) {
        videoThumbnailUrl = await uploadVideoToCloudinary(
          productData.videoThumbnail,
          "products/videos",
        );
      }

      // Prepare update data
      const updateData = {
        ...productData,
        image: imageUrl || existingData.image,
        thumbnail1: thumbnail1Url || existingData.thumbnail1 || "",
        thumbnail2: thumbnail2Url || existingData.thumbnail2 || "",
        videoThumbnail: videoThumbnailUrl || existingData.videoThumbnail || "",
        updatedAt: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log("📤 Sending update to Firebase:", updateData);

      // Perform the update
      await updateDoc(docRef, updateData);

      console.log(`✅ Product ${id} updated successfully`);

      return {
        id,
        ...updateData,
      };
    } catch (error) {
      console.error(`❌ Error updating product ${id}:`, error);
      throw error;
    }
  },

  // Delete product (note: Cloudinary images won't be deleted automatically)
  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting product: ${id}`);

      if (!id) {
        throw new Error("Product ID is required for deletion");
      }

      const docRef = doc(db, "products", id);

      // Check if document exists first
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Product with ID ${id} does not exist`);
      }

      // Delete the document (Cloudinary images will remain, which is fine for free tier)
      await deleteDoc(docRef);
      console.log(`✅ Product ${id} deleted successfully`);

      return { success: true };
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
      throw error;
    }
  },
};

// ==================== REVIEWS API ====================

export const reviewsAPI = {
  // Get all reviews
  getAll: async () => {
    try {
      const reviewsRef = collection(db, "reviews");
      const q = query(reviewsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const reviews = [];
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Loaded ${reviews.length} reviews from Firebase`);
      return reviews;
    } catch (error) {
      console.error("❌ Error fetching reviews:", error);
      throw error;
    }
  },

  // Get reviews for a specific product
  getByProduct: async (productName) => {
    try {
      const reviewsRef = collection(db, "reviews");
      const q = query(
        reviewsRef,
        where("productName", "==", productName),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);

      const reviews = [];
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Loaded ${reviews.length} reviews for ${productName}`);
      return reviews;
    } catch (error) {
      console.error("❌ Error fetching product reviews:", error);
      throw error;
    }
  },

  // Create a new review
  create: async (reviewData) => {
    try {
      console.log("📝 Creating review:", reviewData);

      const reviewsRef = collection(db, "reviews");
      const docRef = await addDoc(reviewsRef, {
        ...reviewData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Review created with ID: ${docRef.id}`);

      return {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error creating review:", error);
      throw error;
    }
  },

  // Delete a review
  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting review: ${id}`);

      if (!id) {
        throw new Error("Review ID is required for deletion");
      }

      const docRef = doc(db, "reviews", id);

      // Check if document exists first
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Review with ID ${id} does not exist`);
      }

      // Delete the document
      await deleteDoc(docRef);
      console.log(`✅ Review ${id} deleted successfully`);

      return { success: true };
    } catch (error) {
      console.error(`❌ Error deleting review ${id}:`, error);
      throw error;
    }
  },

  // Update a review
  update: async (id, reviewData) => {
    try {
      console.log(`📝 Updating review ${id}:`, reviewData);

      if (!id) {
        throw new Error("Review ID is required for update");
      }

      const docRef = doc(db, "reviews", id);

      // Check if document exists first
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Review with ID ${id} does not exist`);
      }

      // Prepare update data
      const updateData = {
        ...reviewData,
        updatedAt: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // Perform the update
      await updateDoc(docRef, updateData);

      console.log(`✅ Review ${id} updated successfully`);

      return {
        id,
        ...updateData,
      };
    } catch (error) {
      console.error(`❌ Error updating review ${id}:`, error);
      throw error;
    }
  },
};

// ==================== ADMIN SESSION API ====================

export const adminAPI = {
  // Save admin session
  saveSession: async (sessionData) => {
    try {
      console.log("💾 Saving admin session");

      const sessionsRef = collection(db, "sessions");

      // Check if session exists for this deviceId
      const q = query(sessionsRef);
      const querySnapshot = await getDocs(q);

      let existingSessionId = null;
      querySnapshot.forEach((doc) => {
        if (doc.data().deviceId === sessionData.deviceId) {
          existingSessionId = doc.id;
        }
      });

      if (existingSessionId) {
        // Update existing session
        console.log("🔄 Updating existing session");
        const docRef = doc(db, "sessions", existingSessionId);
        await updateDoc(docRef, sessionData);
      } else {
        // Create new session
        console.log("➕ Creating new session");
        await addDoc(sessionsRef, sessionData);
      }

      console.log("✅ Session saved successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Error saving session:", error);
      throw error;
    }
  },

  // Get admin session
  getSession: async (deviceId) => {
    try {
      console.log("🔍 Checking admin session");

      const sessionsRef = collection(db, "sessions");
      const querySnapshot = await getDocs(sessionsRef);

      let session = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.deviceId === deviceId && data.expiry > Date.now()) {
          session = {
            id: doc.id,
            ...data,
          };
        }
      });

      if (session) {
        console.log("✅ Valid session found");
      } else {
        console.log("⚠️ No valid session found");
      }

      return session;
    } catch (error) {
      console.error("❌ Error getting session:", error);
      return null;
    }
  },

  // Delete admin session (logout)
  deleteSession: async (deviceId) => {
    try {
      console.log("🚪 Logging out admin");

      const sessionsRef = collection(db, "sessions");
      const querySnapshot = await getDocs(sessionsRef);

      const deletePromises = [];
      querySnapshot.forEach((document) => {
        if (document.data().deviceId === deviceId) {
          deletePromises.push(deleteDoc(doc(db, "sessions", document.id)));
        }
      });

      await Promise.all(deletePromises);
      console.log("✅ Session deleted successfully");

      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting session:", error);
      throw error;
    }
  },
};

export { db };
