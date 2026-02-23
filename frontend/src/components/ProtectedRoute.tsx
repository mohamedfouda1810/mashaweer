'use client';

import { useEffect, useState } from 'react';
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
    const { isAuthenticated, user } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (!isAuthenticated) {
            router.push(`/login?redirect=${pathname}`);
        } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            router.push('/trips');
        }
    }, [isAuthenticated, user, allowedRoles, router, pathname, isMounted]);

    if (!isMounted || !isAuthenticated) {
        return null; // or a loading spinner
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
