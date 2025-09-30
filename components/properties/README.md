# Properties Components

This folder contains all property-related components organized by functionality.

## Structure

```
components/properties/
├── index.ts              # Main exports
├── README.md             # This file
├── management/           # Property management components
│   ├── index.ts
│   └── property-management.tsx
├── forms/               # Property form components
│   ├── index.ts
│   └── property-form.tsx
└── details/             # Property detail components
    ├── index.ts
    └── property-details.tsx
```

## Usage

Import components from the main properties module:

```typescript
import {
  PropertyManagement,
  PropertyForm,
  PropertyDetails
} from '@/components/properties';
```

Or import from specific submodules:

```typescript
import { PropertyManagement } from '@/components/properties/management';
import { PropertyForm } from '@/components/properties/forms';
import { PropertyDetails } from '@/components/properties/details';
```

## Components

### PropertyManagement

Main property management interface with list, grid view, search, and filtering capabilities.

### PropertyForm

Form component for adding and editing properties with validation.

### PropertyDetails

Detailed view component for displaying property information and related data.
