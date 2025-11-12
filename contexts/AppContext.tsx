import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Product, User, CartItem, SelectedVariant, Theme, AppSettings, Notification, UserNotification } from '../types';
import { youwareService } from '../services/youwareService';
import { THEMES } from '../constants';
import { I18nProvider } from './I18nContext';

// --- Theme Context ---
interface ThemeContextType {
    theme: string;
    setTheme: (themeName: string) => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};

// --- Settings Context ---
interface SettingsContextType {
    settings: AppSettings;
    saveSettings: (newSettings: AppSettings) => void;
    refreshSettings: () => void;
}
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error("useSettings must be used within a SettingsProvider");
    return context;
};

// --- Auth Context ---
interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loginUser: (identifier: string, password: string) => User | null;
    registerUser: (name: string, email: string, phone: string, password: string) => { user: User | null; error?: 'email' | 'phone' };
    updateUser: (updatedData: Partial<User>) => void;
    adminLogin: (password: string) => boolean;
    logout: () => void;
    updateUserPassword: (currentPassword: string, newPassword: string) => boolean;
    resetPassword: (email: string, newPassword: string) => boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

// --- Products Context ---
interface ProductsContextType {
    products: Product[];
    categories: string[];
    refreshProducts: () => void;
    refreshCategories: () => void;
}
const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
export const useProducts = () => {
    const context = useContext(ProductsContext);
    if (!context) throw new Error("useProducts must be used within a ProductsProvider");
    return context;
};

// --- Cart Context ---
interface CartContextType {
    cart: CartItem[];
    cartCount: number;
    addToCart: (product: Product, selectedOptions: SelectedVariant, quantity: number) => void;
    removeFromCart: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, newQuantity: number) => void;
    clearCart: () => void;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};

// --- Wishlist Context ---
interface WishlistContextType {
    wishlist: string[];
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (productId: string) => void;
}
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
    return context;
};

// --- Notification Context (for Toasts) ---
interface ToastContextType {
    notifications: Notification[];
    addNotification: (message: string, type: Notification['type']) => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);
export const useNotification = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useNotification must be used within a ToastProvider");
    return context;
};

// --- Inbox Context (for persistent notifications) ---
interface InboxContextType {
    userNotifications: UserNotification[];
    unreadCount: number;
    refreshUserNotifications: () => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
}
const InboxContext = createContext<InboxContextType | undefined>(undefined);
export const useInbox = () => {
    const context = useContext(InboxContext);
    if (!context) throw new Error("useInbox must be used within an InboxProvider");
    return context;
}

