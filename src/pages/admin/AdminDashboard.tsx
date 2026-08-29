import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PackageIcon, UsersIcon, ShoppingBagIcon, AlertTriangleIcon } from "lucide-react";
import Loading from "../../components/Loading";
import { statusColors } from "../../assets/assets";
import api from "../../config/api";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface Stats {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
    totalProfit: number;
    recentOrders: any[];
    salesData: any[];
}

export default function AdminDashboard() {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";

    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);

    const [settings, setSettings] = useState<any>(null);
    const [bannerUrl, setBannerUrl] = useState("");
    const [savingBanner, setSavingBanner] = useState(false);

    const chartData = {
        labels: stats?.salesData?.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }) || [],
        datasets: [
            {
                fill: true,
                label: 'Revenue',
                data: stats?.salesData?.map(d => d.revenue) || [],
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22, 163, 74, 0.2)',
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return currency + context.parsed.y.toFixed(2);
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                grid: { color: '#f4f4f5' },
                ticks: {
                    callback: function(value: any) {
                        return currency + value;
                    }
                }
            }
        }
    };

    useEffect(() => {
        setLoading(true);
        api.get(`/admin/stats?days=${days}`)
            .then((res) => setStats(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));

        api.get("/settings")
            .then(res => {
                setSettings(res.data.settings);
                setBannerUrl(res.data.settings?.homeBannerImage || "");
            })
            .catch(() => {});
    }, [days]);

    const handleSaveBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingBanner(true);
        try {
            await api.put("/settings", { homeBannerImage: bannerUrl });
            toast.success("Home banner updated successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update banner");
        } finally {
            setSavingBanner(false);
        }
    };

    const cards = stats
        ? [
              { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBagIcon },
              { label: "Total Profit", value: `${currency}${stats.totalProfit?.toFixed(2) || "0.00"}`, icon: PackageIcon },
              { label: "Total Users", value: stats.totalUsers, icon: UsersIcon },
              { label: "Out of Stock", value: stats.outOfStock, icon: AlertTriangleIcon, link: "/admin/products?status=outofstock" },
              { label: "Low Stock", value: stats.lowStock, icon: AlertTriangleIcon, link: "/admin/products?status=lowstock" },
          ]
        : [];

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {cards.map((card) => {
                    const CardWrapper = card.link ? Link : 'div';
                    return (
                        <CardWrapper to={card.link || ""} key={card.label} className={`bg-white rounded-2xl p-5 border border-app-border flex justify-between gap-3 ${card.link ? 'hover:shadow-md hover:border-app-green transition-all cursor-pointer' : ''}`}>
                            <div>
                                <p className="text-2xl font-semibold text-zinc-900">{card.value}</p>
                                <p className="text-sm text-app-text-light">{card.label}</p>
                            </div>
                            <div className={`size-10 rounded-xl flex-center bg-orange-50 text-orange-600`}>
                                <card.icon className="size-5" />
                            </div>
                        </CardWrapper>
                    );
                })}
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-2xl border border-app-border overflow-hidden p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900">Revenue Overview</h2>
                    <select 
                        value={days} 
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 outline-none focus:border-app-green focus:ring-1 focus:ring-app-green transition-all"
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                    </select>
                </div>
                <div className="h-72 w-full">
                    {stats?.salesData?.some(d => d.revenue > 0) ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl">
                            <div className="text-center">
                                <p className="text-zinc-500 font-medium">No sales data for this period</p>
                                <p className="text-xs text-zinc-400 mt-1">Try selecting a different date range.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-app-border overflow-hidden">
                <div className="px-6 py-5 border-b border-app-border flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-sm font-medium text-app-orange hover:text-app-orange-dark transition-colors">
                        View All →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-app-cream/50 text-zinc-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {stats?.recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                        No orders yet.
                                    </td>
                                </tr>
                            ) : (
                                stats?.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{order.id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-zinc-900">{order.user?.name || "—"}</p>
                                            <p className="text-xs text-zinc-500">{order.user?.email || ""}</p>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">{order.items?.length || 0} items</td>
                                        <td className="px-6 py-4 font-medium">
                                            {currency}
                                            {order.total?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || "bg-zinc-100 text-zinc-600"}`}>{order.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Settings */}
            <div className="bg-white rounded-2xl border border-app-border overflow-hidden p-6">
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Quick Settings</h2>
                <form onSubmit={handleSaveBanner} className="max-w-md">
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Home Banner Image URL</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={bannerUrl}
                            onChange={(e) => setBannerUrl(e.target.value)}
                            placeholder="https://... (Leave empty for default)"
                            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all"
                        />
                        <button disabled={savingBanner} type="submit" className="px-4 py-2.5 bg-app-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                            {savingBanner ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
