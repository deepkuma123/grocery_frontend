import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { Plus, Star, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

interface Props {
    product: Product;
}

const ProductCard = ({ product }: Props) => {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    const { addToCart } = useCart();
    const { toggleWishlist, wishlistIds } = useWishlist();
    const navigate = useNavigate();

    const isWished = wishlistIds.includes(product.id);

    let isOutOfStock = false;
    if (product.hasVariants && product.variants) {
        isOutOfStock = product.variants.every(v => v.stock === 0);
    } else {
        isOutOfStock = product.stock === 0;
    }

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-md transition-all duration-300 group animate-fade-in cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover p-4 group-hover:p-2 transition-all duration-300" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {product.discount > 0 && <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-app-orange text-white rounded-full">{product.discount}% OFF</span>}
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
            <div className="p-3.5 text-zinc-700">
                <h3 className="text-sm leading-snug mb-1.5 line-clamp-2">{product.name}</h3>

                {/* Rating */}
                {product.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="size-3 text-app-warning fill-app-warning" />
                        <span className="text-xs font-medium text-app-text">{product.rating}</span>
                        <span className="text-xs text-app-text-light">({product.reviewCount})</span>
                    </div>
                )}

                {/* Price + Add */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 truncate">
                        <span className="text-base font-medium">
                            {currency}
                            {product.price.toFixed(1)}
                        </span>
                        <span className="text-xs text-app-text-light block">/{product.unit}</span>
                        {product.originalPrice > product.price && (
                            <span className="text-xs text-app-text-light line-through ml-1.5">
                                {currency}
                                {product.originalPrice.toFixed(1)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isOutOfStock) return;
                            if (product.hasVariants) {
                                navigate(`/products/${product.id}`);
                            } else {
                                addToCart(product);
                            }
                        }}
                        disabled={isOutOfStock}
                        className="size-7 rounded-full bg-app-orange text-white flex-center shrink-0 hover:bg-app-orange-dark transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="size-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