// --- Main App Provider ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Theme State
    const [theme, rawSetTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme && THEMES.some(t => t.name === storedTheme) ? storedTheme : 'cyber-glow';
    });
    const setTheme = (themeName: string) => {
        rawSetTheme(themeName);
        localStorage.setItem('theme', themeName);
        document.documentElement.setAttribute('data-theme', themeName);
    };
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Settings State
    const [settings, setSettings] = useState<AppSettings>(youwareService.getAppSettings());
    const saveSettings = (newSettings: AppSettings) => {
        youwareService.saveAppSettings(newSettings);
        setSettings(newSettings);
    };
    const refreshSettings = () => setSettings(youwareService.getAppSettings());

    // Auth State
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
    const loginUser = (identifier: string, password: string) => {
        const loggedInUser = youwareService.loginUser(identifier, password);
        if (loggedInUser) {
            setUser(loggedInUser);
            localStorage.setItem('user', JSON.stringify(loggedInUser));
        }
        return loggedInUser;
    };
    const registerUser = (name: string, email: string, phone: string, password: string) => {
        return youwareService.registerUser(name, email, phone, password);
    };
    const updateUser = (updatedData: Partial<User>) => {
        if (!user) return;
        const updatedUser = youwareService.updateUser(user.id, updatedData);
        if (updatedUser) {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };
    const adminLogin = (password: string) => {
        if (password === 'admin123') {
            setIsAdmin(true);
            localStorage.setItem('isAdmin', 'true');
            return true;
        }
        return false;
    };
    const logout = () => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
    };
    const updateUserPassword = (currentPassword: string, newPassword: string) => {
        if (!user) return false;
        return youwareService.updateUserPassword(user.id, currentPassword, newPassword);
    };
    const resetPassword = (email: string, newPassword: string) => {
        return youwareService.resetUserPasswordByEmail(email, newPassword);
    };

    // Products & Categories State
    const [products, setProducts] = useState<Product[]>(youwareService.getProducts());
    const [categories, setCategories] = useState<string[]>(youwareService.getCategories());
    const refreshProducts = useCallback(() => {
        setProducts(youwareService.getProducts());
    }, []);
    const refreshCategories = useCallback(() => {
        setCategories([...youwareService.getCategories()]);
    }, []);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const storedCart = localStorage.getItem('cart');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            localStorage.removeItem('cart');
            return [];
        }
    });
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
    const addToCart = (product: Product, selectedOptions: SelectedVariant, quantity: number) => {
        const optionString = Object.entries(selectedOptions).sort().join('|');
        const cartItemId = `${product.id}-${optionString}`;
        
        const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);

        if (existingItemIndex > -1) {
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += quantity;
            setCart(newCart);
        } else {
            const variantImageIndex = product.variants
              ?.flatMap(v => v.options)
              .find(opt => Object.values(selectedOptions).includes(opt.name) && opt.imageIndex !== undefined)
              ?.imageIndex;
            
            const selectedImage = variantImageIndex !== undefined ? product.images[variantImageIndex] : product.images[0];

            const newItem: CartItem = { cartItemId, product, selectedOptions, quantity, selectedImage };
            setCart(prevCart => [...prevCart, newItem]);
        }
    };
    const removeFromCart = (cartItemId: string) => setCart(cart.filter(item => item.cartItemId !== cartItemId));
    const updateQuantity = (cartItemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            setCart(cart.map(item => item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item));
        }
    };
    const clearCart = () => setCart([]);

    // Wishlist State
    const [wishlist, setWishlist] = useState<string[]>(() => {
        const storedWishlist = localStorage.getItem('wishlist');
        return storedWishlist ? JSON.parse(storedWishlist) : [];
    });
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);
    const isInWishlist = (productId: string) => wishlist.includes(productId);
    const toggleWishlist = (productId: string) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };
    
    // Toast Notification State
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const addNotification = (message: string, type: Notification['type']) => {
        const id = new Date().getTime().toString();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000); // Auto-remove after 5 seconds
    };

    // Inbox Notification State
    const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUserNotifications = useCallback(() => {
        if (user) {
            setUserNotifications(youwareService.getUserNotifications(user.id));
            setUnreadCount(youwareService.getUnreadNotificationCount(user.id));
        } else {
            setUserNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    useEffect(() => {
        refreshUserNotifications();
    }, [user, refreshUserNotifications]);

    const markAsRead = (notificationId: string) => {
        youwareService.markNotificationAsRead(notificationId);
        refreshUserNotifications();
    };

    const markAllAsRead = () => {
        if(user) {
            youwareService.markAllNotificationsAsRead(user.id);
            refreshUserNotifications();
        }
    };


    return (
        <I18nProvider>
            <ThemeContext.Provider value={{ theme, setTheme }}>
                <SettingsContext.Provider value={{ settings, saveSettings, refreshSettings }}>
                    <AuthContext.Provider value={{ user, isAdmin, loginUser, registerUser, updateUser, adminLogin, logout, updateUserPassword, resetPassword }}>
                        <ProductsContext.Provider value={{ products, refreshProducts, categories, refreshCategories }}>
                            <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist }}>
                                <CartContext.Provider value={{ cart, cartCount, addToCart, removeFromCart, updateQuantity, clearCart }}>
                                    <ToastContext.Provider value={{ notifications, addNotification }}>
                                        <InboxContext.Provider value={{ userNotifications, unreadCount, refreshUserNotifications, markAsRead, markAllAsRead }}>
                                            {children}
                                        </InboxContext.Provider>
                                    </ToastContext.Provider>
                                </CartContext.Provider>
                            </WishlistContext.Provider>
                        </ProductsContext.Provider>
                    </AuthContext.Provider>
                </SettingsContext.Provider>
            </ThemeContext.Provider>
        </I18nProvider>
    );
};