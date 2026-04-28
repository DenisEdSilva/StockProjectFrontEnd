export interface UserProfile {
    id: number;
    name: string;
    email: string;
    userType: 'OWNER' | 'STORE_USER';
    avatar?: string | null;
}