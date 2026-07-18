import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api from "../config/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import type { Product } from "../types";

interface WishlistContextType {
    wishlistItems: Product[];
    wishlistIds: string[];
    toggleWishlist: (productId: string) => void;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const wishlistIds = wishlistItems.map((item) => item.id);

    useEffect(() => {
        if (user) {
            setLoading(true);
            api.get("/wishlist")
                .then((res) => {
                    const formatted = res.data.wishlist.map((item: any) => ({
                        ...item,
                        id: item._id || item.id,
                    }));
                    setWishlistItems(formatted);
                })
                .catch((err) => console.error("Failed to load wishlist", err))
                .finally(() => setLoading(false));
        } else {
            setWishlistItems([]);
        }
    }, [user]);

    const toggleWishlist = async (productId: string) => {
        if (!user) {
            toast.error("Please login to save favorites");
            return;
        }

        try {
            const res = await api.post("/wishlist/toggle", { productId });
            if (res.data.added) {
                // To display full product instantly, we'd need it, but usually a simple re-fetch or optimistically adding is enough.
                // We'll just re-fetch for safety, or optimistically update. Let's just refetch to be accurate.
                const updatedList = await api.get("/wishlist");
                const formatted = updatedList.data.wishlist.map((item: any) => ({
                    ...item,
                    id: item._id || item.id,
                }));
                setWishlistItems(formatted);
            } else {
                setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
            }
            toast.success(res.data.message);
        } catch (error) {
            toast.error("Failed to update wishlist");
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, wishlistIds, toggleWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within WishlistProvider");
    return context;
}
