import { useState, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  is_verified_purchase: boolean;
  images?: string[];
  helpful_count: number;
}

interface ReviewWithVotingProps {
  review: Review;
  onVote?: () => void;
}

export const ReviewWithVoting = ({ review, onVote }: ReviewWithVotingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userVote, setUserVote] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState({ helpful: 0, not_helpful: 0 });

  useEffect(() => {
    loadVotes();
  }, [review.id, user]);

  const loadVotes = async () => {
    // Get vote counts
    const { data: votes } = await supabase
      .from("review_votes")
      .select("vote_type")
      .eq("review_id", review.id);

    if (votes) {
      const helpful = votes.filter((v) => v.vote_type === "helpful").length;
      const not_helpful = votes.filter((v) => v.vote_type === "not_helpful").length;
      setVoteCount({ helpful, not_helpful });
    }

    // Check if user voted
    if (user) {
      const { data } = await supabase
        .from("review_votes")
        .select("vote_type")
        .eq("review_id", review.id)
        .eq("user_id", user.id)
        .maybeSingle();

      setUserVote(data?.vote_type || null);
    }
  };

  const handleVote = async (voteType: "helpful" | "not_helpful") => {
    if (!user) {
      toast({ title: "Please log in to vote", variant: "destructive" });
      return;
    }

    try {
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from("review_votes")
          .delete()
          .eq("review_id", review.id)
          .eq("user_id", user.id);
        setUserVote(null);
      } else {
        // Add or update vote
        await supabase
          .from("review_votes")
          .upsert({
            review_id: review.id,
            user_id: user.id,
            vote_type: voteType,
          });
        setUserVote(voteType);
      }

      loadVotes();
      onVote?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Error voting", description: errorMessage, variant: "destructive" });
    }
  };

  return (
    <div className="border-b pb-6 space-y-4">
      {/* Rating and Verified Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                review.rating > i ? "fill-accent text-accent" : "text-muted"
              }`}
            />
          ))}
        </div>
        {review.is_verified_purchase && (
          <Badge variant="secondary" className="text-xs">
            Verified Purchase
          </Badge>
        )}
      </div>

      {/* Title and Comment */}
      <div>
        <h4 className="font-medium text-lg mb-2">{review.title}</h4>
        <p className="text-muted-foreground">{review.comment}</p>
      </div>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="h-20 w-20 object-cover rounded"
            />
          ))}
        </div>
      )}

      {/* Date and Voting */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {new Date(review.created_at).toLocaleDateString()}
        </p>
        
        <div className="flex items-center gap-4">
          <Button
            variant={userVote === "helpful" ? "default" : "outline"}
            size="sm"
            onClick={() => handleVote("helpful")}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Helpful ({voteCount.helpful})
          </Button>
          <Button
            variant={userVote === "not_helpful" ? "default" : "outline"}
            size="sm"
            onClick={() => handleVote("not_helpful")}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            ({voteCount.not_helpful})
          </Button>
          <Button variant="ghost" size="sm">
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};