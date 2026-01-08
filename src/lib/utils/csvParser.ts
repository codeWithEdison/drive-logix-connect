/**
 * Parse CSV file content into array of objects
 * Supports both CSV and Excel-like formats
 */
export function parseCSV(csvContent: string): Array<Record<string, string>> {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]).map((h) =>
    h.trim().toLowerCase().replace(/\s+/g, "_")
  );

  // Parse data rows
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || "";
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);
  return result;
}

/**
 * Map CSV column names to driver field names
 */
export function mapCSVToDriverFields(
  csvRow: Record<string, string>
): Record<string, string> {
  const fieldMap: Record<string, string> = {
    // Common variations
    full_name: "full_name",
    fullname: "full_name",
    name: "full_name",
    driver_name: "full_name",

    email: "email",
    e_mail: "email",

    phone: "phone",
    phone_number: "phone",
    mobile: "phone",
    telephone: "phone",

    password: "password",
    pwd: "password",

    preferred_language: "preferred_language",
    language: "preferred_language",
    lang: "preferred_language",

    license_number: "license_number",
    license: "license_number",
    driving_license: "license_number",

    license_type: "license_type",
    license_category: "license_type",

    license_expiry: "license_expiry",
    license_expiry_date: "license_expiry",
    license_expires: "license_expiry",

    code_number: "code_number",
    code: "code_number",
    driver_code: "code_number",
    driver_number: "code_number",

    date_of_birth: "date_of_birth",
    dob: "date_of_birth",
    birth_date: "date_of_birth",

    emergency_contact: "emergency_contact",
    emergency_name: "emergency_contact",

    emergency_phone: "emergency_phone",
    emergency_phone_number: "emergency_phone",

    blood_type: "blood_type",
    blood_group: "blood_type",

    medical_certificate_expiry: "medical_certificate_expiry",
    medical_expiry: "medical_certificate_expiry",
    medical_cert_expiry: "medical_certificate_expiry",

    branch_id: "branch_id",
    branch: "branch_id",
  };

  const mapped: Record<string, string> = {};

  Object.entries(csvRow).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase().trim();
    const mappedKey = fieldMap[normalizedKey] || normalizedKey;
    mapped[mappedKey] = value;
  });

  return mapped;
}
