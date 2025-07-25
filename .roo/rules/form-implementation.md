---
description: use for implementing forms with server actions and zod validation
globs: 
alwaysApply: false
---
# Form Implementation Guidelines

## Introduction

This rule defines our standard approaches to form implementation. We have two main patterns:

1. **Server Action Pattern** (Preferred): Uses server actions with ProfileForm component for simplified state management
2. **React Hook Form Pattern**: Uses React Hook Form with Zod validation for complex client-side forms

Both patterns ensure consistent, accessible, and type-safe forms across the application.

## Pattern Description

### Server Action Pattern (Preferred)

This pattern eliminates the need for useEffect hooks and simplifies state management by leveraging React's useFormStatus hook and server actions:

1. **Server Actions** (in `/lib/actions/user/...`) handle data submission
2. **ProfileForm Component** (in `/components/forms/profile-form.tsx`) provides:
   - Form submission handling with loading states
   - Toast notifications for success/error
   - Common layout and styling
3. **Child Form Components** pass props and use FormInput/FormTextarea components

```typescript
// Server action example (/lib/actions/user/update-profile.ts)
'use server';

import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    
    // Validate and process data
    // Update database
    
    revalidatePath('/dashboard/profile');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to update profile' };
  }
}

// Child form component
'use client';

import { FormInput, FormTextarea } from '@/components/ui/form-input';
import { ProfileForm } from '@/components/forms/profile-form';
import { updateProfile } from '@/lib/actions/user/update-profile';

export function UserProfileForm({ user }: { user: User }) {
  return (
    <ProfileForm action={updateProfile} submitText="Update Profile">
      <FormInput
        name="name"
        label="Full Name"
        defaultValue={user.name}
        required
      />
      <FormInput
        name="email"
        label="Email"
        type="email"
        defaultValue={user.email}
        required
      />
      <FormTextarea
        name="bio"
        label="Bio"
        defaultValue={user.bio}
        placeholder="Tell us about yourself..."
      />
    </ProfileForm>
  );
}
```

### React Hook Form Pattern

For complex client-side forms that require advanced validation or dynamic behavior:

1. Schema definition with Zod
2. Type inference from schema
3. Form initialization with react-hook-form
4. Client-side validation
5. Error handling and user feedback
6. Accessible form controls

```typescript
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// 1. Define validation schema
const formSchema = z.object({
  fieldName: z.string().min(2, {
    message: "Field must be at least 2 characters.",
  }),
  // ... other fields
});

// 2. Infer type from schema
type FormValues = z.infer<typeof formSchema>;

// 3. Create form component
export function MyForm() {
  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fieldName: "",
    },
  });

  // Handle submission
  const onSubmit = async (data: FormValues) => {
    try {
      // Handle form submission
      toast.success("Success message");
      form.reset();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error message");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## File Organization

```typescript
// Structure forms as:
components/forms/
  ├── my-form.tsx        // Main form component
  ├── form-schema.ts     // Optional: separate schema file for complex forms
  └── form-types.ts      // Optional: separate types file
```

## Implementation Guidelines

### Server Action Pattern Guidelines

1. **Server Actions**
   - Place in `/lib/actions/user/...` directory
   - Use `'use server'` directive
   - Return consistent response format: `{ success: boolean, message: string }`
   - Handle validation and error cases
   - Use `revalidatePath()` to update cached data

2. **ProfileForm Component**
   - Handles form submission with loading states
   - Provides toast notifications automatically
   - Manages form state using `useFormStatus`
   - Applies consistent styling and layout

3. **Child Form Components**
   - Use FormInput and FormTextarea components
   - Pass defaultValue props for pre-populated data
   - Keep components simple and focused

### React Hook Form Pattern Guidelines

1. **Client Components**
   - Always use `"use client"` directive
   - Keep forms as isolated client components
   - Allow parent components to be server components

2. **Schema Definition**
   - Use Zod for validation
   - Define clear error messages
   - Keep schema at top of file or in separate file for complex forms

3. **Type Safety**
   - Always infer types from Zod schema
   - Use TypeScript for all form values and handlers
   - Leverage shadcn/ui component types

4. **Form State**
   - Use react-hook-form for form state management
   - Define appropriate defaultValues
   - Handle loading states explicitly

### UI Components

1. **Layout**
   - Use consistent spacing (`space-y-8` for form, `space-y-4` for sections)
   - Group related fields with appropriate spacing
   - Follow a logical visual hierarchy

2. **Feedback**
   - Show loading states during submission
   - Display success/error toasts
   - Provide inline validation feedback
   - Use appropriate disabled states

3. **File Uploads**
   ```typescript
   <FormField
     control={form.control}
     name="file"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Upload</FormLabel>
         <FormControl>
           <Dropzone
             onDrop={(files) => field.onChange(files[0])}
             accept={{ 
               'file/*': ['.ext1', '.ext2'] 
             }}
           >
             {(dropzone) => (
               <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-200 rounded-lg bg-white min-h-[200px] w-full">
                 {/* Dropzone content */}
               </div>
             )}
           </Dropzone>
         </FormControl>
         <FormMessage />
       </FormItem>
     )}
   />
   ```

## Real-World Examples

### Server Action Pattern
* [ProfileForm Component](mdc:components/forms/profile-form.tsx)
* [Server Actions](mdc:lib/actions/user)

### React Hook Form Pattern
* [Video Upload Form](mdc:components/forms/video-upload-form.tsx)

## Common Pitfalls

### Server Action Pattern
* Not returning consistent response format from server actions
* Forgetting to use `revalidatePath()` after data mutations
* Not handling server-side validation errors properly
* Mixing server action pattern with client-side form state

### React Hook Form Pattern
* Not using `"use client"` directive when required
* Mixing client-side form logic in server components
* Not handling loading and error states
* Inconsistent spacing and layout
* Missing accessibility attributes
* Not providing user feedback during form submission
* Not handling file upload errors appropriately

### General
* Using React Hook Form pattern when server actions would be simpler
* Not following consistent error handling patterns
* Missing loading states during form submission

## Best Practices

### Server Action Pattern

1. **Prefer Server Actions**
   - Use server action pattern for most forms
   - Eliminates client-side state management complexity
   - Provides better performance and SEO
   - Simplifies error handling and loading states

2. **Consistent Response Format**
   - Always return `{ success: boolean, message: string }`
   - Handle all error cases in server actions
   - Use appropriate HTTP status codes

3. **Data Revalidation**
   - Use `revalidatePath()` to update cached data
   - Consider `revalidateTag()` for more granular updates
   - Ensure UI reflects data changes immediately

### React Hook Form Pattern

1. **Accessibility**
   - Use semantic HTML elements
   - Maintain proper label associations
   - Provide error messages for screen readers
   - Ensure keyboard navigation works

2. **Error Handling**
   - Validate both client and server side
   - Show clear error messages
   - Handle network errors gracefully
   - Preserve form state on error

3. **Performance**
   - Avoid unnecessary re-renders
   - Use appropriate loading indicators
   - Handle large file uploads efficiently
   - Reset form state appropriately

4. **User Experience**
   - Show clear loading states
   - Provide immediate feedback
   - Maintain form state when appropriate
   - Clear error messages and recovery options
