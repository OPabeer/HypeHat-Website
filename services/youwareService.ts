import { Product, User, AppSettings, Review, Coupon, Order, UserNotification, FulfillmentItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../constants';
import * as deepmergeModule from 'deepmerge';

// FIX: Handle potential module interop issues with deepmerge from CDN
const deepmerge = (deepmergeModule as any).default || deepmergeModule;

// --- Helper Functions ---
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, value: T) => {
    try {
        const item = JSON.stringify(value);
        localStorage.setItem(key, item);
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substring(2, 11)}`;

// --- THE FINAL FIX: Data Normalizer ---
// This function acts as a gatekeeper, ensuring any product data
// retrieved from the "database" is complete and safe to use,
// preventing crashes from missing properties like `supplierInfo` or `variants`.
const normalizeProduct = (product: Partial<Product>): Product => {
    const defaults: Omit<Product, 'id' | 'name' | 'description' | 'price' | 'category'> = {
        discountPrice: undefined,
        images: [],
        stock: 0,
        rating: 0,
        isFeatured: false,
        variants: [],
        productType: 'dropship', // Default to dropship
        supplierInfo: { name: '', url: '', costPrice: 0 },
        guideUrl: undefined,
        avgRating: 0,
        reviewCount: 0,
    };
    return deepmerge(defaults, product) as Product;
};


// --- Service Implementation ---
class YouwareService {
    private products: Product[] = [];
    private users: (User & { passwordHash: string })[] = [];
    private settings: AppSettings;
    private reviews: Review[] = [];
    private coupons: Coupon[] = [];
    private orders: Order[] = [];
    private userNotifications: UserNotification[] = [];
    private categories: string[] = [];
    private fulfillmentCart: FulfillmentItem[] = [];

    constructor() {
        this.init();
    }

    private init() {
        // Initialize with default data if storage is empty
        const initialProducts = getFromStorage('products', []);
        if (initialProducts.length === 0) {
            this.products = INITIAL_PRODUCTS.map(normalizeProduct);
            saveToStorage('products', this.products);
        } else {
            this.products = initialProducts.map(normalizeProduct);
        }
        
        this.users = getFromStorage('users', []);
        
        const defaultSettings: AppSettings = {
            delivery: { insideDhaka: 60, outsideDhaka: 120, codFee: 10 },
            social: { facebook: '', instagram: '', whatsapp: '' },
            advertisement: {
                isEnabled: false,
                isPopup: false,
                imageUrl: 'https://picsum.photos/seed/ad/300/250',
                linkUrl: 'https://aistudio.google.com/',
                title: 'Your Ad Title Here',
                description: 'A short, catchy description for the advertisement.'
            }
        };
        const storedSettings = getFromStorage('settings', {});
        this.settings = deepmerge(defaultSettings, storedSettings);
        
        this.reviews = getFromStorage('reviews', []);
        this.coupons = getFromStorage('coupons', []);
        this.orders = getFromStorage('orders', []);
        this.userNotifications = getFromStorage('user_notifications', []);
        this.fulfillmentCart = getFromStorage('fulfillment_cart', []);

        const initialCategories = getFromStorage('categories', []);
        if (initialCategories.length === 0) {
            this.categories = [...INITIAL_CATEGORIES];
            saveToStorage('categories', this.categories);
        } else {
            this.categories = initialCategories;
        }

        this.updateProductRatings();
    }
    
    private updateProductRatings() {
        this.products.forEach(product => {
            const productReviews = this.reviews.filter(r => r.productId === product.id);
            if (productReviews.length > 0) {
                const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
                product.avgRating = totalRating / productReviews.length;
                product.reviewCount = productReviews.length;
            } else {
                product.avgRating = product.rating;
                product.reviewCount = 0;
            }
        });
    }

    // --- Categories ---
    getCategories(): string[] {
        return this.categories;
    }

    private addCategory(categoryName: string): void {
        const trimmedCategory = categoryName.trim();
        if (trimmedCategory && !this.categories.find(c => c.toLowerCase() === trimmedCategory.toLowerCase())) {
            this.categories.push(trimmedCategory);
            this.categories.sort((a, b) => {
                if (a === 'All') return -1;
                if (b === 'All') return 1;
                return a.localeCompare(b);
            });
            saveToStorage('categories', this.categories);
        }
    }


    // --- Products ---
    getProducts(): Product[] {
        return this.products.map(normalizeProduct);
    }

    getProductById(id: string): Product | undefined {
        const product = this.products.find(p => p.id === id);
        return product ? normalizeProduct(product) : undefined;
    }

    addProduct(productData: Omit<Product, 'id' | 'rating' | 'avgRating' | 'reviewCount'>): Product {
        const productWithDefaults = {
            ...productData,
            productType: productData.productType || 'dropship' // Default to dropship
        };
        const newProduct: Product = normalizeProduct({ ...productWithDefaults, id: generateId(), rating: 0 });
        this.addCategory(newProduct.category);
        this.products.push(newProduct);
        saveToStorage('products', this.products);
        return newProduct;
    }

    updateProduct(updatedProductData: Product): Product | undefined {
        const index = this.products.findIndex(p => p.id === updatedProductData.id);
        if (index !== -1) {
            const normalized = normalizeProduct(updatedProductData);
            this.addCategory(normalized.category);
            this.products[index] = normalized;
            saveToStorage('products', this.products);
            return normalized;
        }
        return undefined;
    }
    
    deleteProduct(productId: string): void {
        this.products = this.products.filter(p => p.id !== productId);
        saveToStorage('products', this.products);
    }

    // --- Auth ---
    getAllUsers(): User[] {
        return this.users.map(({ passwordHash, ...userToReturn }) => userToReturn);
    }

    registerUser(name: string, email: string, phone: string, password: string): { user: User | null; error?: 'email' | 'phone' } {
        if (this.users.some(u => u.email === email)) {
            return { user: null, error: 'email' };
        }
        if (this.users.some(u => u.phone === phone)) {
            return { user: null, error: 'phone' };
        }
        const newUser = { 
            id: generateId(), 
            name, 
            email, 
            phone,
            passwordHash: password, // In a real app, hash the password
            addresses: []
        };
        this.users.push(newUser);
        saveToStorage('users', this.users);
        const { passwordHash, ...userToReturn } = newUser;
        return { user: userToReturn };
    }

    loginUser(identifier: string, password: string): User | null {
        const user = this.users.find(u => 
            (u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier) 
            && u.passwordHash === password
        );
        if (user) {
            const { passwordHash, ...userToReturn } = user;
            return userToReturn;
        }
        return null;
    }
    
    updateUser(userId: string, updatedData: Partial<User>): User | null {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            // Ensure password isn't overwritten
            const { passwordHash, ...rest } = this.users[userIndex];
            this.users[userIndex] = { ...rest, ...updatedData, passwordHash };
            saveToStorage('users', this.users);
            const { passwordHash: removedHash, ...userToReturn } = this.users[userIndex];
            return userToReturn;
        }
        return null;
    }

    updateUserPassword(userId: string, currentPassword: string, newPassword: string): boolean {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            if (this.users[userIndex].passwordHash === currentPassword) {
                this.users[userIndex].passwordHash = newPassword; // In a real app, hash this
                saveToStorage('users', this.users);
                return true;
            }
        }
        return false;
    }

    findUserByEmail(email: string): User | null {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            const { passwordHash, ...userToReturn } = user;
            return userToReturn;
        }
        return null;
    }
    
    async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
        // --- THIS IS WHERE THE REAL BACKEND CALL GOES ---
        // This function is now structured to talk to a real server.
        
        // --- SIMULATION FOR DEMONSTRATION ---
        // We simulate a network delay and a successful response.
        // In your real application, you'll replace this with a `fetch` call.
        console.log(`[Frontend] Calling backend API to send password reset to: ${email}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network latency
        
        const userExists = this.findUserByEmail(email);

        // A real backend would only send an email if the user exists, but it would
        // return a successful response to the frontend either way to prevent 
        // attackers from discovering which emails are registered.
        if (userExists) {
            console.log('[Backend Simulation] User found. Sending email via Brevo...');
        } else {
             console.log('[Backend Simulation] User not found. No email sent, but returning success to frontend.');
        }

        return { success: true, message: 'If your email is registered, a password reset code has been sent.' };
        // --- END OF SIMULATION ---

        /*
        // --- EXAMPLE OF REAL FETCH IMPLEMENTATION ---
        try {
            const response = await fetch('https://your-backend.com/api/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 // Use the server's error message if available
                 return { success: false, message: errorData.message || 'Failed to send reset email.' };
            }
            // The server should always return a generic success message
            const successData = await response.json();
            return { success: true, message: successData.message };
        } catch (error) {
            console.error('Network error requesting password reset:', error);
            return { success: false, message: 'An network error occurred. Please try again.' };
        }
        */
    }
    
    resetUserPasswordByEmail(email: string, newPassword: string): boolean {
        // In a real app, this would also be a backend call, sending the email, code, and newPassword
        const userIndex = this.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (userIndex > -1) {
            this.users[userIndex].passwordHash = newPassword; // In a real app, hash this
            saveToStorage('users', this.users);
            return true;
        }
        return false; // User not found, but we won't reveal this to the UI for security
    }

    // --- Settings ---
    getAppSettings(): AppSettings {
        return this.settings;
    }

    saveAppSettings(newSettings: AppSettings) {
        this.settings = newSettings;
        saveToStorage('settings', this.settings);
    }
    
    // --- Reviews ---
    getAllReviews(): Review[] {
        return this.reviews.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    getReviewsByProductId(productId: string): Review[] {
        return this.reviews.filter(r => r.productId === productId);
    }
    
    addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
        const newReview: Review = { ...reviewData, id: generateId(), createdAt: new Date().toISOString() };
        this.reviews.push(newReview);
        saveToStorage('reviews', this.reviews);
        this.updateProductRatings();
        // also update the single product instance in our main array
        const product = this.getProductById(reviewData.productId);
        if (product) this.updateProduct(product);
        return newReview;
    }

    deleteReview(reviewId: string): void {
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) return;
        this.reviews = this.reviews.filter(r => r.id !== reviewId);
        saveToStorage('reviews', this.reviews);
        this.updateProductRatings();
        const product = this.getProductById(review.productId);
        if (product) this.updateProduct(product);
    }
    
    // --- Coupons ---
    getCoupons(): Coupon[] {
        return this.coupons;
    }

    addCoupon(couponData: Omit<Coupon, 'id' | 'isActive'>): Coupon {
        const newCoupon: Coupon = { ...couponData, id: generateId(), isActive: true };
        this.coupons.push(newCoupon);
        saveToStorage('coupons', this.coupons);
        return newCoupon;
    }

    validateCoupon(code: string): Coupon | null {
        const coupon = this.coupons.find(c => c.code.toLowerCase() === code.toLowerCase());
        if (coupon && new Date(coupon.expiryDate) > new Date()) {
            return coupon;
        }
        return null;
    }

    deleteCoupon(couponId: string): void {
        this.coupons = this.coupons.filter(c => c.id !== couponId);
        saveToStorage('coupons', this.coupons);
    }
    
    // --- Orders ---
    getAllOrders(): Order[] {
        return this.orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    getOrdersByUserId(userId: string): Order[] {
        return this.orders.filter(o => o.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Order {
        const newOrder: Order = { ...orderData, id: generateId(), createdAt: new Date().toISOString() };
        this.orders.push(newOrder);
        saveToStorage('orders', this.orders);
        return newOrder;
    }
    
    updateOrderStatus(orderId: string, status: Order['status']): Order | undefined {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            saveToStorage('orders', this.orders);
            return order;
        }
        return undefined;
    }

    // --- User Notifications ---
    getUserNotifications(userId: string): UserNotification[] {
        return this.userNotifications
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    getUnreadNotificationCount(userId: string): number {
        return this.userNotifications.filter(n => n.userId === userId && !n.isRead).length;
    }

    addUserNotification(notificationData: Omit<UserNotification, 'id' | 'createdAt' | 'isRead'>): UserNotification {
        const newNotification: UserNotification = {
            ...notificationData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            isRead: false
        };
        this.userNotifications.push(newNotification);
        saveToStorage('user_notifications', this.userNotifications);
        return newNotification;
    }

    markNotificationAsRead(notificationId: string): void {
        const notification = this.userNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            saveToStorage('user_notifications', this.userNotifications);
        }
    }

    markAllNotificationsAsRead(userId: string): void {
        this.userNotifications.forEach(n => {
            if (n.userId === userId) {
                n.isRead = true;
            }
        });
        saveToStorage('user_notifications', this.userNotifications);
    }

    // --- Fulfillment Cart ---
    getFulfillmentCart(): FulfillmentItem[] {
        return this.fulfillmentCart;
    }

    addToFulfillmentCart(item: Omit<FulfillmentItem, 'isPurchased'>): FulfillmentItem | null {
        // Prevent adding the same item from the same order twice
        if (this.fulfillmentCart.some(i => i.id === item.id)) {
            return null;
        }
        const newItem: FulfillmentItem = { ...item, isPurchased: false };
        this.fulfillmentCart.push(newItem);
        saveToStorage('fulfillment_cart', this.fulfillmentCart);
        return newItem;
    }

    updateFulfillmentItemStatus(itemId: string, isPurchased: boolean): void {
        const item = this.fulfillmentCart.find(i => i.id === itemId);
        if (item) {
            item.isPurchased = isPurchased;
            saveToStorage('fulfillment_cart', this.fulfillmentCart);
        }
    }

    clearPurchasedFulfillmentItems(): void {
        this.fulfillmentCart = this.fulfillmentCart.filter(i => !i.isPurchased);
        saveToStorage('fulfillment_cart', this.fulfillmentCart);
    }
}

export const youwareService = new YouwareService();