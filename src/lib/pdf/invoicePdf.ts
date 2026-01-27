import { jsPDF } from "jspdf";

/** Invoice-like object (API or detail view: snake_case or camelCase) */
export type InvoiceLike = {
  id: string;
  invoice_number?: string;
  invoiceNumber?: string;
  cargo_id?: string;
  cargoId?: string;
  subtotal?: number | string;
  tax_amount?: number | string;
  taxAmount?: number | string;
  discount_amount?: number | string;
  discountAmount?: number | string;
  total_amount?: number | string;
  totalAmount?: number | string;
  currency?: string;
  status?: string;
  due_date?: string;
  dueDate?: string;
  paid?: boolean;
  paid_at?: string;
  paidAt?: string;
  payment_method?: string;
  paymentMethod?: string;
  payment_reference?: string;
  paymentReference?: string;
  created_at?: string;
  createdAt?: string;
  cargo?: {
    id?: string;
    cargo_number?: string;
    cargoNumber?: string;
    type?: string;
    pickup_address?: string;
    pickupAddress?: string;
    destination_address?: string;
    destinationAddress?: string;
  };
};

/** Labels matching the invoice detail view (same keys as i18n invoices) */
export type InvoicePdfLabels = {
  companyName?: string;
  companyTagline?: string;
  companyLocation?: string;
  companyContact?: string;
  invoiceLabel?: string;
  invoiceNumberLabel?: string;
  cargoNumberLabel?: string;
  dateLabel?: string;
  dueDateLabel?: string;
  cargoInformation?: string;
  cargoNumberField?: string;
  typeField?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  invoiceDetails?: string;
  subtotalLabel?: string;
  taxLabel?: string;
  discountLabel?: string;
  totalAmountLabel?: string;
  paymentInformation?: string;
  paymentDate?: string;
  paymentMethodLabel?: string;
  referenceLabel?: string;
  naLabel?: string;
};

const get = (obj: any, ...keys: string[]): string | number | undefined => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
};

const num = (v: any): number =>
  typeof v === "number" && !Number.isNaN(v) ? v : parseFloat(String(v)) || 0;
const str = (v: any): string => (v != null ? String(v) : "");

const defaultLabels: Required<InvoicePdfLabels> = {
  companyName: "Loveway Rwanda Co. Ltd",
  companyTagline: "Logistics & Transportation Services",
  companyLocation: "Kigali, Rwanda",
  companyContact: "Phone: +250 788 123 456 | Email: info@lovewaylogistics.com",
  invoiceLabel: "INVOICE",
  invoiceNumberLabel: "Invoice #",
  cargoNumberLabel: "Cargo #",
  dateLabel: "Date",
  dueDateLabel: "Due Date",
  cargoInformation: "Cargo Information",
  cargoNumberField: "Cargo Number",
  typeField: "Type",
  pickupLocation: "PICKUP LOCATION",
  deliveryLocation: "DELIVERY LOCATION",
  invoiceDetails: "Invoice Details",
  subtotalLabel: "Subtotal",
  taxLabel: "Tax",
  discountLabel: "Discount",
  totalAmountLabel: "Total Amount",
  paymentInformation: "Payment Information",
  paymentDate: "Payment Date",
  paymentMethodLabel: "Payment Method",
  referenceLabel: "Reference",
  naLabel: "N/A",
};

