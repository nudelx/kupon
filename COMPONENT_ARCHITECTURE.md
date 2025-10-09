# Component Architecture

This document outlines the refactored component structure of the Kupon application, designed for maintainability, reusability, and clear separation of concerns.

## 📁 Directory Structure

```
src/
├── components/
│   ├── ui/                    # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Alert.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── coupons/               # Coupon-specific components
│   │   ├── CouponCard.tsx
│   │   ├── CouponForm.tsx
│   │   ├── EmptyCouponList.tsx
│   │   └── index.ts
│   ├── groups/                # Group-specific components
│   │   ├── GroupNavigation.tsx
│   │   ├── GroupForm.tsx
│   │   └── index.ts
│   ├── AppHeader.tsx
│   └── CouponModal.tsx
├── features/                  # Feature modules
│   ├── auth/
│   ├── coupons/
│   └── groups/
└── contexts/                  # React contexts
    └── ThemeContext.tsx
```

## 🎯 Design Principles

### 1. **Single Responsibility**

Each component has one clear purpose:

- `Button` - Renders buttons with consistent styling
- `CouponCard` - Displays individual coupon information
- `GroupForm` - Handles group creation/joining logic

### 2. **Composition over Inheritance**

Components are designed to be composed together:

```tsx
<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardBody>
    <p>Content</p>
  </CardBody>
</Card>
```

### 3. **Props Interface Design**

All components have well-defined TypeScript interfaces:

```tsx
interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
```

## 🧩 Component Categories

### **UI Components** (`/components/ui/`)

Reusable, theme-aware components used throughout the app:

- **Button**: Consistent button styling with variants and states
- **Card**: Container component with header, body, and actions
- **Alert**: Notification component with different types
- **Input**: Form input with validation states
- **Badge**: Status indicators with color coding
- **Modal**: Overlay dialogs with accessibility features

### **Feature Components** (`/components/coupons/`, `/components/groups/`)

Domain-specific components that combine UI components:

- **CouponCard**: Displays coupon with actions (edit, delete, share, toggle used)
- **CouponForm**: Form for creating/editing coupons
- **EmptyCouponList**: Empty state for coupon lists
- **GroupNavigation**: Navigation menu for groups
- **GroupForm**: Forms for creating/joining groups

### **Layout Components**

High-level components that structure the application:

- **AppHeader**: Top navigation with user menu and theme toggle
- **CouponModal**: Modal wrapper for coupon creation/editing
- **GroupSidebar**: Sidebar navigation and group management

## 🔄 Data Flow

### **Props Down, Events Up**

```tsx
// Parent component
<CouponCard
  coupon={coupon}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleUsed={handleToggleUsed}
  onShare={handleShare}
/>
```

### **State Management**

- **Local State**: Component-specific state (form inputs, UI toggles)
- **Context**: Global state (theme, authentication)
- **Hooks**: Business logic (data fetching, mutations)

## 🎨 Styling Strategy

### **Theme-Aware Components**

All components use DaisyUI theme variables:

```tsx
className = "bg-base-100 text-base-content border-base-300";
```

### **Responsive Design**

Mobile-first approach with responsive utilities:

```tsx
className = "btn-mobile grid-mobile section-mobile";
```

### **Consistent Spacing**

Using Tailwind's spacing scale:

```tsx
className = "p-4 space-y-4 gap-2";
```

## 🧪 Testing Strategy

### **Component Testing**

Each component should be tested in isolation:

```tsx
// Example test structure
describe("Button", () => {
  it("renders with correct variant", () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");
  });
});
```

### **Integration Testing**

Test component interactions:

```tsx
// Test CouponCard with all actions
describe("CouponCard", () => {
  it("calls onEdit when edit button is clicked", () => {
    const mockOnEdit = jest.fn();
    render(<CouponCard coupon={mockCoupon} onEdit={mockOnEdit} />);
    fireEvent.click(screen.getByText("Edit"));
    expect(mockOnEdit).toHaveBeenCalledWith(mockCoupon);
  });
});
```

## 📦 Import Strategy

### **Barrel Exports**

Use index files for clean imports:

```tsx
// Instead of multiple imports
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// Use barrel export
import { Button, Card } from "@/components/ui";
```

### **Type Exports**

Export types alongside components:

```tsx
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
```

## 🚀 Performance Considerations

### **Code Splitting**

Large components are split into smaller, focused components:

- `CouponList` → `CouponCard` + `EmptyCouponList`
- `GroupSidebar` → `GroupNavigation` + `GroupForm`

### **Memoization**

Use React.memo for expensive components:

```tsx
export const CouponCard = React.memo(
  ({ coupon, onEdit, onDelete, onToggleUsed, onShare }) => {
    // Component implementation
  }
);
```

### **Lazy Loading**

Load heavy components on demand:

```tsx
const CouponModal = lazy(() => import("@/components/CouponModal"));
```

## 🔧 Maintenance Guidelines

### **Adding New Components**

1. Create component file in appropriate directory
2. Add TypeScript interface
3. Export from index file
4. Add to storybook (if applicable)
5. Write tests

### **Refactoring Guidelines**

1. Identify single responsibility violations
2. Extract reusable logic into custom hooks
3. Split large components into smaller ones
4. Update imports and exports
5. Update tests

### **Naming Conventions**

- **Components**: PascalCase (`CouponCard`)
- **Files**: PascalCase matching component name
- **Props**: camelCase (`onEdit`, `isLoading`)
- **Types**: PascalCase with descriptive suffix (`ButtonProps`)

## 📈 Benefits of This Architecture

1. **Maintainability**: Clear separation of concerns
2. **Reusability**: Shared UI components across features
3. **Testability**: Isolated components are easier to test
4. **Scalability**: Easy to add new features and components
5. **Developer Experience**: Clear structure and consistent patterns
6. **Performance**: Smaller bundle sizes through code splitting
7. **Accessibility**: Consistent focus management and ARIA attributes
