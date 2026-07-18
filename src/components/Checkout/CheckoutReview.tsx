import { CheckIcon, TruckIcon } from "lucide-react";
import type { Address } from "../../types";

interface CheckoutReviewProps {
    address: Address;
    items: any[];
    handlePlaceOrder: () => void;
    loading: boolean;
    total: number;
    deliveryTimeSlot: string;
    setDeliveryTimeSlot: (val: string) => void;
}

export default function CheckoutReview({ address, items, handlePlaceOrder, loading, total, deliveryTimeSlot, setDeliveryTimeSlot }: CheckoutReviewProps) {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    return (
        <div className="bg-white rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-app-green mb-5 flex items-center gap-2">
                <CheckIcon className="size-5" /> Review Your Order
            </h2>

            {/* Delivery Info */}
            <div className="mb-5 p-4 bg-app-cream rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                    <TruckIcon className="size-4 text-app-green" />
                    <span className="text-sm font-semibold text-app-green">Delivery Address</span>
                </div>
                <p className="text-sm text-app-text-light">
                    {address.label} — {address.address}, {address.city}, {address.state} {address.zip}
                </p>
                
                <div className="mt-4 pt-4 border-t border-app-green/10">
                    <label className="block text-sm font-semibold text-app-green mb-2">Delivery Time Slot</label>
                    <select 
                        value={deliveryTimeSlot} 
                        onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                        className="w-full p-2.5 border border-app-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-app-green bg-white"
                    >
                        <option value="ASAP">ASAP (within 45 mins)</option>
                        <option value="Today: 4 PM - 6 PM">Today: 4 PM - 6 PM</option>
                        <option value="Today: 6 PM - 8 PM">Today: 6 PM - 8 PM</option>
                        <option value="Tomorrow: 8 AM - 10 AM">Tomorrow: 8 AM - 10 AM</option>
                        <option value="Tomorrow: 10 AM - 12 PM">Tomorrow: 10 AM - 12 PM</option>
                    </select>
                </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-5">
                {items.map((item) => {
                    let price = item.product.price;
                    let name = item.product.name;
                    if (item.variantId && item.product.variants) {
                        const variant = item.product.variants.find((v: any) => v._id === item.variantId);
                        if (variant) {
                            price = variant.price;
                            name = `${item.product.name} - ${variant.unit}`;
                        }
                    }
                    return (
                        <div key={item.product.id + (item.variantId || "")} className="flex items-center gap-3">
                            <img src={item.product.image} alt={item.product.name} className="size-12 rounded-lg object-cover" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-app-green">{name}</p>
                                <p className="text-xs text-app-text-light">Qty: {item.quantity}</p>
                            </div>
                            <span className="text-sm font-semibold">
                                {currency}
                                {(price * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    );
                })}
            </div>

            <button onClick={handlePlaceOrder} disabled={loading} className="w-full py-3 bg-app-orange text-white font-semibold rounded-xl hover:bg-app-orange-dark transition-colors disabled:opacity-60 active:scale-[0.98]">
                {loading ? "Placing Order..." : `Place Order — ${currency}${total.toFixed(2)}`}
            </button>
        </div>
    );
}
