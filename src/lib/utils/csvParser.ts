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
 * Clean and normalize email address
 * Handles cases like "joDSADhn.doe@example.com07882346484" -> "john.doe@example.com"
 */
function cleanEmail(email: string): string {
  if (!email) return email;
  
  // Extract email before any trailing numbers/phone numbers
  // Pattern: email@domain.com followed by numbers
  const emailMatch = email.match(/^([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (emailMatch) {
    return emailMatch[1].toLowerCase();
  }
  
  // If no match, try to find email pattern anywhere in the string
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const found = email.match(emailPattern);
  if (found) {
    return found[1].toLowerCase();
  }
  
  return email.toLowerCase();
}

/**
 * Clean and normalize phone number
 * Handles scientific notation like "2.50788E+11" -> "250788000000"
 */
function cleanPhone(phone: string): string {
  if (!phone) return phone;
  
  // Handle scientific notation (e.g., "2.50788E+11")
  if (/[eE][+-]?\d+/.test(phone)) {
    const num = parseFloat(phone);
    if (!isNaN(num)) {
      // Convert to integer string, removing decimal points
      return Math.round(num).toString();
    }
  }
  
  // Remove common phone formatting characters but keep + for international
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // If it starts with +, keep it, otherwise ensure it's numeric
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Remove any non-numeric characters except +
  return cleaned.replace(/[^\d+]/g, '');
}

/**
 * Convert date from DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD format
 * Also handles other common formats
 */
function cleanDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === '') return '';
  
  const trimmed = dateStr.trim();
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Try to parse DD/MM/YYYY or DD-MM-YYYY format
  const dateMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dateMatch) {
    const [, part1, part2, year] = dateMatch;
    const num1 = parseInt(part1);
    const num2 = parseInt(part2);
    
    // If first part > 12, it must be DD/MM/YYYY format
    if (num1 > 12) {
      return `${year}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
    }
    // If second part > 12, it must be MM/DD/YYYY format (US)
    if (num2 > 12) {
      return `${year}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`;
    }
    // Ambiguous case: both <= 12, assume DD/MM/YYYY (more common in international formats)
    return `${year}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
  }
  
  // Return as-is if we can't parse it (validation will catch it)
  return trimmed;
}

/**
 * Clean and normalize driver data fields
 */
function cleanDriverData(data: Record<string, string>): Record<string, string> {
  const cleaned: Record<string, string> = { ...data };
  
  // Clean email
  if (cleaned.email) {
    cleaned.email = cleanEmail(cleaned.email);
  }
  
  // Clean phone
  if (cleaned.phone) {
    cleaned.phone = cleanPhone(cleaned.phone);
  }
  
  // Clean emergency phone
  if (cleaned.emergency_phone) {
    cleaned.emergency_phone = cleanPhone(cleaned.emergency_phone);
  }
  
  // Clean date fields
  if (cleaned.license_expiry) {
    cleaned.license_expiry = cleanDate(cleaned.license_expiry);
  }
  
  if (cleaned.date_of_birth) {
    cleaned.date_of_birth = cleanDate(cleaned.date_of_birth);
  }
  
  if (cleaned.medical_certificate_expiry) {
    cleaned.medical_certificate_expiry = cleanDate(cleaned.medical_certificate_expiry);
  }
  
  return cleaned;
}

/**
 * Map CSV column names to vehicle field names
 */
export function mapCSVToVehicleFields(
  csvRow: Record<string, string>
): Record<string, string> {
  const fieldMap: Record<string, string> = {
    // Device fields
    device_imei: "device_imei",
    imei: "device_imei",
    gps_imei: "device_imei",
    
    plate_number: "plate_number",
    plate: "plate_number",
    license_plate: "plate_number",
    registration_number: "plate_number",
    
    vehicle_type: "vehicle_type",
    type: "vehicle_type",
    vehicle_category: "vehicle_type",
    
    make: "make",
    manufacturer: "make",
    brand: "make",
    
    model: "model",
    
    year: "year",
    manufacture_year: "year",
    
    color: "color",
    
    driver_name: "driver_name",
    driver: "driver_name",
    assigned_driver: "driver_name",
    
    driver_phone: "driver_phone",
    driver_phone_number: "driver_phone",
    
    sim_number: "sim_number",
    sim: "sim_number",
    sim_card: "sim_number",
    
    device_model: "device_model",
    gps_device_model: "device_model",
    
    device_name: "device_name",
    device_alias: "device_name",
    gps_device_name: "device_name",
    
    capacity_kg: "capacity_kg",
    capacity: "capacity_kg",
    weight_capacity: "capacity_kg",
    max_weight: "capacity_kg",
    
    capacity_volume: "capacity_volume",
    volume_capacity: "capacity_volume",
    max_volume: "capacity_volume",
    
    fuel_type: "fuel_type",
    fuel: "fuel_type",
    
    branch_id: "branch_id",
    branch: "branch_id",
    
    status: "status",
    vehicle_status: "status",
  };

  const mapped: Record<string, string> = {};

  Object.entries(csvRow).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase().trim();
    const mappedKey = fieldMap[normalizedKey] || normalizedKey;
    mapped[mappedKey] = value;
  });

  return mapped;
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

  // Clean and normalize the data
  return cleanDriverData(mapped);
}
