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
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// 🔥 YOUR FIREBASE CONFIG
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
const storage = getStorage(app);

// ==================== STORAGE HELPERS ====================

/**
 * Convert base64 to Blob for upload
 */
const base64ToBlob = (base64, contentType = "image/jpeg") => {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

/**
 * Upload image to Firebase Storage
 * @param {string} base64Image - Base64 encoded image
 * @param {string} path - Storage path (e.g., 'products/abc123.jpg')
 * @returns {Promise<string>} - Download URL
 */
export const uploadImage = async (base64Image, path) => {
  try {
    if (!base64Image || !base64Image.startsWith("data:")) {
      // If it's already a URL, return it
      return base64Image;
    }

    console.log(`📤 Uploading image to: ${path}`);

    // Convert base64 to blob
    const blob = base64ToBlob(base64Image);

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload file
    const snapshot = await uploadBytes(storageRef, blob);
    console.log(`✅ Image uploaded successfully`);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`✅ Download URL: ${downloadURL}`);

    return downloadURL;
  } catch (error) {
    console.error(`❌ Error uploading image:`, error);
    throw error;
  }
};

/**
 * Delete image from Firebase Storage
 * @param {string} imageUrl - Full download URL or storage path
 */
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes("firebase")) {
      return; // Not a Firebase Storage URL
    }

    // Extract path from URL
    const path = imageUrl.split("/o/")[1]?.split("?")[0];
    if (!path) return;

    const decodedPath = decodeURIComponent(path);
    const storageRef = ref(storage, decodedPath);

    await deleteObject(storageRef);
    console.log(`✅ Image deleted: ${decodedPath}`);
  } catch (error) {
    console.error(`❌ Error deleting image:`, error);
    // Don't throw - image might already be deleted
  }
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

  // Create new product with image upload
  create: async (productData) => {
    try {
      console.log("📝 Creating product:", productData.name);

      // Generate unique ID for images
      const tempId = Date.now().toString();

      // Upload main image to Storage
      let imageUrl = productData.image;
      if (productData.image && productData.image.startsWith("data:")) {
        imageUrl = await uploadImage(
          productData.image,
          `products/${tempId}/main.jpg`,
        );
      }

      // Upload thumbnails
      let thumbnail1Url = productData.thumbnail1;
      if (
        productData.thumbnail1 &&
        productData.thumbnail1.startsWith("data:")
      ) {
        thumbnail1Url = await uploadImage(
          productData.thumbnail1,
          `products/${tempId}/thumb1.jpg`,
        );
      }

      let thumbnail2Url = productData.thumbnail2;
      if (
        productData.thumbnail2 &&
        productData.thumbnail2.startsWith("data:")
      ) {
        thumbnail2Url = await uploadImage(
          productData.thumbnail2,
          `products/${tempId}/thumb2.jpg`,
        );
      }

      // Upload video thumbnail
      let videoThumbnailUrl = productData.videoThumbnail;
      if (
        productData.videoThumbnail &&
        productData.videoThumbnail.startsWith("data:")
      ) {
        videoThumbnailUrl = await uploadImage(
          productData.videoThumbnail,
          `products/${tempId}/video.mp4`,
        );
      }

      // Create product in Firestore with URLs
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

  // Update product with image upload
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

      // Upload new images if they're base64
      let imageUrl = productData.image;
      if (productData.image && productData.image.startsWith("data:")) {
        // Delete old image if it exists
        if (existingData.image) {
          await deleteImage(existingData.image);
        }
        imageUrl = await uploadImage(
          productData.image,
          `products/${id}/main.jpg`,
        );
      }

      let thumbnail1Url = productData.thumbnail1;
      if (
        productData.thumbnail1 &&
        productData.thumbnail1.startsWith("data:")
      ) {
        if (existingData.thumbnail1) {
          await deleteImage(existingData.thumbnail1);
        }
        thumbnail1Url = await uploadImage(
          productData.thumbnail1,
          `products/${id}/thumb1.jpg`,
        );
      }

      let thumbnail2Url = productData.thumbnail2;
      if (
        productData.thumbnail2 &&
        productData.thumbnail2.startsWith("data:")
      ) {
        if (existingData.thumbnail2) {
          await deleteImage(existingData.thumbnail2);
        }
        thumbnail2Url = await uploadImage(
          productData.thumbnail2,
          `products/${id}/thumb2.jpg`,
        );
      }

      let videoThumbnailUrl = productData.videoThumbnail;
      if (
        productData.videoThumbnail &&
        productData.videoThumbnail.startsWith("data:")
      ) {
        if (existingData.videoThumbnail) {
          await deleteImage(existingData.videoThumbnail);
        }
        videoThumbnailUrl = await uploadImage(
          productData.videoThumbnail,
          `products/${id}/video.mp4`,
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

      // Remove undefined values to avoid Firebase errors
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
      console.error("Error details:", error.message);
      throw error;
    }
  },

  // Delete product and its images
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

      // Delete all associated images
      const productData = docSnap.data();
      if (productData.image) await deleteImage(productData.image);
      if (productData.thumbnail1) await deleteImage(productData.thumbnail1);
      if (productData.thumbnail2) await deleteImage(productData.thumbnail2);
      if (productData.videoThumbnail)
        await deleteImage(productData.videoThumbnail);

      // Delete the document
      await deleteDoc(docRef);
      console.log(`✅ Product ${id} deleted successfully`);

      return { success: true };
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
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

export { db, storage };
