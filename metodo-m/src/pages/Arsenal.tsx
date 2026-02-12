import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Background } from '../components/Background';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: string;
    title: string;
    description: string;
    category: string;
    image_url: string;
    link: string;
    price: string;
}

const CATEGORIES = [
    { id: 'saciedade', label: '🧠 Saciedade & Controle' },
    { id: 'sono', label: '😴 Sono & Recuperação' },
    { id: 'energia', label: '⚡ Energia & Foco' },
    { id: 'habitos', label: '🥤 Hábitos & Rotina' },
];

export function Arsenal() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [activeCategory, setActiveCategory] = useState('saciedade');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase
                .from('affiliate_products')
                .select('*')
                .eq('active', true);

            if (data) setProducts(data);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => p.category === activeCategory);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Background />
            <Navbar />

            <main className="container mx-auto px-4 py-8 pt-24">
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                </button>

                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Arsenal Biohacker</h1>
                    <p className="text-muted-foreground">Ferramentas e suplementos curados para potencializar seus resultados.</p>
                </header>

                {/* Category Navigation */}
                <div className="mb-8 flex flex-wrap justify-center gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${activeCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {loading ? (
                        <p className="text-center col-span-full text-muted-foreground">Carregando arsenal...</p>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <Card key={product.id} className="border-white/10 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col hover:border-blue-500/30 transition-colors group">
                                <div className="aspect-square w-full overflow-hidden bg-white/5 relative">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-gray-600">
                                            <ShoppingCart className="h-12 w-12 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <p className="text-white font-bold">{product.price}</p>
                                    </div>
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg leading-tight">{product.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <a
                                        href={product.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full"
                                    >
                                        <Button className="w-full bg-blue-600 hover:bg-blue-500 gap-2 shadow-lg shadow-blue-900/20">
                                            Ver Oferta <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </a>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-white/5 rounded-lg border border-white/5 border-dashed">
                            <p>Nenhum item nesta categoria ainda.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
