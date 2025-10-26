import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../test/utils";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { createMockCartContext } from "../test/utils";

// Test the Button component
describe("Button Component", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant classes correctly", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive");
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});

// Test the LoadingSpinner component
describe("LoadingSpinner Component", () => {
  it("renders spinner with default props", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
  });

  it("renders with custom text", () => {
    render(<LoadingSpinner text="Loading products..." />);
    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  it("renders full screen when specified", () => {
    render(<LoadingSpinner fullScreen />);
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner.parentElement).toHaveClass("fixed");
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner.parentElement).toHaveClass("custom-class");
  });
});

// Test utility functions
describe("Utility Functions", () => {
  describe("getUserFriendlyMessage", () => {
    it("returns user-friendly message for known error codes", () => {
      const { getUserFriendlyMessage } = require("@/utils/errorHandling");

      const networkError = { code: "NETWORK_ERROR" };
      const message = getUserFriendlyMessage(networkError);

      expect(message).toBe(
        "Network connection failed. Please check your internet connection and try again."
      );
    });

    it("returns original message for unknown error codes", () => {
      const { getUserFriendlyMessage } = require("@/utils/errorHandling");

      const unknownError = { message: "Custom error message" };
      const message = getUserFriendlyMessage(unknownError);

      expect(message).toBe("Custom error message");
    });
  });

  describe("isRetryableError", () => {
    it("identifies network errors as retryable", () => {
      const { isRetryableError } = require("@/utils/errorHandling");

      const networkError = { code: "NETWORK_ERROR" };
      expect(isRetryableError(networkError)).toBe(true);
    });

    it("identifies 5xx server errors as retryable", () => {
      const { isRetryableError } = require("@/utils/errorHandling");

      const serverError = { status: 500 };
      expect(isRetryableError(serverError)).toBe(true);
    });

    it("identifies 4xx client errors as not retryable", () => {
      const { isRetryableError } = require("@/utils/errorHandling");

      const clientError = { status: 400 };
      expect(isRetryableError(clientError)).toBe(false);
    });
  });
});

// Test context providers
describe("Context Providers", () => {
  describe("CartProvider", () => {
    it("provides cart context to children", () => {
      const TestComponent = () => {
        const { items } = require("@/context/CartContext").useCart();
        return <div data-testid="cart-items">{items.length}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId("cart-items")).toHaveTextContent("0");
    });
  });

  describe("WishlistProvider", () => {
    it("provides wishlist context to children", () => {
      const TestComponent = () => {
        const { wishlist } = require("@/context/WishlistContext").useWishlist();
        return <div data-testid="wishlist-items">{wishlist.length}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId("wishlist-items")).toHaveTextContent("0");
    });
  });
});

// Test error handling
describe("Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles component errors gracefully", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    // This should not crash the test
    expect(() => render(<ThrowError />)).toThrow("Test error");
  });

  it("logs errors in development mode", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { ErrorHandler } = require("@/utils/errorHandling");
    const handler = ErrorHandler.getInstance();

    handler.handleError(new Error("Test error"), "test-context");

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
