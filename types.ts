

// FIX: Removed self-import which caused circular dependency and declaration conflicts.
export interface Theme {
    name: string;
    displayName: string;
    colors: {
        primary: string;
        secondary: string;
    };
}

export interface ProductVariantOption {
    name: string;
    stock: number;
    imageIndex?: number;
}

export interface ProductVariant {
    name: string;
    options: ProductVariantOption[];
}

export interface SupplierInfo {
    name: string;
    url: string;
    costPrice: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category: string;
    stock: number;
    rating: number; // original static rating
    isFeatured: boolean;
    variants: ProductVariant[];
    productType: 'in-house' | 'dropship';
    supplierInfo: SupplierInfo;
    guideUrl?: string; // For downloadable recipe/guide
    // Properties calculated from reviews
    avgRating?: number;
    reviewCount?: number;
}

export interface Address {
    id: string;
    division: string;
    zilla: string;
    upazilla: string;
    street: string;
}

export interface User {
    id:string;
    name: string;
    email: string;
    phone?: string;
    addresses?: Address[];
}

export type SelectedVariant = { [key: string]: string };

export interface CartItem {
    cartItemId: string; // combination of product id and variant options
    product: Product;
    selectedOptions: SelectedVariant;
    quantity: number;
    selectedImage: string;
}

export interface AppSettings {
    delivery: {
        insideDhaka: number;
        outsideDhaka: number;
        codFee: number;
    };
    social: {
        facebook: string;
        instagram: string;
        whatsapp: string;
    };
    advertisement: {
        isEnabled: boolean;
        imageUrl: string;
        linkUrl: string;
        title: string;
        description: string;
        isPopup: boolean;
    }
}

export interface Review {
    id: string;
    productId: string;
    productName: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string; // ISO string date
}

export interface Coupon {
    id: string;
    code: string;
    discountValue: number; // Now always a fixed amount
    expiryDate: string; // ISO string date
    isActive: boolean;
}

export interface Order {
    id: string;
    userId: string;
    userName: string;
    userPhone: string;
    userAddress: string;
    items: CartItem[];
    subtotal: number;
    deliveryCharge: number;
    couponDiscount: number;
    couponCode?: string;
    codFee?: number;
    grandTotal: number;
    paymentMethod: string;
    transactionId?: string;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: string; // ISO string date
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface UserNotification {
    id: string;
    userId: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string; // ISO string
}

export interface FulfillmentItem {
    id: string; // Unique ID for the fulfillment item (e.g., `orderId_cartItemId`)
    productName: string;
    supplierUrl: string;
    quantity: number;
    customerName: string;
    customerAddress: string;
    orderId: string;
    isPurchased: boolean;
}