# Sheet Management System Implementation

This document describes the implementation of the Sheet Management system in the ETD (Emergency Travel Document) application.

## Overview

The Sheet Management system allows administrators to assign sheet numbers to operators and track their usage. Operators can select from their available sheets when creating applications.

## Features Implemented

### 1. API Integration (`lib/api/sheets.ts`)
- **Assign Sheets**: POST `/v1/api/sheets/assign` - Assign sheet numbers to operators
- **Upload Sheets**: POST `/v1/api/sheets/upload` - Upload sheet numbers from text file
- **Get Sheets**: GET `/v1/api/sheets` - Retrieve sheets with filtering
- **Get Available Sheets**: GET `/v1/api/sheets/available` - Get available sheets for current operator
- **Get Sheet Statistics**: GET `/v1/api/sheets/stats` - Get sheet usage statistics

### 2. Admin Sheet Management (`app/admin/sheets/page.tsx`)
- **Statistics Dashboard**: View total, available, and used sheets
- **Manual Assignment**: Assign sheet numbers manually to operators
- **File Upload**: Upload sheet numbers from text files
- **Filtering**: Filter sheets by operator, location, and status
- **Sheet Table**: View all sheets with detailed information

### 3. Operator Sheet Dashboard (`app/operator/sheets/page.tsx`)
- **Personal Statistics**: View own sheet statistics
- **Available Sheets**: See available sheet numbers
- **Sheet History**: View all assigned sheets and their usage

### 4. Sheet Selection Component (`components/operator/SheetSelector.tsx`)
- **Available Sheets**: Dropdown to select from available sheets
- **Real-time Updates**: Automatically fetches available sheets
- **User-friendly Interface**: Clear indication of available sheet count

### 5. Integration with Application Form (`components/forms/CitizenForm.tsx`)
- **Sheet Selection**: Operators can select a sheet when creating applications
- **Role-based Display**: Only shows for MISSION_OPERATOR role
- **Form Integration**: Sheet number included in application submission

### 6. Custom Hook (`lib/hooks/useSheets.ts`)
- **Reusable Logic**: Centralized sheet management logic
- **Error Handling**: Consistent error handling across components
- **State Management**: Manages loading states and data fetching

## File Structure

```
lib/
├── api/
│   └── sheets.ts                 # Sheet management API client
├── hooks/
│   └── useSheets.ts             # Custom hook for sheet management
app/
├── admin/
│   ├── page.tsx                 # Admin dashboard with sheet management tab
│   └── sheets/
│       └── page.tsx             # Admin sheet management page
└── operator/
    └── sheets/
        └── page.tsx             # Operator sheet dashboard
components/
├── forms/
│   └── CitizenForm.tsx          # Application form with sheet selection
└── operator/
    └── SheetSelector.tsx        # Sheet selection component
```

## Usage

### For Administrators

1. **Access Sheet Management**:
   - Navigate to Admin Dashboard
   - Click on "Sheet Management" tab
   - Click "Go to Sheet Management"

2. **Assign Sheets Manually**:
   - Select an operator from the dropdown
   - Enter location ID
   - Enter sheet numbers (comma or newline separated)
   - Click "Assign Sheets"

3. **Upload Sheets from File**:
   - Select an operator from the dropdown
   - Enter location ID
   - Upload a text file with sheet numbers (one per line)
   - Click "Upload Sheets"

4. **Filter and View Sheets**:
   - Use filters to view sheets by operator, location, or status
   - View detailed information in the sheets table

### For Operators

1. **View Sheet Dashboard**:
   - Navigate to `/operator/sheets`
   - View personal statistics and available sheets

2. **Select Sheet for Application**:
   - When creating a new application
   - Use the sheet selector dropdown
   - Choose from available sheet numbers

## API Endpoints

### Base URL: `/v1/api/sheets`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/assign` | Assign sheets to operator | Admin only |
| POST | `/upload` | Upload sheets from file | Admin only |
| GET | `/` | Get sheets with filters | Admin (all) / Operator (own) |
| GET | `/available` | Get available sheets | Operator only |
| GET | `/stats` | Get sheet statistics | Admin (all) / Operator (own) |

## Data Models

### Sheet Assignment Request
```typescript
{
  operator_id: number
  location_id: number
  sheet_numbers: string[]
}
```

### Sheet Object
```typescript
{
  sheet_no: string
  issued_to: number
  issued_by: number
  location_id: number
  status: 'EMPTY' | 'USED'
  issued_at: string
  used_at: string | null
  used_by_application: string | null
  operator_name: string
  admin_name: string
}
```

### Sheet Statistics
```typescript
{
  total_sheets: number
  available_sheets: number
  used_sheets: number
}
```

## Security Features

- **Role-based Access**: Different endpoints accessible based on user role
- **Operator Isolation**: Operators can only see their own sheets
- **Admin Controls**: Only admins can assign and manage sheets
- **Input Validation**: Proper validation for sheet numbers and file uploads

## Error Handling

- **API Errors**: Consistent error messages for API failures
- **Validation Errors**: Form validation with user-friendly messages
- **File Upload Errors**: Validation for file type and content
- **Network Errors**: Graceful handling of network issues

## Future Enhancements

1. **Bulk Operations**: Support for bulk sheet operations
2. **Sheet Templates**: Predefined sheet number ranges
3. **Advanced Filtering**: More sophisticated filtering options
4. **Export Functionality**: Export sheet data to various formats
5. **Audit Trail**: Track all sheet operations and changes
6. **Notifications**: Real-time notifications for sheet assignments

## Testing

The implementation includes:
- **Error Handling**: Comprehensive error handling for all API calls
- **Loading States**: Proper loading indicators for better UX
- **Form Validation**: Client-side validation for all inputs
- **Responsive Design**: Mobile-friendly interface

## Dependencies

- **React Hook Form**: Form management and validation
- **Zod**: Schema validation
- **Lucide React**: Icons
- **Tailwind CSS**: Styling
- **Custom UI Components**: Reusable UI components

## Notes

- Sheet numbers are validated to ensure they are unique
- File uploads support only text files (.txt)
- Sheet selection is only available for MISSION_OPERATOR role
- All sheet operations are logged for audit purposes
- The system supports both manual and file-based sheet assignment
