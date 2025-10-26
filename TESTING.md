# Testing Guide

This project uses Vitest as the testing framework with React Testing Library for component testing.

## Test Structure

```
src/
├── test/
│   ├── setup.ts          # Test configuration and global mocks
│   ├── utils.tsx         # Custom render function and test utilities
│   ├── components.test.tsx    # Unit tests for components
│   └── integration.test.tsx   # Integration tests
├── components/
│   └── __tests__/        # Component-specific tests
└── pages/
    └── __tests__/        # Page-specific tests
```

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Component Tests

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "../test/utils";
import { Button } from "@/components/ui/button";

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
});
```

### Integration Tests

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "../test/utils";
import { createMockCartContext } from "../test/utils";
import Cart from "@/pages/Cart";

describe("Cart Page Integration", () => {
  it("displays cart items correctly", () => {
    const mockCartContext = createMockCartContext({
      items: [mockProduct],
    });

    vi.doMock("@/context/CartContext", () => ({
      useCart: () => mockCartContext,
    }));

    render(<Cart />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
  });
});
```

## Test Utilities

### Custom Render Function

The `customRender` function includes all necessary providers:

```tsx
import { customRender as render } from "../test/utils";

render(<MyComponent />);
```

### Mock Data

Use the provided mock data for consistent testing:

```tsx
import { mockUser, mockProduct, mockOrder } from "../test/utils";
```

### Context Mocks

Create mock context values easily:

```tsx
import {
  createMockCartContext,
  createMockWishlistContext,
} from "../test/utils";

const mockCartContext = createMockCartContext({
  items: [mockProduct],
  addToCart: vi.fn(),
});
```

## Testing Best Practices

### 1. Test User Behavior

Focus on testing what users can see and do:

```tsx
// Good: Test user-visible behavior
expect(screen.getByText("Add to Cart")).toBeInTheDocument();

// Avoid: Test implementation details
expect(component.state.cartItems).toHaveLength(1);
```

### 2. Use Semantic Queries

Prefer semantic queries over test IDs:

```tsx
// Good: Use semantic queries
screen.getByRole("button", { name: "Add to Cart" });
screen.getByLabelText("Email address");

// Avoid: Use test IDs when semantic queries are available
screen.getByTestId("add-to-cart-button");
```

### 3. Test Error States

Always test error handling:

```tsx
it("displays error message when API fails", async () => {
  // Mock API failure
  vi.doMock("@/integrations/supabase/client", () => ({
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: null, error: { message: "API Error" } })
            ),
          })),
        })),
      })),
    },
  }));

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
```

### 4. Test Accessibility

Ensure components are accessible:

```tsx
it("has proper accessibility attributes", () => {
  render(<Button aria-label="Add to cart">+</Button>);

  const button = screen.getByRole("button", { name: "Add to cart" });
  expect(button).toBeInTheDocument();
});
```

### 5. Mock External Dependencies

Always mock external dependencies:

```tsx
// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

// Mock React Router
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: "test-id" }),
}));
```

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Debugging Tests

### Common Issues

1. **Async Operations**: Use `waitFor` for async operations
2. **Context Providers**: Ensure all necessary providers are included
3. **Mock Cleanup**: Clear mocks between tests with `vi.clearAllMocks()`

### Debug Commands

```bash
# Run specific test file
npm run test components.test.tsx

# Run tests matching pattern
npm run test -- --grep "Button"

# Run tests in debug mode
npm run test -- --reporter=verbose
```

## Continuous Integration

Tests run automatically on:

- Pull requests
- Main branch pushes
- Release tags

Ensure all tests pass before merging code.
