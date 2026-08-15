import { useState, useEffect } from "react";
import api from "../../config/api";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import { PlusIcon, XIcon, EditIcon } from "lucide-react";

export default function AdminCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({ name: "", slug: "", image: "", parentCategory: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get("/categories");
            setCategories(data.categories);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editId) {
                await api.put(`/categories/${editId}`, formData);
                toast.success("Category updated");
            } else {
                await api.post("/categories", formData);
                toast.success("Category created");
            }
            setFormData({ name: "", slug: "", image: "", parentCategory: "" });
            setEditId(null);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Delete category "${name}"?`)) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success("Category deleted");
            fetchCategories();
        } catch (error: any) {
            toast.error("Failed to delete");
        }
    };

    const handleEdit = (c: any) => {
        setFormData({
            name: c.name,
            slug: c.slug,
            image: c.image || "",
            parentCategory: c.parentCategory?._id || "",
        });
        setEditId(c._id);
    };

    if (loading) return <Loading />;

    const renderCategoryOptions = (parentId: string | null = null, level: number = 0): JSX.Element[] => {
        return categories
            .filter((c) => {
                // don't allow setting a category as its own parent
                if (c._id === editId) return false;
                
                if (parentId === null) {
                    return !c.parentCategory;
                } else {
                    return c.parentCategory?._id === parentId;
                }
            })
            .flatMap((c) => [
                <option key={c._id} value={c._id}>
                    {"—".repeat(level) + (level > 0 ? " " : "") + c.name}
                </option>,
                ...renderCategoryOptions(c._id, level + 1),
            ]);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-app-border p-6">
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">{editId ? "Edit Category" : "Add New Category"}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" placeholder="e.g. Fresh Fruits" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Slug</label>
                        <input required type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" placeholder="e.g. fresh-fruits" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Parent Category (Optional)</label>
                        <select value={formData.parentCategory} onChange={e => setFormData({ ...formData, parentCategory: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white">
                            <option value="">None (Top-Level)</option>
                            {renderCategoryOptions(null, 0)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        {editId && (
                            <button type="button" onClick={() => { setEditId(null); setFormData({ name: "", slug: "", image: "", parentCategory: "" }); }} className="px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition">
                                Cancel
                            </button>
                        )}
                        <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-app-green text-white rounded-lg text-sm font-medium hover:bg-green-950 transition flex items-center gap-2">
                            {editId ? "Update" : <><PlusIcon className="size-4" /> Add</>}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden">
                <div className="px-6 py-4 border-b border-app-border">
                    <h2 className="text-lg font-semibold text-zinc-900">All Categories</h2>
                </div>
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-app-cream/50 text-zinc-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Parent</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {categories.map((c) => (
                            <tr key={c._id} className="hover:bg-zinc-50 transition">
                                <td className="px-6 py-4 font-medium text-zinc-900">{c.name}</td>
                                <td className="px-6 py-4 text-zinc-500">{c.slug}</td>
                                <td className="px-6 py-4 text-zinc-500">{c.parentCategory ? c.parentCategory.name : "—"}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEdit(c)} className="p-2 text-zinc-500 hover:text-app-orange mr-2 bg-zinc-100 hover:bg-orange-50 rounded-lg transition-colors">
                                        <EditIcon className="size-4" />
                                    </button>
                                    <button onClick={() => handleDelete(c._id, c.name)} className="p-2 text-zinc-500 hover:text-red-600 bg-zinc-100 hover:bg-red-50 rounded-lg transition-colors">
                                        <XIcon className="size-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
