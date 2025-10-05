// Export all API hooks
export * from "./authHooks";
export * from "./userHooks";
export * from "./clientHooks";
export * from "./driverHooks";
export * from "./vehicleHooks";
export * from "./cargoHooks";
export * from "./deliveryHooks";
export * from "./trackingHooks";
export * from "./invoiceHooks";
export * from "./paymentHooks";
export * from "./insuranceHooks";
export * from "./routeHooks";
export * from "./searchHooks";
export * from "./analyticsHooks";
export * from "./systemHooks";
export * from "./utilityHooks";
export * from "./dashboardHooks";
export * from "./locationHooks";
export * from "./assignmentHooks";
export * from "./branchHooks";
export * from "./districtHooks";
export * from "./cargoImageHooks";
export { useAdminDrivers } from "./adminHooks";
// Resolve export name conflict with utilityHooks: alias notification hook
export { useNotifications as useNotificationSettings } from "./notificationHooks";
// Resolve duplicate export with driverHooks: alias driver document hook
export { useDriverDocuments as useDriverDocumentsList } from "./driverDocumentHooks";
// Export driver document hooks needed by admin UIs
export { useDriverDocumentsById, useDriverDetail } from "./driverDocumentHooks";
export * from "./serviceAreaHooks";
