import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Review } from '../types';
import { Star, MessageSquare, Trash2, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'products', productId, 'reviews'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'products', productId, 'reviews'), {
        userId: user.uid,
        userName: profile?.displayName || 'Fashion Connoisseur',
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      setComment('');
      setRating(5);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${productId}/reviews`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Remove this review?")) return;
    try {
      await deleteDoc(doc(db, 'products', productId, 'reviews', reviewId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}/reviews/${reviewId}`);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <h3 className="text-2xl font-serif mb-2 italic">Client Testimonials</h3>
           <p className="text-xs uppercase tracking-widest text-white/40">{reviews.length} Verified Reviews</p>
        </div>
        
        {reviews.length > 0 && (
          <div className="flex items-center space-x-4">
             <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/40">Average Rating</p>
                <p className="text-2xl font-serif text-gold">{averageRating} / 5.0</p>
             </div>
             <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star 
                    key={s} 
                    size={16} 
                    className={Number(averageRating) >= s ? "fill-gold text-gold" : "text-white/10"} 
                  />
                ))}
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Review Form */}
        <div className="lg:col-span-1">
          {user ? (
            <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-8 space-y-8 sticky top-32">
               <div>
                  <h4 className="micro-label mb-6">Leave a Review</h4>
                  <div className="flex space-x-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform active:scale-95"
                      >
                        <Star
                          size={24}
                          className={cn(
                            "transition-colors",
                            rating >= star ? "fill-gold text-gold" : "text-white/10"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts on the quality and fit..."
                    className="input-luxury min-h-[120px] resize-none text-sm"
                  />
               </div>

               <button
                 disabled={submitting}
                 className="premium-btn-solid w-full flex items-center justify-center space-x-3"
               >
                 {submitting ? <Loader2 size={18} className="animate-spin" /> : (
                   <>
                    <Send size={16} />
                    <span>Post Review</span>
                   </>
                 )}
               </button>
            </form>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 p-8 text-center py-12">
               <MessageSquare size={32} className="mx-auto mb-4 text-white/10" />
               <p className="text-xs uppercase tracking-widest text-white/40 mb-6">Sign in to share your experience</p>
               <button className="premium-btn">Login to Review</button>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-12">
          {loading ? (
            <div className="space-y-8 animate-pulse">
              {[1, 2].map(i => <div key={i} className="h-40 bg-white/5 border border-white/10" />)}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-12">
              <AnimatePresence>
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border-b border-white/5 pb-12 last:border-0"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} className={review.rating >= s ? "fill-gold text-gold" : "text-white/10"} />
                          ))}
                        </div>
                        <h5 className="text-sm font-medium uppercase tracking-widest">{review.userName}</h5>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-[10px] uppercase tracking-tighter text-white/30">
                          {new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                        </span>
                        {(user?.uid === review.userId || profile?.isAdmin) && (
                          <button 
                            onClick={() => handleDelete(review.id)}
                            className="text-white/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-white/70 font-light leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10">
               <p className="text-sm italic text-white/30 uppercase tracking-widest">No reviews for this piece yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
