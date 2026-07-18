import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Wishlist = () => {
    const { wishlistItems, loading } = useWishlist();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app-cream py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="size-6 text-app-error fill-app-error" />
                    <h1 className="text-2xl font-bold text-zinc-900">My Wishlist</h1>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <div className="size-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="size-8 text-app-error" />
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-zinc-500 mb-6">Save items you love and buy them later.</p>
                        <Link to="/products" className="inline-block px-6 py-2.5 bg-app-green text-white font-medium rounded-xl hover:bg-green-800 transition-colors">
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-8">
                        {wishlistItems.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
