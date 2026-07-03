export interface House {
    id: string;
    title: string;
    subtitle: string;
    location: string;
    price: string;
    bedrooms: number;
    bathrooms: number;
    area: string;
    year: string;
    description: string;
    longDescription: string;
    features: string[];
    image: string;
    images: string[];
    rooms: Room[];
  }
  
  export interface Room {
    id: string;
    name: string;
    icon: string;
    panorama: string;
    description: string;
    dimensions: string;
    features: string[];
  }
  
  export interface ContactSubmission {
    _id: string;
  
    name: string;
    email: string;
    phone?: string;
  
    service: string;
    message: string;
  
    status: 'unread' | 'read' | 'replied';
  
    createdAt: string;
  
    repliedAt?: string;
    replyMessage?: string;
  }
  
  export interface DashboardStats {
    totalHouses: number;
    totalRooms: number;
    totalSubmissions: number;
    unreadSubmissions: number;
    totalViews: number;
    recentSubmissions: ContactSubmission[];
  }

  