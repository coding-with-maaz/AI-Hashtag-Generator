import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CircleOff, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="space-y-6 max-w-md mx-auto">
        <div className="flex flex-col items-center space-y-2">
          <CircleOff className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
          <p className="text-muted-foreground text-lg">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/search">
              <Search className="mr-2 h-4 w-4" />
              Try a Search
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}