import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem, Product } from "../types";
import { useAuth } from "./AuthContext";
import api from "../config/api";
import toast from "react-hot-toast";

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number, variantId?: string) => void;
    removeFromCart: (productId: string, variantId?: string) => void;
    updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Fetch cart on login
    useEffect(() => {
        if (user) {
            api.get("/cart")
                .then((res) => {
                    if (res.data.cart?.items) {
                        // Map _id to id for frontend compatibility
                        const formattedItems = res.data.cart.items.map((item: any) => ({
                            quantity: item.quantity,
                            variantId: item.variantId,
                            product: { ...item.product, id: item.product._id || item.product.id },
                        }));
                        setItems(formattedItems);
                    }
                })
                .catch(console.error);
        } else {
            const saved = localStorage.getItem("app_cart");
            if (saved) setItems(JSON.parse(saved));
            else setItems([]);
        }
    }, [user]);

    // Sync localStorage for guests
    useEffect(() => {
        if (!user) {
            localStorage.setItem("app_cart", JSON.stringify(items));
        }
    }, [items, user]);

    const addToCart = async (product: Product, quantity = 1, variantId?: string) => {
        if (user) {
            try {
                const res = await api.post("/cart/add", { productId: product.id, quantity, variantId });
                const formattedItems = res.data.cart.items.map((item: any) => ({
                    quantity: item.quantity,
                    variantId: item.variantId,
                    product: { ...item.product, id: item.product._id || item.product.id },
                }));
                setItems(formattedItems);
                setIsCartOpen(true);
            } catch (error) {
                toast.error("Failed to add to cart");
            }
        } else {
            setItems((prev) => {
                const existing = prev.find((item) => item.product.id === product.id && item.variantId === variantId);
                if (existing) {
                    return prev.map((item) => (item.product.id === product.id && item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item));
                }
                return [...prev, { product, quantity, variantId }];
            });
            setIsCartOpen(true);
        }
    };

    const removeFromCart = async (productId: string, variantId?: string) => {
        if (user) {
            try {
                const res = await api.delete(`/cart/remove/${productId}`, { data: { variantId } });
                const formattedItems = res.data.cart.items.map((item: any) => ({
                    quantity: item.quantity,
                    variantId: item.variantId,
                    product: { ...item.product, id: item.product._id || item.product.id },
                }));
                setItems(formattedItems);
            } catch (error) {
                toast.error("Failed to remove item");
            }
        } else {
            setItems((prev) => prev.filter((item) => !(item.product.id === productId && item.variantId === variantId)));
        }
    };

    const updateQuantity = async (productId: string, quantity: number, variantId?: string) => {
        if (quantity <= 0) {
            removeFromCart(productId, variantId);
            return;
        }

        if (user) {
            try {
                const res = await api.put("/cart/update", { productId, quantity, variantId });
                const formattedItems = res.data.cart.items.map((item: any) => ({
                    quantity: item.quantity,
                    variantId: item.variantId,
                    product: { ...item.product, id: item.product._id || item.product.id },
                }));
                setItems(formattedItems);
            } catch (error) {
                toast.error("Failed to update quantity");
            }
        } else {
            setItems((prev) => prev.map((item) => (item.product.id === productId && item.variantId === variantId ? { ...item, quantity } : item)));
        }
    };

    const clearCart = async () => {
        if (user) {
            try {
                await api.delete("/cart/clear");
                setItems([]);
                setIsCartOpen(false);
            } catch (error) {
                toast.error("Failed to clear cart");
            }
        } else {
            setItems([]);
            setIsCartOpen(false);
        }
    };

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = items.reduce((sum, item) => {
        let price = item.product.price;
        if (item.variantId && item.product.variants) {
            const v = item.product.variants.find(v => v._id === item.variantId);
            if (v) price = v.price;
        }
        return sum + price * item.quantity;
    }, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}