function formatDatePdf(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrencyPdf(amount: string | number, currency: string): string {
  const n = num(amount);
  return new Intl.NumberFormat("rw-RW", {
    style: "currency",
    currency: currency || "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Generates a PDF that matches the invoice detail view layout and content.
 * Pass labels from t("invoices.*") so the PDF uses the same text as the UI.
 */
export function generateInvoicePdfBlob(
  invoice: InvoiceLike,
  options?: { labels?: Partial<InvoicePdfLabels> }
): Blob {
  const L = { ...defaultLabels, ...options?.labels };
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 20;
  const maxW = 210 - 2 * margin;
  let y = margin;
  const lineH = 6;
  const gap = 4;
  const sectionGap = 8;

  const invNum =
    str(get(invoice, "invoice_number", "invoiceNumber")) || str(invoice.id);
  const currency = str(get(invoice, "currency")) || "RWF";
  const subtotal = get(invoice, "subtotal", "subtotal");
  const tax = get(invoice, "tax_amount", "taxAmount");
  const discount = get(invoice, "discount_amount", "discountAmount");
  const total = get(invoice, "total_amount", "totalAmount");
  const due = str(get(invoice, "due_date", "dueDate"));
  const paidAt = str(get(invoice, "paid_at", "paidAt"));
  const status = str(get(invoice, "status"));
  const paid = !!(get(invoice, "paid") || paidAt);
  const created = str(get(invoice, "created_at", "createdAt"));

  const cargo = invoice.cargo;
  const cargoNum = cargo
    ? str(get(cargo, "cargo_number", "cargoNumber")) || str(invoice.cargo_id || invoice.cargoId)
    : str(invoice.cargo_id || invoice.cargoId);
  const cargoType = cargo ? str(get(cargo, "type")) : "";
  const pickup = cargo
    ? str(get(cargo, "pickup_address", "pickupAddress"))
    : "";
  const dest = cargo
    ? str(get(cargo, "destination_address", "destinationAddress"))
    : "";

  const orNa = (s: string) => (s ? s : L.naLabel);

  // —— Company header (matches detail view) ——
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(L.companyName, margin, y);
  y += lineH;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(L.companyTagline, margin, y);
  y += lineH;
  doc.text(L.companyLocation, margin, y);
  y += lineH;
  doc.text(L.companyContact, margin, y);
  y += lineH + gap;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, margin + maxW, y);
  y += sectionGap;

  // —— Invoice header: left block ——
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(L.invoiceLabel, margin, y);
  y += lineH;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${L.invoiceNumberLabel}: ${invNum}`, margin, y);
  y += lineH;
  doc.text(`${L.cargoNumberLabel}: ${orNa(cargoNum)}`, margin, y);
  y += lineH;
  doc.text(`${L.dateLabel}: ${created ? formatDatePdf(created) : L.naLabel}`, margin, y);
  y += lineH + gap;

  // —— Invoice header: right block (status, due date) ——
  const yRightStart = y - 3 * lineH - gap;
  doc.setFont("helvetica", "bold");
  doc.text(status.toUpperCase(), margin + maxW, yRightStart, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(
    `${L.dueDateLabel}: ${due ? formatDatePdf(due) : L.naLabel}`,
    margin + maxW,
    yRightStart + lineH + 2,
    { align: "right" }
  );
  y += sectionGap;

  // —— Cargo Information (matches detail “Cargo” card) ——
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(L.cargoInformation, margin, y);
  y += lineH + 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${L.cargoNumberField}`, margin, y);
  doc.text(orNa(cargoNum), margin + 50, y);
  y += lineH;
  doc.text(`${L.typeField}`, margin, y);
  doc.text(orNa(cargoType), margin + 50, y);
  y += lineH + 2;
  doc.setFontSize(9);
  doc.text(L.pickupLocation, margin, y);
  y += lineH;
  doc.setFont("helvetica", "normal");
  doc.text(pickup ? pickup : L.naLabel, margin, y);
  y += lineH + 2;
  doc.setFontSize(9);
  doc.text(L.deliveryLocation, margin, y);
  y += lineH;
  doc.setFont("helvetica", "normal");
  doc.text(dest ? dest : L.naLabel, margin, y);
  y += sectionGap;

  // —— Invoice Details (matches detail “Invoice Details” card) ——
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(L.invoiceDetails, margin, y);
  y += lineH + 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${L.subtotalLabel}:`, margin, y);
  doc.text(
    formatCurrencyPdf(String(subtotal ?? 0), currency),
    margin + maxW,
    y,
    { align: "right" }
  );
  y += lineH;
  doc.text(`${L.taxLabel} (${currency}):`, margin, y);
  doc.text(formatCurrencyPdf(String(tax ?? 0), currency), margin + maxW, y, {
    align: "right",
  });
  y += lineH;
  if (num(discount) > 0) {
    doc.setTextColor(0, 120, 0);
    doc.text(`${L.discountLabel}:`, margin, y);
    doc.text(
      `-${formatCurrencyPdf(String(discount), currency)}`,
      margin + maxW,
      y,
      { align: "right" }
    );
    doc.setTextColor(0, 0, 0);
    y += lineH;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${L.totalAmountLabel}:`, margin, y);
  doc.text(
    formatCurrencyPdf(String(total ?? 0), currency),
    margin + maxW,
    y,
    { align: "right" }
  );
  doc.setFont("helvetica", "normal");
  y += lineH + sectionGap;

  // —— Payment Information (if paid; matches detail “Payment Information” card) ——
  if (paid && paidAt) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(L.paymentInformation, margin, y);
    y += lineH + 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${L.paymentDate}:`, margin, y);
    doc.text(formatDatePdf(paidAt), margin + 50, y);
    y += lineH;
    const method = str(get(invoice, "payment_method", "paymentMethod"));
    if (method) {
      doc.text(`${L.paymentMethodLabel}:`, margin, y);
      doc.text(method.replace(/_/g, " "), margin + 50, y);
      y += lineH;
    }
    const ref = str(get(invoice, "payment_reference", "paymentReference"));
    if (ref) {
      doc.text(`${L.referenceLabel}:`, margin, y);
      doc.text(ref, margin + 50, y);
      y += lineH;
    }
  }

  return doc.output("blob");
}

/**
 * Returns true if the blob looks like a valid PDF (type and minimal size).
 */
export function isLikelyPdf(blob: Blob): boolean {
  if (!blob || blob.size < 100) return false;
  const t = (blob.type || "").toLowerCase();
  return t === "application/pdf" || t === "application/octet-stream";
}
