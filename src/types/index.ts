/**
 * Core types for Hotelify SaaS
 */

export type Organization = {
    id: string;
    name: string;
    subdomain: string;
    custom_domain?: string | null;
    subscription_tier: 'essential' | 'professional' | 'enterprise';
    created_at: string;
    settings: Record<string, unknown>;
};

export type StaffRole = 'owner' | 'manager' | 'receptionist' | 'cleaner' | 'laundry' | 'custom';

export type Role = {
    id: string;
    org_id: string;
    name: string;
    permissions: Permission[];
};

export type Permission =
    | 'manage_staff'
    | 'view_attendance'
    | 'manage_laundry'
    | 'manage_cleaning'
    | 'view_bookings'
    | 'edit_bookings'
    | 'manage_rooms'
    | 'view_reports'
    | 'edit_settings';

export type StaffProfile = {
    id: string;
    org_id: string;
    email: string;
    full_name: string;
    role_id: string;
    is_active: boolean;
    pin_code?: string; // For QR/PIN attendance
};

export type AttendanceRecord = {
    id: string;
    staff_id: string;
    org_id: string;
    clock_in: string;
    clock_out?: string;
    location?: { lat: number; lng: number };
    status: 'present' | 'absent' | 'late';
};

export type LaundryCharge = {
    id: string;
    org_id: string;
    booking_id?: string;
    staff_id: string;
    type: 'internal' | 'external';
    vendor_name?: string;
    items: Array<{ type: string; quantity: number; cost: number }>;
    status: 'pending' | 'processing' | 'completed';
};

export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'cleaning' | 'maintenance';

export type Room = {
    id: string;
    org_id: string;
    room_number: string;
    type: string;
    floor: string;
    status: RoomStatus;
    base_price: number;
};

export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';

export type Booking = {
    id: string;
    org_id: string;
    room_id: string;
    guest_name: string;
    guest_email: string;
    check_in: string;
    check_out: string;
    status: BookingStatus;
    total_price: number;
    created_at: string;
};
