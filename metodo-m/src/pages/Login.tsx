import { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.new';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Loader2 } from 'lucide-react';
import gsap from 'gsap';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { session, signIn } = useAuth();
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cardRef.current) {
            gsap.fromTo(
                cardRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
            );
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await signIn(email, password);

        setLoading(false);
        if (error) {
            console.error(error);
            setError('Credenciais inválidas. Tente novamente.');
        }
    };

    if (session) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div ref={cardRef} className="w-full max-w-md">
                <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Área de Membros
                        </CardTitle>
                        <CardDescription className="text-muted-foreground/80">
                            Acesse sua conta do Método M
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="E-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-black/20 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder:text-white/30 h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-black/20 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder:text-white/30 h-12"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 text-center text-xs text-muted-foreground">
                        <p>
                            Ao continuar, você concorda com nossos{' '}
                            <span className="underline hover:text-white cursor-pointer">Termos de Uso</span> e{' '}
                            <span className="underline hover:text-white cursor-pointer">Política de Privacidade</span>.
                        </p>
                        <div className="flex items-center justify-center gap-2 opacity-50">
                            <span className="h-px w-8 bg-white/20"></span>
                            <span>Secure via Supabase</span>
                            <span className="h-px w-8 bg-white/20"></span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
