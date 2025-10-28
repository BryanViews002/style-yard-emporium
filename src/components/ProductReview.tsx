import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Star, ThumbsUp, MessageSquare, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_votes: number;
  created_at: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  user_has_voted?: boolean;
  user_vote_helpful?: boolean;
}

interface ProductReviewProps {
  productId: string;
  productName: string;
}

const ProductReview: React.FC<ProductReviewProps> = ({ productId, productName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: ''
  });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const { data, error} = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map reviews with anonymous user profiles
      const reviewsWithProfiles = (data || []).map(review => ({
        ...review,
        user_profile: {
          full_name: `Customer ${review.user_id.slice(0, 8)}`,
          avatar_url: null
        },
        user_has_voted: false,
        user_vote_helpful: false
      }));

      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Don't show error toast, just show empty reviews
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to write a review.",
        variant: "destructive",
      });
      return;
    }

    if (reviewForm.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
          is_verified_purchase: true // You can implement verification logic
        });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });

      setIsWritingReview(false);
      setReviewForm({ rating: 0, title: '', comment: '' });
      loadReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleVoteHelpful = async (reviewId: string, isHelpful: boolean) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to vote on reviews.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('review_helpful_votes')
        .upsert({
          review_id: reviewId,
          user_id: user.id,
          is_helpful: isHelpful
        });

      if (error) throw error;

      loadReviews(); // Reload to get updated vote counts
    } catch (error: any) {
      console.error('Error voting on review:', error);
      toast({
        title: "Error",
        description: "Failed to vote on review.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setReviewForm({ ...reviewForm, rating: star }) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div>
                {renderStars(Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) || 0)}
                <p className="text-sm text-muted-foreground">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {user && (
              <Dialog open={isWritingReview} onOpenChange={setIsWritingReview}>
                <DialogTrigger asChild>
                  <Button>Write a Review</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Write a Review for {productName}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="mt-2">
                        {renderStars(reviewForm.rating, true)}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Review Title</Label>
                      <Input
                        id="title"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                        placeholder="Summarize your experience"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="comment">Your Review</Label>
                      <Textarea
                        id="comment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        placeholder="Tell others about your experience with this product"
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsWritingReview(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Submit Review</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {review.user_profile?.full_name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                          {review.is_verified_purchase && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-medium">{review.title}</h4>
                  )}
                  
                  {review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )}
                  
                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVoteHelpful(review.id, true)}
                      className={`flex items-center gap-1 ${
                        review.user_has_voted && review.user_vote_helpful 
                          ? 'text-green-600' 
                          : 'text-muted-foreground hover:text-green-600'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpful_votes})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReview;
