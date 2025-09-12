# Frontend API Integration Setup Guide

This guide explains how to integrate the Loveway Logistics frontend with the backend API using Axios and React Query.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install axios
npm install react-i18next i18next
npm install date-fns
```

### 2. Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Loveway Logistics
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_TRACKING=true
```

### 3. Setup Providers

Wrap your app with the necessary providers:

```tsx
// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ApiProvider } from "./lib/api/ApiProvider";
import { LanguageProvider } from "./lib/i18n/LanguageContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApiProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ApiProvider>
  </React.StrictMode>
);
```

## 📚 API Usage Examples

### Authentication

```tsx
import { useLogin, useRegister, useLogout } from "./lib/api";

function LoginForm() {
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const handleLogin = async (credentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
      // Redirect to dashboard
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return <form onSubmit={handleLogin}>{/* Form fields */}</form>;
}
```

### Data Fetching

```tsx
import { useCargos, useCreateCargo } from "./lib/api";

function CargoList() {
  const {
    data: cargos,
    isLoading,
    error,
  } = useCargos({
    status: "pending",
    page: 1,
    limit: 10,
  });

  const createCargoMutation = useCreateCargo();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {cargos?.data.map((cargo) => (
        <div key={cargo.id}>{cargo.type}</div>
      ))}
    </div>
  );
}
```

### Real-time Updates

```tsx
import { useCargoTracking } from "./lib/api";

function TrackingComponent({ cargoId }) {
  const { data: tracking } = useCargoTracking(cargoId);

  // This will refetch every 30 seconds automatically
  return (
    <div>
      <p>Status: {tracking?.status}</p>
      <p>Location: {tracking?.currentLocation}</p>
    </div>
  );
}
```

## 🌍 Localization

### Using Translations

```tsx
import { useLanguage } from "./lib/api";

function MyComponent() {
  const { t, currentLanguage } = useLanguage();

  return (
    <div>
      <h1>{t("dashboard.welcome")}</h1>
      <p>{t("common.loading")}</p>
    </div>
  );
}
```

### Language Switcher

```tsx
import { LanguageSwitcher } from "./lib/api";

function Header() {
  return (
    <header>
      <h1>Loveway Logistics</h1>
      <LanguageSwitcher />
    </header>
  );
}
```

## 🔧 Custom Hooks

### Creating Custom Hooks

```tsx
import { useQuery } from "@tanstack/react-query";
import { CargoService } from "./lib/api/services";
import { queryKeys } from "./lib/api/queryClient";

export const useCargoStatistics = () => {
  return useQuery({
    queryKey: ["cargos", "statistics"],
    queryFn: () => CargoService.getStatistics(),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Error Handling

```tsx
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "./lib/api";

export const useCreateCargoWithToast = () => {
  const createCargoMutation = useCreateCargo();

  const createCargo = async (data) => {
    try {
      await createCargoMutation.mutateAsync(data);
      toast.success("Cargo created successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return {
    createCargo,
    isLoading: createCargoMutation.isPending,
    error: createCargoMutation.error,
  };
};
```

## 📊 Data Management

### Optimistic Updates

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./lib/api/queryClient";

export const useUpdateCargoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => CargoService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.cargos.detail(id),
      });

      // Snapshot previous value
      const previousCargo = queryClient.getQueryData(
        queryKeys.cargos.detail(id)
      );

      // Optimistically update
      queryClient.setQueryData(queryKeys.cargos.detail(id), (old) => ({
        ...old,
        status,
      }));

      return { previousCargo };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCargo) {
        queryClient.setQueryData(
          queryKeys.cargos.detail(variables.id),
          context.previousCargo
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: queryKeys.cargos.detail(variables.id),
      });
    },
  });
};
```

### Pagination

```tsx
import { useState } from "react";
import { useCargos } from "./lib/api";

function PaginatedCargoList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useCargos({
    page,
    limit,
    status: "pending",
  });

  return (
    <div>
      {data?.data.map((cargo) => (
        <div key={cargo.id}>{cargo.type}</div>
      ))}

      <div className="pagination">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={!data?.pagination.hasPrev}
        >
          Previous
        </button>

        <span>
          Page {data?.pagination.page} of {data?.pagination.totalPages}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.pagination.hasNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

## 🛠️ Utilities

### Formatting Data

```tsx
import { formatDate, formatCurrency, formatFileSize } from "./lib/api";

function CargoCard({ cargo }) {
  return (
    <div>
      <h3>{cargo.type}</h3>
      <p>Created: {formatDate(cargo.created_at)}</p>
      <p>Cost: {formatCurrency(cargo.estimated_cost)}</p>
      <p>Weight: {cargo.weight_kg} kg</p>
    </div>
  );
}
```

### File Upload

```tsx
import { FileService } from "./lib/api/services";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const result = await FileService.uploadFile(
        file,
        "document",
        "driver_license"
      );
      console.log("File uploaded:", result.data.file_url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
```

## 🔒 Authentication Flow

### Protected Routes

```tsx
import { useUserProfile } from "./lib/api";

function ProtectedRoute({ children }) {
  const { data: user, isLoading, error } = useUserProfile();

  if (isLoading) return <div>Loading...</div>;
  if (error || !user) return <Navigate to="/login" />;

  return children;
}
```

### Role-based Access

```tsx
import { useUserProfile } from "./lib/api";
import { UserRole } from "./types/shared";

function AdminOnly({ children }) {
  const { data: user } = useUserProfile();

  if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPER_ADMIN) {
    return <div>Access denied</div>;
  }

  return children;
}
```

## 📱 Mobile Considerations

### Responsive Data Fetching

```tsx
import { useMobile } from "./hooks/use-mobile";
import { useCargos } from "./lib/api";

function CargoList() {
  const isMobile = useMobile();
  const limit = isMobile ? 5 : 10;

  const { data: cargos } = useCargos({ limit });

  return (
    <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
      {cargos?.data.map((cargo) => (
        <CargoCard key={cargo.id} cargo={cargo} />
      ))}
    </div>
  );
}
```

## 🐛 Debugging

### React Query Devtools

The React Query Devtools are automatically enabled in development mode. You can:

1. View all queries and their states
2. Inspect cache contents
3. Manually trigger refetches
4. See query invalidation

### Error Logging

```tsx
import { useMutation } from "@tanstack/react-query";

export const useCreateCargoWithLogging = () => {
  return useMutation({
    mutationFn: CargoService.createCargo,
    onError: (error, variables, context) => {
      console.error("Create cargo failed:", {
        error: error.message,
        variables,
        context,
        timestamp: new Date().toISOString(),
      });
    },
  });
};
```

## 🚀 Performance Tips

1. **Use select to transform data**: Only extract what you need from API responses
2. **Implement proper caching**: Set appropriate `staleTime` and `gcTime`
3. **Use pagination**: Don't load all data at once
4. **Implement optimistic updates**: Update UI immediately for better UX
5. **Debounce search inputs**: Avoid excessive API calls
6. **Use background refetching**: Keep data fresh without blocking UI

## 📝 Best Practices

1. **Always handle loading and error states**
2. **Use TypeScript for type safety**
3. **Implement proper error boundaries**
4. **Cache user preferences locally**
5. **Use React Query's built-in retry logic**
6. **Implement proper cleanup in useEffect**
7. **Use the provided utility functions for formatting**
8. **Follow the established naming conventions**

This setup provides a robust foundation for your frontend-backend integration with proper error handling, caching, and user experience optimizations.
