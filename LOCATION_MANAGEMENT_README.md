# Location Management System Implementation

This document describes the implementation of the Location Management system in the ETD (Emergency Travel Document) application.

## Overview

The Location Management system allows administrators to manage foreign mission offices and locations that are used for sheet assignments. It provides a complete CRUD interface with pagination, search, and filtering capabilities.

## Features Implemented

### 1. API Integration (`lib/api/locations.ts`)
- **Get Locations**: GET `/v1/api/locations` - Get paginated locations with filtering
- **Get All Locations**: GET `/v1/api/locations/all` - Get all locations for dropdowns
- **Search Locations**: GET `/v1/api/locations/search` - Search locations by name
- **Get Location**: GET `/v1/api/locations/:id` - Get specific location
- **Create Location**: POST `/v1/api/locations` - Create new location (Admin only)
- **Bulk Create**: POST `/v1/api/locations/bulk` - Bulk create locations (Admin only)
- **Update Location**: PUT `/v1/api/locations/:id` - Update location (Admin only)
- **Delete Location**: DELETE `/v1/api/locations/:id` - Delete location (Admin only)

### 2. Admin Location Management (`app/admin/locations/page.tsx`)
- **Create Location**: Add new locations with ID and name
- **Edit Location**: Inline editing of location names
- **Delete Location**: Remove locations with confirmation
- **Search & Filter**: Advanced search and filtering capabilities
- **Pagination**: Full pagination support with customizable page sizes
- **Sorting**: Sort by name, location ID, or creation date

### 3. Location Selector Component (`components/ui/location-selector.tsx`)
- **Dropdown Selection**: Reusable component for location selection
- **Auto-loading**: Automatically fetches and caches all locations
- **Sorted Display**: Locations sorted alphabetically for better UX
- **Loading States**: Proper loading indicators

### 4. Integration with Sheet Management
- **Location Dropdowns**: Sheet management now uses location dropdowns instead of text inputs
- **Location Validation**: Ensures valid location IDs are used for sheet assignments
- **User-friendly Interface**: Shows location names instead of just IDs

### 5. Custom Hook (`lib/hooks/useLocations.ts`)
- **Centralized Logic**: Reusable location management logic
- **Error Handling**: Consistent error handling across components
- **State Management**: Manages loading states and data fetching

## File Structure

```
lib/
├── api/
│   └── locations.ts                 # Location management API client
├── hooks/
│   └── useLocations.ts             # Custom hook for location management
app/
├── admin/
│   ├── page.tsx                    # Admin dashboard with location management tab
│   └── locations/
│       └── page.tsx                # Admin location management page
components/
└── ui/
    └── location-selector.tsx       # Location selection component
```

## API Endpoints

### Base URL: `/v1/api/locations`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get paginated locations with filters | Public |
| GET | `/all` | Get all locations for dropdowns | Public |
| GET | `/search?q=term` | Search locations by name | Public |
| GET | `/:id` | Get specific location | Public |
| POST | `/` | Create new location | Admin only |
| POST | `/bulk` | Bulk create locations | Admin only |
| PUT | `/:id` | Update location | Admin only |
| DELETE | `/:id` | Delete location | Admin only |

## Data Models

### Location Object
```typescript
{
  location_id: string
  name: string
  created_at: string
  updated_at: string
}
```

### Create Location Request
```typescript
{
  location_id: string
  name: string
}
```

### Update Location Request
```typescript
{
  name: string
}
```

### Location Filters
```typescript
{
  page?: number
  limit?: number
  search?: string
  sortBy?: 'name' | 'location_id' | 'created_at'
  sortOrder?: 'ASC' | 'DESC'
}
```

### Paginated Response
```typescript
{
  data: Location[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
```

## Usage

### For Administrators

1. **Access Location Management**:
   - Navigate to Admin Dashboard
   - Click on "Location Management" tab
   - Click "Go to Location Management"

2. **Create New Location**:
   - Enter Location ID (e.g., "9999")
   - Enter Location Name (e.g., "New York, USA")
   - Click "Create Location"

3. **Edit Location**:
   - Click the edit icon next to a location name
   - Modify the name inline
   - Press Enter to save or Escape to cancel

4. **Delete Location**:
   - Click the delete icon next to a location
   - Confirm deletion in the modal

5. **Search and Filter**:
   - Use the search box to find locations by name
   - Sort by name, location ID, or creation date
   - Choose items per page (10, 25, 50, 100)

### For Developers

1. **Using Location Selector Component**:
```tsx
import LocationSelector from "@/components/ui/location-selector"

<LocationSelector
  value={selectedLocation}
  onValueChange={setSelectedLocation}
  placeholder="Select location"
  disabled={false}
/>
```

2. **Using Location Hook**:
```tsx
import { useLocations } from "@/lib/hooks/useLocations"

const { locations, loading, createLocation, updateLocation } = useLocations({
  page: 1,
  limit: 10,
  search: "USA"
})
```

3. **Using Location API Directly**:
```tsx
import { locationsAPI } from "@/lib/api/locations"

// Get all locations
const allLocations = await locationsAPI.getAllLocations()

// Search locations
const searchResults = await locationsAPI.searchLocations("London", 5)

// Create location
const newLocation = await locationsAPI.createLocation({
  location_id: "9999",
  name: "New Location"
})
```

## Security Features

- **Role-based Access**: Only admins can create, update, and delete locations
- **Input Validation**: Proper validation for location IDs and names
- **Duplicate Prevention**: Location IDs must be unique
- **Audit Trail**: All operations are logged with timestamps

## Error Handling

- **API Errors**: Consistent error messages for API failures
- **Validation Errors**: Form validation with user-friendly messages
- **Network Errors**: Graceful handling of network issues
- **Loading States**: Proper loading indicators for better UX

## Integration with Sheet Management

The location management system is fully integrated with the sheet management system:

1. **Location Dropdowns**: Sheet assignment forms now use location dropdowns
2. **Location Validation**: Ensures valid location IDs are used
3. **User Experience**: Shows location names instead of just IDs
4. **Data Consistency**: Maintains referential integrity between sheets and locations

## Database Schema

The locations table includes:
- `location_id` (Primary Key): Unique identifier for each location
- `name`: Human-readable location name
- `created_at`: Timestamp when location was created
- `updated_at`: Timestamp when location was last updated
- Index on `name` field for better search performance

## Future Enhancements

1. **Bulk Operations**: Support for bulk location operations
2. **Location Templates**: Predefined location templates
3. **Advanced Filtering**: More sophisticated filtering options
4. **Export Functionality**: Export location data to various formats
5. **Audit Trail**: Track all location operations and changes
6. **Notifications**: Real-time notifications for location changes

## Testing

The implementation includes:
- **Error Handling**: Comprehensive error handling for all API calls
- **Loading States**: Proper loading indicators for better UX
- **Form Validation**: Client-side validation for all inputs
- **Responsive Design**: Mobile-friendly interface
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Dependencies

- **React Hook Form**: Form management and validation
- **Zod**: Schema validation
- **Lucide React**: Icons
- **Tailwind CSS**: Styling
- **Custom UI Components**: Reusable UI components

## Notes

- Location IDs are validated to ensure they are unique
- Location names are sorted alphabetically for better UX
- All location operations are logged for audit purposes
- The system supports both individual and bulk location operations
- Location selector component is reusable across the application
