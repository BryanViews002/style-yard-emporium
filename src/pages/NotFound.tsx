import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-light tracking-wider text-primary">404</h1>
        <p className="mb-4 text-xl text-muted-foreground font-light">Oops! Page not found</p>
        <a href="/" className="text-accent hover:text-accent/80 transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
