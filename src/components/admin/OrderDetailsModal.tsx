import { XIcon, MapPinIcon, ClockIcon } from "lucide-react";

interface OrderDetailsModalProps {
    order: any;
    onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    if (!order) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-app-border bg-app-cream/30 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-900">Order #{order.id.slice(-6).toUpperCase()}</h2>
                        <p className="text-sm text-zinc-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
                        <XIcon className="size-5" />
                    </button>
                </div>

                <div className="flex-1 p-6 space-y-8">
                    {/* Customer Info */}
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">Customer Details</h3>
                        <div className="bg-zinc-50 rounded-xl p-4 border border-app-border">
                            <p className="font-medium text-zinc-900">{order.user?.name || "Unknown User"}</p>
                            <p className="text-sm text-zinc-500 mt-1">{order.user?.email || "No email provided"}</p>
                        </div>
                    </section>

                    {/* Delivery Details */}
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">Delivery Information</h3>
                        <div className="bg-zinc-50 rounded-xl p-4 border border-app-border space-y-3">
                            <div className="flex gap-3">
                                <MapPinIcon className="size-5 text-zinc-400 shrink-0" />
                                <div className="text-sm text-zinc-600">
                                    <span className="font-medium text-zinc-900 block mb-1">{order.shippingAddress?.label || "Address"}</span>
                                    {order.shippingAddress?.address}
                                    <br />
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
                                </div>
                            </div>
                            {order.deliveryTimeSlot && (
                                <div className="flex gap-3 pt-3 border-t border-app-border">
                                    <ClockIcon className="size-5 text-zinc-400 shrink-0" />
                                    <div className="text-sm">
                                        <span className="text-zinc-500 block mb-0.5">Requested Time Slot</span>
                                        <span className="font-medium text-app-green">{order.deliveryTimeSlot}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Order Items */}
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">Itemized Breakdown ({order.items?.length || 0})</h3>
                        <div className="border border-app-border rounded-xl divide-y divide-app-border overflow-hidden">
                            {order.items?.map((item: any, index: number) => (
                                <div key={index} className="p-4 flex gap-4 hover:bg-zinc-50 transition-colors">
                                    <img src={item.image} alt={item.name} className="size-16 rounded-lg object-cover border border-app-border" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-zinc-900 line-clamp-2 leading-tight">{item.name}</p>
                                        
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
                                                {item.unit}
                                            </span>
                                            {item.variantId && (
                                                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-mono rounded-md border border-zinc-200">
                                                    Variant ID: {item.variantId.slice(-4).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-semibold text-zinc-900">{currency}{(item.price * item.quantity).toFixed(2)}</p>
                                        <p className="text-xs text-zinc-500 mt-1">{item.quantity} x {currency}{item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Summary */}
                    <section className="bg-app-cream/30 rounded-xl p-5 border border-app-border">
                        <div className="space-y-2 text-sm text-zinc-600 mb-4 pb-4 border-b border-app-border">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{currency}{order.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>{order.deliveryFee === 0 ? "Free" : `${currency}${order.deliveryFee?.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{currency}{order.tax?.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-app-success">
                                    <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                                    <span>-{currency}{order.discount?.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-zinc-900">Total</span>
                            <span className="text-xl font-bold text-app-green">{currency}{order.total?.toFixed(2)}</span>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
