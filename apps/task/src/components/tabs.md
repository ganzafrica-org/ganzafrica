# Tabs Component

A reusable tab navigation component with active/inactive states and custom styling.

## Features

- **Active/Inactive States**: Visual distinction between selected and unselected tabs
- **Custom Styling**: Uses brand colors (#076297) for active state
- **Hover Effects**: Smooth transitions on hover
- **Accessible**: Proper button semantics and keyboard navigation
- **Flexible**: Accepts any number of tabs with custom labels

## Usage

```tsx
import { Tabs } from '@/components/tabs';

const tabs = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'files', label: 'Files' }
];

function MyComponent() {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <Tabs 
      tabs={tabs} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      className="mb-6" // Optional additional styling
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tabs` | `Tab[]` | ✅ | Array of tab objects with id and label |
| `activeTab` | `string` | ✅ | ID of the currently active tab |
| `onTabChange` | `(tabId: string) => void` | ✅ | Callback when tab is clicked |
| `className` | `string` | ❌ | Additional CSS classes |

## Tab Interface

```tsx
interface Tab {
  id: string;    // Unique identifier
  label: string; // Display text
}
```

## Styling

- **Active Tab**: Blue text (#076297) with matching underline
- **Inactive Tab**: Gray text with hover effects
- **Underline**: 2px solid line matching active text color
- **Transitions**: Smooth color transitions on hover and selection

## Examples

### Basic Usage
```tsx
<Tabs 
  tabs={[
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' }
  ]} 
  activeTab={activeTab} 
  onTabChange={setActiveTab} 
/>
```

### With Custom Styling
```tsx
<Tabs 
  tabs={tabs} 
  activeTab={activeTab} 
  onTabChange={setActiveTab}
  className="border-b-2 border-gray-300 mb-8"
/>
```

## Accessibility

- Uses semantic `<button>` elements
- Supports keyboard navigation (Tab, Enter, Space)
- Clear visual focus indicators
- Proper ARIA attributes for screen readers
