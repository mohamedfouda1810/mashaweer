'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Role } from '@/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, hasHydrated } = useAuthStore();

    useEffect(() => {
        if (!hasHydrated) return;

        if (!isAuthenticated) {
            router.push(`/login?redirect=${pathname}`);
        } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            router.push('/trips');
        }
    }, [isAuthenticated, user, allowedRoles, router, pathname, hasHydrated]);

    if (!hasHydrated || !isAuthenticated) {
        return null; // or a loading spinner
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
