import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PlusIcon, EditIcon, XIcon } from "lucide-react";
import type { Product } from "../../types";
import Loading from "../../components/Loading";
import api from "../../config/api";
import toast from "react-hot-toast";

export default function AdminProducts() {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get("status");

    const fetchProducts = async () => {
        try {
            const { data } = await api.get("/products?includeDeleted=true");
            setProducts(data.products);
        } catch (error: any) {
            toast.error(error.response?.data?.message || error?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        console.log("handleDelete called", id, name);
        // if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success("Product deleted successfully");
            fetchProducts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update product");
        }
    };

    if (loading) return <Loading />;

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (statusFilter === "outofstock") {
            return matchesSearch && (!p.hasVariants ? p.stock === 0 : p.variants?.every(v => v.stock === 0));
        }
        return matchesSearch;
    });

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden">
                <div className="px-6 py-5 border-b border-app-border flex items-center justify-between gap-4 flex-wrap">
                    <h2 className="text-xl font-semibold text-zinc-900">Products {statusFilter === "outofstock" ? "(Out of Stock)" : ""}</h2>
                    <div className="flex items-center gap-4 ml-auto">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-4 py-2 text-sm border border-zinc-200 rounded-xl focus:border-app-green focus:ring-1 focus:ring-app-green outline-none min-w-[250px]"
                        />
                        <Link to="/admin/products/new" className="flex items-center gap-2 px-4 py-2 bg-app-green text-white rounded-xl hover:bg-green-950 transition-colors font-medium text-sm">
                            <PlusIcon className="size-4" /> Add Product
                        </Link>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-app-cream/50 text-zinc-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Selling Price</th>
                                <th className="px-6 py-4">Cost Price</th>
                                <th className="px-6 py-4">Profit</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={product.image} alt={product.name} className="size-12 rounded-lg object-cover" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-zinc-900">{product.name}</p>
                                                        {product.isDeleted && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">DELETED</span>}
                                                    </div>
                                                    <p className="text-xs text-zinc-500">{product.category || "Uncategorized"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-app-green">
                                            {currency}
                                            {product.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-red-600">
                                            {currency}
                                            {(product.costPrice || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-blue-600">
                                            {currency}
                                            {((product.price - (product.costPrice || 0)) || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.hasVariants ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{product.variants?.length || 0} Variants</span>
                                            ) : (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!product.isDeleted ? (
                                                    <>
                                                        <Link to={`/admin/products/${product.id}/edit`} className="p-2 text-zinc-500 hover:text-app-orange bg-zinc-100 hover:bg-orange-50 rounded-lg transition-colors">
                                                            <EditIcon className="size-4" />
                                                        </Link>
                                                        <button onClick={() => handleDelete(product.id, product.name)} title="Delete Product" className="p-2 text-zinc-500 hover:text-red-600 bg-zinc-100 hover:bg-red-50 rounded-lg transition-colors">
                                                            <XIcon className="size-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs font-semibold text-zinc-400 mr-2">Inactive</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
