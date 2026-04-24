'use client'
import { createContext, ReactNode, useEffect, useState } from 'react';
import { setCookie, destroyCookie, parseCookies } from 'nookies';
import { useRouter } from 'next/navigation';
import { User, AuthResponse, SignInCredentials } from '@/types/auth';
import { api } from '@/lib/api';

interface AuthContextData {
    user: User | null;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signOut: () => void;
}

export const AuthContext = createContext( {} as AuthContextData );

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    function signOut() {
        destroyCookie(undefined, 'stockproject.token');
        setUser(null);
        router.push('/auth/signin');
    }

    useEffect(() => {
        const { 'stockproject.token': token } = parseCookies();

        if (token) {
            api.get('/me').then( response => {
                setUser(response.data);
            })
            .catch(()=> {
                signOut();
            });
        }
    }, [])

    async function signIn(credentials: SignInCredentials) {
        try {
            const response = await api.post<AuthResponse>('/auth/signIn', credentials);
            const { token, user: userData } = response.data; 

            setCookie(undefined, 'stockproject.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            });

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(userData);

            if (userData.type === 'OWNER') {
                router.push('/owner/select-store');
            } else if (userData.type === 'STORE_USER') {
                router.push(`/stores/${userData.storeId}/dashboard`);
            }
            
        } catch (error) {
            console.log('Erro durante o login: ', error);
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={{ user, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    )
}
