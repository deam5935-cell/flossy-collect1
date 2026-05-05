export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
  createdAt: any;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  gender: 'Men' | 'Women' | 'Kids' | 'Babies' | 'Unisex';
  description: string;
  images: string[];
  stock: number;
  isFeatured: boolean;
  specs?: Record<string, string>;
  createdAt: any;
  updatedAt: any;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'momo' | 'card' | 'bank_transfer';
  paymentDetails?: {
    phone?: string;
    transactionId?: string;
    network?: string;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  createdAt: any;
  updatedAt: any;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  promoBanner: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  adminNotes?: string;
  createdAt: any;
}
