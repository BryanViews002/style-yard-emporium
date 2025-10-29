import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  ShoppingBag, 
  Search, 
  ArrowLeft, 
  Sparkles,
  Package
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <Card className="border-2 border-border/50 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-8 md:p-12">
            {/* 404 Number */}
            <div className="text-center mb-8">
              <div className="inline-block relative">
                <h1 className="text-8xl md:text-9xl font-light tracking-wider text-primary/20 select-none">
                  404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-16 w-16 md:h-20 md:w-20 text-accent animate-pulse" />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl md:text-4xl font-light tracking-wider text-primary">
                Page Not Found
              </h2>
              <Separator className="max-w-xs mx-auto" />
              <p className="text-base md:text-lg text-muted-foreground font-light max-w-md mx-auto">
                The page you're looking for seems to have wandered off. 
                Let's get you back to shopping our luxury collection.
              </p>
              
              {/* Current Path */}
              <div className="pt-4">
                <code className="text-xs md:text-sm bg-muted px-4 py-2 rounded-lg text-muted-foreground inline-block break-all">
                  {location.pathname}
                </code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button 
                onClick={() => navigate('/')}
                size="lg"
                className="btn-hero w-full sm:w-auto"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
              
              <Button 
                onClick={() => navigate('/shop')}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Shop
              </Button>
              
              <Button 
                onClick={handleGoBack}
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Popular Destinations
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-xs"
            >
              Home
            </Button>
            <span className="text-muted-foreground">•</span>
            <Button 
              variant="link" 
              onClick={() => navigate('/shop')}
              className="text-xs"
            >
              Shop
            </Button>
            <span className="text-muted-foreground">•</span>
            <Button 
              variant="link" 
              onClick={() => navigate('/about')}
              className="text-xs"
            >
              About
            </Button>
            <span className="text-muted-foreground">•</span>
            <Button 
              variant="link" 
              onClick={() => navigate('/contact')}
              className="text-xs"
            >
              Contact
            </Button>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 text-center">
          <Card className="border border-border/50 p-6 bg-card/50">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Looking for something specific?
              </p>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Try searching our collection or browse by category
            </p>
            <Button 
              onClick={() => navigate('/shop')}
              variant="outline"
              size="sm"
            >
              Explore Collection
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
