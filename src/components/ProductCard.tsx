import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { Plus, Star, Heart, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

interface Props {
    product: Product;
}

export const ProductCardSingle = ({ product, variant }: { product: Product; variant?: any }) => {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";

    const { items, addToCart, updateQuantity, removeFromCart } = useCart();
    const { toggleWishlist, wishlistIds } = useWishlist();
    const navigate = useNavigate();

    const isWished = wishlistIds.includes(product.id);
    const isOutOfStock = variant ? variant.stock === 0 : product.stock === 0;

    const displayPrice = variant ? variant.price : product.price;
    const displayOriginalPrice = variant ? variant.originalPrice : product.originalPrice;
    const displayUnit = variant ? variant.unit : product.unit;
    
    let displayDiscount = 0;
    if (variant) {
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

    const cartItem = items.find((i) => i.product.id === product.id && i.variantId === (variant?._id || variant?.id));
    const nonVariantCartItem = items.find((i) => i.product.id === product.id && !i.variantId);
    const activeCartItem = variant ? cartItem : nonVariantCartItem;

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-md transition-all duration-300 group animate-fade-in cursor-pointer flex flex-col" onClick={() => navigate(`/products/${product.id}${variant ? `?variant=${variant._id || variant.id}` : ''}`)}>
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-white shrink-0">
                <img src={variant?.image || product.image} alt={product.name} className="w-full h-full object-cover p-4 group-hover:p-2 transition-all duration-300" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {displayDiscount > 0 && <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-app-orange text-white rounded-full">{displayDiscount}% OFF</span>}
                    {isOutOfStock && <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-red-500 text-white rounded-full">Out of Stock</span>}
                </div>

                {/* Wishlist Toggle */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
                >
                    <Heart className={`size-4 ${isWished ? "fill-app-error text-app-error" : "text-zinc-400"}`} />
                </button>
            </div>

            {/* Info */}
            <div className="p-3.5 text-zinc-700 flex flex-col flex-1">
                <h3 className="text-sm leading-snug mb-1.5 line-clamp-2">{product.name}</h3>

                {/* Rating */}
                {product.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="size-3 text-app-warning fill-app-warning" />
                        <span className="text-xs font-medium text-app-text">{product.rating}</span>
                        <span className="text-xs text-app-text-light">({product.reviewCount})</span>
                    </div>
                )}

                <div className="mt-auto">
                    {/* Price + Add */}
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col truncate">
                            <div className="flex items-baseline gap-1">
                                <span className="text-base font-medium">
                                    {currency}
                                    {displayPrice.toFixed(1)}
                                </span>
                                {displayOriginalPrice > displayPrice && (
                                    <span className="text-xs text-app-text-light line-through">
                                        {currency}
                                        {displayOriginalPrice.toFixed(1)}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-app-text-light block">{displayUnit}</span>
                        </div>

                        {activeCartItem ? (
                            <div className="flex items-center gap-1.5 bg-app-orange text-white rounded-lg px-1.5 py-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => {
                                        if (activeCartItem.quantity > 1) {
                                            updateQuantity(activeCartItem.id, activeCartItem.quantity - 1);
                                        } else {
                                            removeFromCart(activeCartItem.id);
                                        }
                                    }}
                                    className="size-5 flex-center hover:bg-white/20 rounded-md transition-colors"
                                >
                                    <Minus className="size-3" />
                                </button>
                                <span className="text-xs font-semibold w-4 text-center">{activeCartItem.quantity}</span>
                                <button
                                    onClick={() => {
                                        updateQuantity(activeCartItem.id, activeCartItem.quantity + 1);
                                    }}
                                    className="size-5 flex-center hover:bg-white/20 rounded-md transition-colors"
                                >
                                    <Plus className="size-3" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isOutOfStock) return;
                                    addToCart(product, variant ? (variant._id || variant.id) : undefined);
                                }}
                                disabled={isOutOfStock}
                                className="px-3 py-1.5 rounded-lg bg-app-cream text-app-green font-medium text-xs hover:bg-app-green hover:text-white transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductCard = ({ product }: Props) => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
        return (
            <>
                {product.variants.map((v: any, index: number) => (
                    <ProductCardSingle key={v._id || v.id || index} product={product} variant={v} />
                ))}
            </>
        );
    }
    return <ProductCardSingle product={product} />;
};

export default ProductCard;
