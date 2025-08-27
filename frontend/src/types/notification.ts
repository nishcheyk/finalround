// Define allowed notification types and priorities using string literal types
export type NotificationType = "info" | "warning" | "error" | "success";
export type PriorityType = "low" | "medium" | "high";

// Form data type for creating or editing a notification
export interface NotificationFormData {
  title: string;
  message: string;
  type: NotificationType;
  priority: PriorityType;
  isGlobal: boolean;
}

// Notification data type returned by your API
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: PriorityType;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  recipients: string[];
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  isGlobal: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Type for notification creation payload
export interface CreateNotificationData {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: PriorityType;
  recipients?: string[];
  isGlobal?: boolean;
  expiresAt?: string;
}

// Notification API response
export interface NotificationResponse {
  success: boolean;
  message: string;
  notification?: Notification;
  notifications?: Notification[];
  unreadCount?: number;
}

// Notification statistics
export interface NotificationStats {
  total: number;
  global: number;
  today: number;
}
