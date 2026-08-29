import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";

import Loading from "../../components/Loading";
import api from "../../config/api";
import toast from "react-hot-toast";
import ImageCropperModal from "../../components/admin/ImageCropperModal";

export default function AdminProductForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    
    // Cropper State
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [cropTarget, setCropTarget] = useState<'main' | { type: 'variant', index: number } | 'gallery' | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        costPrice: "",
        originalPrice: "",
        image: "",
        category: "",
        unit: "",
        stock: "",
        isOrganic: false,
        hasVariants: false,
        retailerName: localStorage.getItem("lastRetailerName") || "",
        alertLimit: "5",
        gallery: [] as string[],
    });
    
    const [variants, setVariants] = useState<{sku: string, unit: string, price: string, costPrice: string, originalPrice: string, stock: string, image: string, imageFile?: File | null}[]>([]);
    const [categoriesData, setCategoriesData] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get("/categories");
                setCategoriesData(data.categories);
            } catch (error) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEdit) {
                    const { data: prodData } = await api.get(`/products/${id}`);
                    const p = prodData.product;
                    setFormData({
                        name: p.name,
                        description: p.description,
                        price: p.price.toString(),
                        costPrice: p.costPrice ? p.costPrice.toString() : "",
                        originalPrice: p.originalPrice ? p.originalPrice.toString() : "",
                        image: p.image,
                        category: p.category,
                        unit: p.unit,
                        stock: p.stock.toString(),
                        isOrganic: p.isOrganic,
                        hasVariants: p.hasVariants || false,
                        retailerName: p.retailerName || "",
                        alertLimit: p.alertLimit ? p.alertLimit.toString() : "5",
                        gallery: p.gallery || [],
                    });
                    
                    if (p.variants && p.variants.length > 0) {
                        setVariants(p.variants.map((v: any) => ({
                            sku: v.sku,
                            unit: v.unit,
                            price: v.price.toString(),
                            costPrice: v.costPrice ? v.costPrice.toString() : "",
                            originalPrice: v.originalPrice ? v.originalPrice.toString() : "",
                            stock: v.stock.toString(),
                            image: v.image || ""
                        })));
                    }
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEdit]);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let finalImageUrl = formData.image;

            if (imageFile) {
                const formDataUpload = new FormData();
                formDataUpload.append("image", imageFile);
                const { data } = await api.post("/upload", formDataUpload);
                finalImageUrl = data.url;
            }

            if (!finalImageUrl) {
                toast.error("Please upload a product image");
                setSaving(false);
                return;
            }

            // Upload gallery files
            const updatedGallery = [...formData.gallery];
            if (galleryFiles.length > 0) {
                for (const file of galleryFiles) {
                    const fData = new FormData();
                    fData.append("image", file);
                    const { data } = await api.post("/upload", fData);
                    updatedGallery.push(data.url);
                }
            }

            // Upload variant files
            const processedVariants = [...variants];
            for (let i = 0; i < processedVariants.length; i++) {
                if (processedVariants[i].imageFile) {
                    const fData = new FormData();
                    fData.append("image", processedVariants[i].imageFile!);
                    const { data } = await api.post("/upload", fData);
                    processedVariants[i].image = data.url;
                }
            }

            // Save retailer name to local storage
            if (formData.retailerName) {
                localStorage.setItem("lastRetailerName", formData.retailerName);
            }

            const payload = {
                ...formData,
                image: finalImageUrl,
                price: Number(formData.price),
                costPrice: formData.costPrice ? Number(formData.costPrice) : 0,
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
                stock: Number(formData.stock),
                retailerName: formData.retailerName,
                alertLimit: Number(formData.alertLimit),
                gallery: updatedGallery,
                hasVariants: formData.hasVariants,
                variants: formData.hasVariants ? processedVariants.map(v => ({
                    sku: v.sku,
                    unit: v.unit,
                    price: Number(v.price),
                    costPrice: v.costPrice ? Number(v.costPrice) : 0,
                    originalPrice: v.originalPrice ? Number(v.originalPrice) : 0,
                    stock: Number(v.stock),
                    image: v.image || ""
                })) : []
            };

            if (isEdit) {
                await api.put(`/products/${id}`, payload);
                toast.success("Product updated successfully");
            } else {
                await api.post("/products", payload);
                toast.success("Product created successfully");
            }
            navigate("/admin/products");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save product");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden">
                <div className="px-6 py-5 border-b border-app-border flex items-center gap-4">
                    <Link to="/admin/products" className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-lg transition-colors">
                        <ArrowLeftIcon className="size-5" />
                    </Link>
                    <h2 className="text-xl font-semibold text-zinc-900">{isEdit ? "Edit Product" : "New Product"}</h2>
                </div>
                {loading ? (
                    <Loading />
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Category</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all bg-white"
                                >
                                    <option value="">Select a category</option>
                                    {categoriesData
                                        .filter(c => !c.parentCategory)
                                        .map((parent) => (
                                            <optgroup key={parent.slug} label={parent.name}>
                                                <option value={parent.slug}>{parent.name} (Main)</option>
                                                {categoriesData
                                                    .filter(c => c.parentCategory && c.parentCategory._id === parent._id)
                                                    .map(child => (
                                                        <option key={child.slug} value={child.slug}>
                                                            -- {child.name}
                                                        </option>
                                                    ))}
                                            </optgroup>
                                        ))}
                                    {categoriesData
                                        .filter(c => c.parentCategory && !categoriesData.find(p => p._id === c.parentCategory._id))
                                        .map(orphan => (
                                            <option key={orphan.slug} value={orphan.slug}>{orphan.name}</option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Price (₹)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Cost Price (₹) - Admin Only</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.costPrice}
                                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all bg-red-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">MRP (₹) - Optional</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Unit</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., kg, piece, liter"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Stock</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Retailer Name (Admin Only)</label>
                                <input
                                    type="text"
                                    value={formData.retailerName}
                                    onChange={(e) => setFormData({ ...formData, retailerName: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all"
                                    placeholder="Auto-saves for next time"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Low Stock Alert Limit</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={formData.alertLimit}
                                    onChange={(e) => setFormData({ ...formData, alertLimit: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all"
                                />
                            </div>

                            {/* Options Toggle */}
                            <div className="md:col-span-2 mt-4 pt-4 border-t border-zinc-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <label htmlFor="hasVariants" className="text-sm font-semibold text-zinc-900 cursor-pointer">
                                        This product has multiple variants (e.g. sizes, weights)
                                    </label>
                                    <input type="checkbox" id="hasVariants" checked={formData.hasVariants} onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })} className="size-5 text-app-green rounded border-zinc-300 focus:ring-app-green cursor-pointer" />
                                </div>
                            </div>

                            {/* Variants Builder */}
                            {formData.hasVariants && (
                                <div className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-xl p-5 mb-4 space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-semibold text-zinc-900">Manage Variants</h3>
                                        <button 
                                            type="button" 
                                            onClick={() => setVariants([...variants, { sku: "", unit: "", price: "", costPrice: "", originalPrice: "", stock: "", image: "" }])}
                                            className="px-3 py-1.5 bg-app-green/10 text-app-green text-xs font-semibold rounded hover:bg-app-green/20"
                                        >
                                            + Add Variant
                                        </button>
                                    </div>
                                    
                                    {variants.length === 0 ? (
                                        <p className="text-xs text-zinc-500 italic">No variants added yet. Click above to add one.</p>
                                    ) : (
                                        variants.map((v, i) => (
                                            <div key={i} className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg">
                                                <div className="flex-1 min-w-[120px]">
                                                    <label className="block text-xs font-medium text-zinc-500 mb-1">SKU</label>
                                                    <input required type="text" value={v.sku} onChange={e => { const nv = [...variants]; nv[i].sku = e.target.value; setVariants(nv); }} placeholder="e.g. APP-500G" className="w-full px-2 py-1.5 text-sm rounded border border-zinc-200" />
                                                </div>
                                                <div className="flex-1 min-w-[100px]">
                                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Size/Unit</label>
                                                    <input required type="text" value={v.unit} onChange={e => { const nv = [...variants]; nv[i].unit = e.target.value; setVariants(nv); }} placeholder="e.g. 500g" className="w-full px-2 py-1.5 text-sm rounded border border-zinc-200" />
                                                </div>
                                                <div className="w-20">
                                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Selling Price</label>
                                                    <input required type="number" step="0.01" value={v.price} onChange={e => { const nv = [...variants]; nv[i].price = e.target.value; setVariants(nv); }} className="w-full px-2 py-1.5 text-sm rounded border border-zinc-200" />
                                                </div>
                                                <div className="w-20">
                                                    <label className="block text-xs font-medium text-zinc-500 mb-1">MRP (Optional)</label>
                                                    <input type="number" step="0.01" value={v.originalPrice} onChange={e => { const nv = [...variants]; nv[i].originalPrice = e.target.value; setVariants(nv); }} className="w-full px-2 py-1.5 text-sm rounded border border-zinc-200" />
                                                </div>
                                                <div className="w-20">
                                                    <label className="block text-xs font-medium text-zinc-500 mb-1 text-red-600">Cost Price</label>
                                                    <input required type="number" step="0.01" value={v.costPrice} onChange={e => { const nv = [...variants]; nv[i].costPrice = e.target.value; setVariants(nv); }} className="w-full px-2 py-1.5 text-sm rounded border border-zinc-200 bg-red-50" />
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Stock</label>
                                                    <input required type="number" value={v.stock} onChange={e => { const nv = [...variants]; nv[i].stock = e.target.value; setVariants(nv); }} className="w-full px-2 py-1.5 text-sm rounded border border-zinc-200" />
                                                </div>
                                                <div className="w-32">
                                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Image (Optional)</label>
                                                    <input type="file" accept="image/*" onChange={e => { 
                                                        if (e.target.files && e.target.files.length > 0) {
                                                            const file = e.target.files[0];
                                                            const reader = new FileReader();
                                                            reader.onload = () => {
                                                                setCropImageSrc(reader.result as string);
                                                                setCropTarget({ type: 'variant', index: i });
                                                            };
                                                            reader.readAsDataURL(file);
                                                            e.target.value = "";
                                                        }
                                                    }} className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-100 file:text-zinc-700" />
                                                    {(v.imageFile || v.image) && <span className="text-[10px] text-green-600 block mt-1">Image set</span>}
                                                </div>
                                                <div className="flex items-end pb-0.5">
                                                    <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Product Image (Square 1:1)</label>
                                <div className="flex items-center gap-4">
                                    {(imageFile || formData.image) && (
                                        <div className="size-16 rounded-lg border border-zinc-200 overflow-hidden shrink-0 bg-app-cream">
                                            <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                const file = e.target.files[0];
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setCropImageSrc(reader.result as string);
                                                    setCropTarget('main');
                                                };
                                                reader.readAsDataURL(file);
                                                // Reset input so same file can be selected again
                                                e.target.value = "";
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-app-orange file:text-white hover:file:bg-orange-600 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Gallery Images (Upload multiple)</label>
                                
                                {formData.gallery.length > 0 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                        {formData.gallery.map((img, idx) => (
                                            <div key={idx} className="relative size-16 shrink-0 rounded-lg border border-zinc-200 overflow-hidden group">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setFormData({...formData, gallery: formData.gallery.filter((_, i) => i !== idx)})} className="absolute inset-0 bg-black/50 text-white flex-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {galleryFiles.length > 0 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                        {galleryFiles.map((f, idx) => (
                                            <div key={idx} className="relative size-16 shrink-0 rounded-lg border border-app-green overflow-hidden group">
                                                <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setGalleryFiles(galleryFiles.filter((_, i) => i !== idx))} className="absolute inset-0 bg-black/50 text-white flex-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            if (e.target.files.length === 1) {
                                                const file = e.target.files[0];
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setCropImageSrc(reader.result as string);
                                                    setCropTarget('gallery');
                                                };
                                                reader.readAsDataURL(file);
                                            } else {
                                                setGalleryFiles([...galleryFiles, ...Array.from(e.target.files)]);
                                            }
                                            e.target.value = "";
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label htmlFor="isOrganic" className="text-sm font-medium text-zinc-700 cursor-pointer">
                                    Organic
                                </label>
                                <input type="checkbox" id="isOrganic" checked={formData.isOrganic} onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })} className="size-5 text-app-green rounded border-zinc-300 focus:ring-app-green cursor-pointer" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-app-border flex justify-end">
                            <button disabled={saving} type="submit" className="px-6 py-2.5 bg-app-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                                {saving ? "Saving..." : "Save Product"}
                            </button>
                        </div>
                    </form>
                )}
                
                {cropImageSrc && (
                    <ImageCropperModal
                        imageSrc={cropImageSrc}
                        aspectRatio={1} // Square
                        onCropComplete={(croppedFile) => {
                            if (cropTarget === 'main') {
                                setImageFile(croppedFile);
                            } else if (cropTarget === 'gallery') {
                                setGalleryFiles([...galleryFiles, croppedFile]);
                            } else if (typeof cropTarget === 'object' && cropTarget?.type === 'variant') {
                                const nv = [...variants];
                                nv[cropTarget.index].imageFile = croppedFile;
                                setVariants(nv);
                            }
                            setCropImageSrc(null);
                            setCropTarget(null);
                        }}
                        onCancel={() => {
                            setCropImageSrc(null);
                            setCropTarget(null);
                        }}
                    />
                )}
            </div>
        </>
    );
}
