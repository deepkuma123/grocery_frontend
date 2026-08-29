import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import type { Product } from "../types";
import Loading from "../components/Loading";
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon, LeafIcon, MinusIcon, PlusIcon, ShoppingCartIcon, StarIcon } from "lucide-react";
import ReviewsSection from "../components/ReviewsSection";
import ProductCard from "../components/ProductCard";
import api from "../config/api";
import toast from "react-hot-toast";

const ProductPage = () => {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const variantIdParam = searchParams.get("variant");
    const navigate = useNavigate();
    const { items, addToCart, updateQuantity, removeFromCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [notifyEmail, setNotifyEmail] = useState("");
    const [notifying, setNotifying] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    const handleNotify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifyEmail) return;
        setNotifying(true);
        try {
            const { data } = await api.post(`/notifications/notify`, { productId: product?.id, email: notifyEmail });
            toast.success(data.message);
            setNotifyEmail("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to subscribe");
        } finally {
            setNotifying(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        window.scrollTo(0, 0);

        api.get(`/products/${id}`)
            .then(({ data }) => {
                setProduct(data.product);
                if (data.product.hasVariants && data.product.variants?.length > 0) {
                    if (variantIdParam) {
                        const matchedVariant = data.product.variants.find((v: any) => v._id === variantIdParam || v.id === variantIdParam);
                        if (matchedVariant) {
                            setSelectedVariant(matchedVariant);
                        } else {
                            const maxPriceVariant = data.product.variants.reduce((prev: any, curr: any) => (prev.price > curr.price ? prev : curr));
                            setSelectedVariant(maxPriceVariant);
                        }
                    } else {
                        const maxPriceVariant = data.product.variants.reduce((prev: any, curr: any) => (prev.price > curr.price ? prev : curr));
                        setSelectedVariant(maxPriceVariant);
                    }
                } else {
                    setSelectedVariant(null);
                }
                setActiveImage(null);
                return api.get(`/products/${data.product.id}/similar`);
            })
            .then(({ data }) => {
                setRelatedProducts(data.products.filter((p: Product) => p.id !== id));
            })
            .catch(() => navigate("/products"))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) return <Loading />;
    if (!product) return null;

    const cartItem = items.find((item) => item.product.id === product.id && item.variantId === selectedVariant?._id);
    const inCart = !!cartItem;
    const displayQuantity = cartItem?.quantity || 0;

    const displayPrice = selectedVariant ? selectedVariant.price : product.price;
    const displayOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
    const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
    let displayDiscount = 0;
    if (selectedVariant) {
        if (displayOriginalPrice > displayPrice) {
            displayDiscount = Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100);
        }
    } else {
        if (product.originalPrice > product.price) {
            displayDiscount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        } else {
            displayDiscount = product.discount || 0;
        }
    }

    const handleMinus = () => {
        if (inCart) {
            if (cartItem.quantity > 1) updateQuantity(product.id, cartItem.quantity - 1);
            else removeFromCart(product.id);
        }
    };

    const handlePlus = () => {
        if (inCart) updateQuantity(product.id, cartItem.quantity + 1);
    };

    const categoryLabel = product.category.replace(/-/g, " ");
    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
                    <Link to="/" className="hover:text-app-green transition-colors">
                        <HomeIcon className="size-4" />
                    </Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-app-green transition-colors">
                        Products
                    </Link>
                    <span>/</span>
                    <Link to={`/products?category=${product.category}`} className="hover:text-app-green transition-colors capitalize">
                        {categoryLabel}
                    </Link>
                    <span>/</span>
                    <span className="text-app-green font-medium truncate max-w-[200px]">{product.name}</span>
                </nav>

                {/* Back button */}
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-app-text-light hover:text-app-green transition-colors">
                    <ArrowLeftIcon className="size-4" /> Back
                </button>

                {/* Product Details Section */}
                <div className="bg-white/50 rounded-2xl overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0 lg:gap-8">
                        {/* left side - Image & Gallery */}
                        <div className="flex flex-col bg-white rounded-3xl m-4 md:m-6 shadow-sm border border-zinc-100/50">
                            <div className="relative flex-center p-8 md:p-12 min-h-[320px] md:min-h-[480px] group overflow-hidden cursor-crosshair">
                                <img src={activeImage || selectedVariant?.image || product.image} alt={product.name} className="max-h-[360px] w-auto object-contain transition-transform duration-700 ease-out group-hover:scale-125" />

                                <div className="absolute top-5 left-5 flex flex-wrap gap-2 z-10">
                                    {product.isOrganic && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-app-green text-white rounded-full shadow-md shadow-app-green/20 backdrop-blur-md">
                                            <LeafIcon className="w-3.5 h-3.5" />
                                            Organic
                                        </span>
                                    )}
                                    {displayDiscount > 0 && <span className="px-3 py-1.5 text-xs font-bold bg-app-orange text-white rounded-full shadow-md shadow-app-orange/20 backdrop-blur-md">{displayDiscount}% OFF</span>}
                                </div>
                            </div>
                            
                            {/* Gallery Thumbnails */}
                            {(product.gallery?.length > 0 || product.variants?.some(v => v.image)) && (
                                <div className="flex gap-4 px-8 pb-8 overflow-x-auto no-scrollbar justify-center">
                                    <div onClick={() => setActiveImage(product.image)} className={`size-16 md:size-20 shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${!activeImage || activeImage === product.image ? "ring-2 ring-app-green ring-offset-2 scale-105 shadow-md" : "opacity-70 hover:opacity-100 hover:scale-105 bg-zinc-50"}`}>
                                        <img src={product.image} className="w-full h-full object-cover" />
                                    </div>
                                    {product.variants?.filter(v => v.image).map((v, i) => (
                                        <div key={`v-${i}`} onClick={() => setActiveImage(v.image)} className={`size-16 md:size-20 shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${activeImage === v.image ? "ring-2 ring-app-green ring-offset-2 scale-105 shadow-md" : "opacity-70 hover:opacity-100 hover:scale-105 bg-zinc-50"}`}>
                                            <img src={v.image} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {product.gallery?.map((imgUrl, i) => (
                                        <div key={`g-${i}`} onClick={() => setActiveImage(imgUrl)} className={`size-16 md:size-20 shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${activeImage === imgUrl ? "ring-2 ring-app-green ring-offset-2 scale-105 shadow-md" : "opacity-70 hover:opacity-100 hover:scale-105 bg-zinc-50"}`}>
                                            <img src={imgUrl} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* right side - Details */}
                        <div className="p-6 md:p-10 flex flex-col justify-center">
                            <span className="text-xs font-medium text-app-text-light tracking-wider mb-2 capitalize">{categoryLabel}</span>

                            <h1 className="text-2xl md:text-3xl font-semibold text-app-green mb-3">{product.name}</h1>

                            {/* Rating */}
                            {product.rating > 0 && (
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon key={star} className={`w-4 h-4 ${star <= Math.round(product.rating) ? "text-app-warning fill-app-warning" : "text-app-border"}`} />
                                        ))}
                                    </div>

                                    <span className="text-sm font-medium">{product.rating}</span>

                                    <span className="text-sm text-app-text-light">({product.reviewCount} reviews)</span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-5">
                                <span className="text-3xl md:text-4xl font-semibold text-app-green">
                                    {currency}
                                    {displayPrice.toFixed(2)}
                                </span>

                                {displayOriginalPrice > displayPrice && (
                                    <span className="text-lg text-app-text-light line-through">
                                        {currency}
                                        {displayOriginalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-app-text-light leading-relaxed mb-6">{product.description}</p>
                            
                            {/* Variants Selection */}
                            {product.hasVariants && product.variants && product.variants.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-zinc-900 mb-3">Available Options</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((variant) => (
                                            <button 
                                                key={variant._id} 
                                                onClick={() => {
                                                    setSelectedVariant(variant);
                                                    if (variant.image) setActiveImage(variant.image);
                                                }}
                                                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                                    selectedVariant?._id === variant._id 
                                                    ? "bg-app-green text-white shadow-lg shadow-app-green/30 ring-2 ring-app-green ring-offset-2 scale-105" 
                                                    : "bg-white text-zinc-600 border border-zinc-200 hover:border-app-green/50 hover:bg-green-50"
                                                } ${variant.stock === 0 ? "opacity-50 cursor-not-allowed saturate-0" : ""}`}
                                            >
                                                {variant.unit}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stock */}

                            <div className="mb-6">{displayStock > 0 ? <span className="text-sm text-app-success font-medium">✓ In Stock</span> : <span className="text-sm text-app-error font-medium">Out of Stock</span>}</div>

                            {/* Quantity + Add to Cart */}
                            <div className="flex items-center gap-3">
                                {displayStock === 0 ? (
                                    <form onSubmit={handleNotify} className="w-full max-w-[320px] flex gap-2">
                                        <input type="email" required placeholder="Email for restock alert" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-app-green outline-none bg-white" disabled={notifying} />
                                        <button type="submit" disabled={notifying} className="px-4 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors whitespace-nowrap disabled:opacity-50">
                                            {notifying ? "..." : "Notify Me"}
                                        </button>
                                    </form>
                                ) : inCart ? (
                                    <div className="flex items-center border border-app-green bg-app-cream text-app-green rounded-xl overflow-hidden w-full max-w-[200px]">
                                        <button onClick={handleMinus} className="py-3 px-4 hover:bg-app-green/10 transition-colors flex-center">
                                            <MinusIcon className="w-4 h-4" />
                                        </button>
                                        <span className="flex-1 text-sm font-semibold text-center min-w-[40px]">{displayQuantity}</span>
                                        <button onClick={handlePlus} className="py-3 px-4 hover:bg-app-green/10 transition-colors flex-center">
                                            <PlusIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            addToCart(product, 1, selectedVariant?._id);
                                        }}
                                        disabled={displayStock === 0}
                                        className="w-full max-w-[200px] py-3 font-semibold rounded-xl transition-colors flex-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] bg-app-orange text-white hover:bg-app-orange-dark"
                                    >
                                        <ShoppingCartIcon className="w-4 h-4" />
                                        Add to Cart
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Reviews */}
                <ReviewsSection product={product} onReviewAdded={() => {
                    api.get(`/products/${id}`).then(res => setProduct(res.data.product));
                }} />

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-12 mb-44">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-app-green">Related Products</h2>
                                <p className="text-sm text-app-text-light mt-1">More from {categoryLabel}</p>
                            </div>
                            <Link className="text-sm font-semibold text-app-orange hover:text-app-orange-dark flex items-center gap-1 transition-colors" to={`/products?category=${product.category}`}>
                                View All <ArrowRightIcon className="size-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-8">
                            {relatedProducts.slice(0, 5).map((rp) => (
                                <ProductCard key={rp.id} product={rp} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
