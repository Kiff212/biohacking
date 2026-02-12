import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.new';
import { Button } from './ui/button';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '../lib/utils';

export function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (navRef.current) {
            gsap.fromTo(
                navRef.current,
                { y: -100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
            );
        }
    }, []);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <nav
            ref={navRef}
            className={cn(
                "fixed top-0 z-50 w-full border-b border-white/10 bg-background/50 backdrop-blur-md supports-[backdrop-filter]:bg-background/20",
                "transition-all duration-300"
            )}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link
                    to="/"
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-xl font-bold tracking-tight text-transparent hover:opacity-80 transition-opacity"
                >
                    MÉTODO M
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="hidden text-sm text-foreground/70 sm:inline">
                                {user.email}
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleLogout}
                                className="shadow-lg hover:shadow-red-500/20"
                            >
                                Sair
                            </Button>
                        </>
                    ) : (
                        <Link to="/login">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                                Entrar
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
