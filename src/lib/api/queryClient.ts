import { QueryClient } from "@tanstack/react-query";

// Create React Query client with proper defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    profile: ["auth", "profile"] as const,
    user: (id: string) => ["auth", "user", id] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    list: (params?: Record<string, any>) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    statistics: ["users", "statistics"] as const,
  },

  // Clients
  clients: {
    profile: ["clients", "profile"] as const,
    creditStatus: ["clients", "credit-status"] as const,
    invoices: (params?: Record<string, any>) =>
      ["clients", "invoices", params] as const,
    all: (params?: Record<string, any>) => ["clients", "all", params] as const,
  },

  // Drivers
  drivers: {
    profile: ["drivers", "profile"] as const,
    documents: ["drivers", "documents"] as const,
    assignments: (params?: Record<string, any>) =>
      ["drivers", "assignments", params] as const,
    performance: ["drivers", "performance"] as const,
    available: (params?: Record<string, any>) =>
      ["drivers", "available", params] as const,
    all: (params?: Record<string, any>) => ["drivers", "all", params] as const,
    detail: (id: string) => ["drivers", "detail", id] as const,
  },

  // Vehicles
  vehicles: {
    all: (params?: Record<string, any>) => ["vehicles", "all", params] as const,
    detail: (id: string) => ["vehicles", "detail", id] as const,
    maintenance: (id: string) => ["vehicles", "maintenance", id] as const,
    available: (params?: Record<string, any>) =>
      ["vehicles", "available", params] as const,
    availableTrucks: (params?: Record<string, any>) =>
      ["vehicles", "available-trucks", params] as const,
    availableForDate: (params?: Record<string, any>) =>
      ["vehicles", "available-for-date", params] as const,
    assignments: (id: string, params?: Record<string, any>) =>
      ["vehicles", "assignments", id, params] as const,
  },

  // Cargos
  cargos: {
    all: (params?: Record<string, any>) => ["cargos", "all", params] as const,
    detail: (id: string) => ["cargos", "detail", id] as const,
    tracking: (id: string) => ["cargos", "tracking", id] as const,
    clientCargos: (params?: Record<string, any>) =>
      ["cargos", "client", params] as const,
    driverCargos: (params?: Record<string, any>) =>
      ["cargos", "driver", params] as const,
    estimateCost: ["cargos", "estimate-cost"] as const,
  },

  // Cargo Categories
  cargoCategories: {
    all: (params?: Record<string, any>) =>
      ["cargo-categories", "all", params] as const,
    detail: (id: string) => ["cargo-categories", "detail", id] as const,
  },

  // Locations
  locations: {
    all: (params?: Record<string, any>) =>
      ["locations", "all", params] as const,
    detail: (id: string) => ["locations", "detail", id] as const,
    my: () => ["locations", "my"] as const,
    suggestions: (type?: string) => ["locations", "suggestions", type] as const,
    byType: (type: string) => ["locations", "by-type", type] as const,
  },

  // Deliveries
  deliveries: {
    all: (params?: Record<string, any>) =>
      ["deliveries", "all", params] as const,
    detail: (id: string) => ["deliveries", "detail", id] as const,
    driverDeliveries: (params?: Record<string, any>) =>
      ["deliveries", "driver", params] as const,
  },

  // Delivery Assignments
  deliveryAssignments: {
    all: (params?: Record<string, any>) =>
      ["delivery-assignments", "all", params] as const,
    detail: (id: string) => ["delivery-assignments", "detail", id] as const,
  },

  // Routes
  routes: {
    all: (params?: Record<string, any>) => ["routes", "all", params] as const,
    detail: (id: string) => ["routes", "detail", id] as const,
    progress: (id: string) => ["routes", "progress", id] as const,
  },

  // Invoices
  invoices: {
    all: (params?: Record<string, any>) => ["invoices", "all", params] as const,
    detail: (id: string) => ["invoices", "detail", id] as const,
    pdf: (id: string) => ["invoices", "pdf", id] as const,
    clientInvoices: (params?: Record<string, any>) =>
      ["invoices", "client", params] as const,
  },

  // Payments
  payments: {
    all: (params?: Record<string, any>) => ["payments", "all", params] as const,
    detail: (id: string) => ["payments", "detail", id] as const,
    history: (params?: Record<string, any>) =>
      ["payments", "history", params] as const,
    methods: ["payments", "methods"] as const,
    userPayments: (params?: Record<string, any>) =>
      ["payments", "user", params] as const,
  },

  // Refunds
  refunds: {
    all: (params?: Record<string, any>) => ["refunds", "all", params] as const,
    detail: (id: string) => ["refunds", "detail", id] as const,
    history: (params?: Record<string, any>) =>
      ["refunds", "history", params] as const,
  },

  // Insurance
  insurance: {
    policies: ["insurance", "policies"] as const,
    policiesList: (params?: Record<string, any>) =>
      ["insurance", "policies", "list", params] as const,
    policy: (id: string) => ["insurance", "policy", id] as const,
    claims: ["insurance", "claims"] as const,
    claimsList: (params?: Record<string, any>) =>
      ["insurance", "claims", "list", params] as const,
    claim: (id: string) => ["insurance", "claim", id] as const,
    providers: ["insurance", "providers"] as const,
  },

  // GPS Tracking
  gps: {
    location: ["gps", "location"] as const,
    history: (params?: Record<string, any>) =>
      ["gps", "history", params] as const,
    vehicleLocation: (id: string) =>
      ["gps", "vehicle", "location", id] as const,
    vehicleHistory: (id: string, params?: Record<string, any>) =>
      ["gps", "vehicle", "history", id, params] as const,
    live: (id: string) => ["gps", "vehicle", "live", id] as const,
  },

  // Live Tracking
  tracking: {
    cargoDetail: (id: string) => ["tracking", "cargo", "detail", id] as const,
    cargoDetailByNumber: (cargoNumber: string) =>
      ["tracking", "cargo", "detail", "number", cargoNumber] as const,
    vehicleLive: (id: string) => ["tracking", "vehicle", "live", id] as const,
    vehicleHistory: (id: string, params?: Record<string, any>) =>
      ["tracking", "vehicle", "history", id, params] as const,
    inTransitCargo: (params?: Record<string, any>) =>
      ["tracking", "cargo", "in-transit", params] as const,
    routeProgress: (id: string) =>
      ["tracking", "cargo", "progress", id] as const,
    deliveryUpdates: (id: string, lastUpdate?: string) =>
      ["tracking", "cargo", "updates", id, lastUpdate] as const,
    nearbyVehicles: (lat: number, lng: number, radius: number) =>
      ["tracking", "vehicles", "nearby", lat, lng, radius] as const,
    summary: () => ["tracking", "summary"] as const,
    analytics: (params?: Record<string, any>) =>
      ["tracking", "analytics", params] as const,
  },

  // Notifications
  notifications: {
    all: (params?: Record<string, any>) =>
      ["notifications", "all", params] as const,
    settings: ["notifications", "settings"] as const,
  },

  // Admin
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    logs: (params?: Record<string, any>) => ["admin", "logs", params] as const,
    users: (params?: Record<string, any>) =>
      ["admin", "users", params] as const,
    clients: (params?: Record<string, any>) =>
      ["admin", "clients", params] as const,
    drivers: (params?: Record<string, any>) =>
      ["admin", "drivers", params] as const,
    financialReports: (params?: Record<string, any>) =>
      ["admin", "reports", "financial", params] as const,
    performanceReports: (params?: Record<string, any>) =>
      ["admin", "reports", "performance", params] as const,
  },

  // Operational
  operational: {
    serviceAreas: (params?: Record<string, any>) =>
      ["operational", "service-areas", params] as const,
    operatingHours: (params?: Record<string, any>) =>
      ["operational", "operating-hours", params] as const,
    cargoCategories: (params?: Record<string, any>) =>
      ["operational", "cargo-categories", params] as const,
    pricingPolicies: (params?: Record<string, any>) =>
      ["operational", "pricing-policies", params] as const,
  },

  // Localization
  localization: {
    translations: (language: string) =>
      ["localization", "translations", language] as const,
  },

  // Files
  files: {
    all: (params?: Record<string, any>) => ["files", "all", params] as const,
    url: (id: string) => ["files", "url", id] as const,
  },

  // Search
  search: {
    cargos: (params?: Record<string, any>) =>
      ["search", "cargos", params] as const,
    users: (params?: Record<string, any>) =>
      ["search", "users", params] as const,
    vehicles: (params?: Record<string, any>) =>
      ["search", "vehicles", params] as const,
    drivers: (params?: Record<string, any>) =>
      ["search", "drivers", params] as const,
    invoices: (params?: Record<string, any>) =>
      ["search", "invoices", params] as const,
    global: (query: string, entityTypes?: string[]) =>
      ["search", "global", query, entityTypes] as const,
    suggestions: (query: string, entityType?: string) =>
      ["search", "suggestions", query, entityType] as const,
    recent: ["search", "recent"] as const,
    statistics: ["search", "statistics"] as const,
  },

  // Analytics
  analytics: {
    cargos: (params?: Record<string, any>) =>
      ["analytics", "cargos", params] as const,
    drivers: (params?: Record<string, any>) =>
      ["analytics", "drivers", params] as const,
    financial: (params?: Record<string, any>) =>
      ["analytics", "financial", params] as const,
    performance: (params?: Record<string, any>) =>
      ["analytics", "performance", params] as const,
    vehicles: (params?: Record<string, any>) =>
      ["analytics", "vehicles", params] as const,
    users: (params?: Record<string, any>) =>
      ["analytics", "users", params] as const,
    dashboard: (period?: string) => ["analytics", "dashboard", period] as const,
    revenue: (params?: Record<string, any>) =>
      ["analytics", "revenue", params] as const,
    deliveryTime: (params?: Record<string, any>) =>
      ["analytics", "delivery-time", params] as const,
    geographic: (params?: Record<string, any>) =>
      ["analytics", "geographic", params] as const,
    filters: ["analytics", "filters"] as const,
  },

  // System
  system: {
    health: ["system", "health"] as const,
    ready: ["system", "ready"] as const,
  },

  // Dashboard
  dashboard: {
    all: () => ["dashboard"] as const,
    driver: () => ["dashboard", "driver"] as const,
    client: () => ["dashboard", "client"] as const,
    admin: () => ["dashboard", "admin"] as const,
    superAdmin: () => ["dashboard", "super-admin"] as const,
    charts: {
      revenue: (params?: Record<string, any>) =>
        ["dashboard", "charts", "revenue", params] as const,
      deliveryStatus: (params?: Record<string, any>) =>
        ["dashboard", "charts", "delivery-status", params] as const,
      fleetPerformance: (params?: Record<string, any>) =>
        ["dashboard", "charts", "fleet-performance", params] as const,
      geographic: (params?: Record<string, any>) =>
        ["dashboard", "charts", "geographic", params] as const,
      driverPerformance: (params?: Record<string, any>) =>
        ["dashboard", "charts", "driver-performance", params] as const,
      usageTrends: (params?: Record<string, any>) =>
        ["dashboard", "charts", "usage-trends", params] as const,
      adminPerformance: (params?: Record<string, any>) =>
        ["dashboard", "charts", "admin-performance", params] as const,
      usersDistribution: (params?: Record<string, any>) =>
        ["dashboard", "charts", "users-distribution", params] as const,
    },
    tables: {
      recentDeliveries: (params?: Record<string, any>) =>
        ["dashboard", "tables", "recent-deliveries", params] as const,
      pendingApprovals: (params?: Record<string, any>) =>
        ["dashboard", "tables", "pending-approvals", params] as const,
      systemAlerts: (params?: Record<string, any>) =>
        ["dashboard", "tables", "system-alerts", params] as const,
      financialTransactions: (params?: Record<string, any>) =>
        ["dashboard", "tables", "financial-transactions", params] as const,
    },
    systemHealth: () => ["dashboard", "system-health"] as const,
    filters: () => ["dashboard", "filters"] as const,
  },
};

export default queryClient;
