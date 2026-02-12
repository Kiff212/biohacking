import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth.new';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Save, X } from 'lucide-react';

interface Product {
    id: string;
    title: string;
    description: string;
    category: string;
    image_url: string;
    link: string;
    price: string;
    active: boolean;
}

const CATEGORIES = ['saciedade', 'sono', 'energia', 'habitos'];

export function SysAdmin() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate('/login');
            return;
        }

        checkAdminStatus();
    }, [user, loading, navigate]);

    const checkAdminStatus = async () => {
        if (!user) return;

        // Check if user ID exists in the admin_whitelist table
        const { data, error } = await supabase
            .from('admin_whitelist')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

        if (data && !error) {
            setIsAdmin(true);
            fetchProducts();
        } else {
            // Not in whitelist
            setIsAdmin(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black text-white">Verificando credenciais...</div>;

    if (!user) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-black text-white gap-4">
                <h1 className="text-2xl text-red-500">Sessão não encontrada</h1>
                <Button onClick={() => navigate('/login')}>Ir para Login</Button>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-red-500">ACESSO BLOQUEADO PELO BANCO DE DADOS</h1>
                    <p>Este usuário não está na Whitelist de Administradores.</p>
                    <div className="bg-gray-800 p-4 rounded text-mono text-left">
                        <p className="text-xs text-gray-400">Seu ID de Usuário:</p>
                        <p className="font-bold text-yellow-400 break-all">{user.id}</p>
                    </div>
                    <p className="text-sm text-gray-500">Execute o script SQL 'supabase_admin_setup.sql' para liberar este ID.</p>
                    <Button onClick={() => navigate('/')} variant="outline">Voltar ao Início</Button>
                </div>
            </div>
        );
    }

    const fetchProducts = async () => {
        const { data } = await supabase.from('affiliate_products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza?')) return;
        await supabase.from('affiliate_products').delete().eq('id', id);
        fetchProducts();
    };

    const handleSave = async () => {
        if (editingId === 'new') {
            await supabase.from('affiliate_products').insert([formData]);
        } else if (editingId) {
            await supabase.from('affiliate_products').update(formData).eq('id', editingId);
        }
        setEditingId(null);
        setFormData({});
        fetchProducts();
    };

    const startEdit = (product: Product) => {
        setEditingId(product.id);
        setFormData(product);
    };

    const startNew = () => {
        setEditingId('new');
        setFormData({ active: true, category: 'saciedade' });
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-black p-8 text-white">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-red-500">SYS_ADMIN_NODE_V1</h1>
                    <Button onClick={startNew} className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" /> Novo Produto
                    </Button>
                </header>

                {editingId && (
                    <Card className="mb-8 border-gray-700 bg-gray-900 text-white">
                        <CardHeader>
                            <CardTitle>{editingId === 'new' ? 'Novo Item' : 'Editar Item'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Título"
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="bg-gray-800 border-gray-700"
                            />
                            <Input
                                placeholder="Descrição Curta"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="bg-gray-800 border-gray-700"
                            />
                            <select
                                className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-sm"
                                value={formData.category || 'saciedade'}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                            </select>
                            <Input
                                placeholder="Link de Afiliado"
                                value={formData.link || ''}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                                className="bg-gray-800 border-gray-700"
                            />
                            <Input
                                placeholder="Preço (ex: R$ 97,00)"
                                value={formData.price || ''}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="bg-gray-800 border-gray-700"
                            />
                            <Input
                                placeholder="URL da Imagem"
                                value={formData.image_url || ''}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                className="bg-gray-800 border-gray-700"
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" onClick={() => setEditingId(null)}><X className="mr-2 h-4 w-4" /> Cancelar</Button>
                                <Button onClick={handleSave} className="bg-blue-600"><Save className="mr-2 h-4 w-4" /> Salvar</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4">
                    {products.map(product => (
                        <div key={product.id} className="flex items-center justify-between rounded border border-gray-800 bg-gray-900 p-4">
                            <div>
                                <h3 className="font-bold">{product.title}</h3>
                                <p className="text-sm text-gray-400">{product.category} | {product.price}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => startEdit(product)} className="border-gray-700">Editar</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
