import { useEffect, useMemo, useState } from "react";
import type { Product } from "../types";
import { StarIcon, ThumbsUpIcon, UserIcon } from "lucide-react";
import api from "../config/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface Review {
    id: string;
    user: { id: string; name: string };
    rating: number;
    comment: string;
    createdAt: string;
}

export default function ReviewsSection({ product, onReviewAdded }: { product: Product; onReviewAdded?: () => void }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get(`/reviews/${product.id}`)
            .then((res) => setReviews(res.data.reviews))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [product.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post("/reviews", { productId: product.id, rating, comment });
            toast.success("Review added!");
            setComment("");
            setRating(5);
            setReviews([{ ...res.data.review, id: res.data.review._id, user: { id: user?.id, name: user?.name } }, ...reviews]);
            if (onReviewAdded) onReviewAdded();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const breakdown = useMemo(() => {
        const counts = [0, 0, 0, 0, 0];
        reviews.forEach((r) => counts[r.rating - 1]++);
        return counts.reverse(); // 5→1
    }, [reviews]);

    const maxCount = Math.max(...breakdown, 1);
    const totalReviews = reviews.length || product.reviewCount || 1; // Fallback to 1 to avoid NaN

    return (
        <section className="mt-10 ">
            <h2 className="text-2xl font-semibold text-app-green mb-6">Customer Reviews</h2>

            <div className="bg-white/50 rounded-2xl p-6 md:p-8">
                {/* Summary row */}
                <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-app-border">
                    {/* Average */}
                    <div className="flex-center flex-col md:min-w-[160px] lg:w-1/3">
                        <span className="text-5xl font-semibold text-app-green">{product.rating}</span>
                        <div className="flex items-center gap-0.5 mt-2 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <StarIcon key={s} className={`size-4 ${s <= Math.round(product.rating) ? "text-app-warning fill-app-warning" : "text-app-border"}`} />
                            ))}
                        </div>
                        <span className="text-sm text-zinc-600">{reviews.length} reviews</span>
                    </div>

                    {/* Breakdown bars */}
                    <div className="flex-1 space-y-2">
                        {breakdown.map((count, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-sm text-zinc-600 w-8 text-right">{5 - i} ★</span>
                                <div className="flex-1 h-2.5 bg-app-border rounded-full overflow-hidden">
                                    <div className="h-full bg-app-warning rounded-full transition-all duration-500" style={{ width: `${(count / maxCount) * 100}%` }} />
                                </div>
                                <span className="text-xs text-zinc-600 w-6">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Review */}
                {user && (
                    <div className="mb-8 p-5 bg-app-cream rounded-xl border border-app-border">
                        <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                            <StarIcon className="size-4 text-app-orange fill-app-orange" /> Write a Review
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-center gap-2 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon key={star} onClick={() => setRating(star)} className={`size-6 cursor-pointer transition-colors ${star <= rating ? "text-app-warning fill-app-warning" : "text-app-border hover:text-app-warning/50"}`} />
                                ))}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What did you think about this product?"
                                className="w-full p-3 rounded-lg border border-app-border text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-app-green/20"
                                rows={3}
                            />
                            <button type="submit" disabled={submitting} className="px-5 py-2 bg-app-green text-white text-sm font-medium rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors">
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Individual reviews */}
                <div className="space-y-6">
                    {loading ? (
                        <p className="text-zinc-500 text-center py-4">Loading reviews...</p>
                    ) : reviews.length === 0 ? (
                        <p className="text-zinc-500 text-center py-4">No reviews yet. Be the first to review!</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="flex gap-4">
                                <div className="size-10 rounded-full bg-app-green/10 text-app-green flex-center shrink-0 text-sm font-semibold">{review.user?.name?.charAt(0).toUpperCase() || <UserIcon className="size-5" />}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2 mb-1">
                                        <span className="text-sm font-semibold text-app-text">{review.user?.name}</span>
                                        <span className="text-xs text-zinc-600">·</span>
                                        <span className="text-xs text-zinc-600">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5 mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <StarIcon key={s} className={`size-3.5 ${s <= review.rating ? "text-app-warning fill-app-warning" : "text-app-border"}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-zinc-600 leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
