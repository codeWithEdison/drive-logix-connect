// Payment API Test Script
// Run this in browser console to test the payment endpoints

const API_BASE_URL = "http://localhost:3000/v1"; // Updated to include v1 prefix

// Test data
const testData = {
  invoice_id: "test-invoice-123",
  amount: 1000,
  customer_email: "test@example.com",
  customer_name: "Test User",
  customer_phone: "+250788123456",
};

// Test Initialize Payment
async function testInitializePayment() {
  console.log("🧪 Testing Initialize Payment API...");

  try {
    const response = await fetch(
      `${API_BASE_URL}/payments/flutterwave/initialize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Get from localStorage
        },
        body: JSON.stringify(testData),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Initialize Payment API Success:", result);
      return result;
    } else {
      console.error("❌ Initialize Payment API Error:", result);
      throw new Error(result.message || "API call failed");
    }
  } catch (error) {
    console.error("❌ Initialize Payment API Failed:", error);
    throw error;
  }
}

// Test Verify Payment
async function testVerifyPayment(txRef = "test_tx_ref_123456789") {
  console.log("🧪 Testing Verify Payment API...");

  try {
    const response = await fetch(
      `${API_BASE_URL}/payments/flutterwave/verify?tx_ref=${txRef}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Verify Payment API Success:", result);
      return result;
    } else {
      console.error("❌ Verify Payment API Error:", result);
      throw new Error(result.message || "API call failed");
    }
  } catch (error) {
    console.error("❌ Verify Payment API Failed:", error);
    throw error;
  }
}

// Test Payment Methods
async function testPaymentMethods() {
  console.log("🧪 Testing Payment Methods API...");

  try {
    const response = await fetch(`${API_BASE_URL}/payments/methods`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Payment Methods API Success:", result);
      return result;
    } else {
      console.error("❌ Payment Methods API Error:", result);
      throw new Error(result.message || "API call failed");
    }
  } catch (error) {
    console.error("❌ Payment Methods API Failed:", error);
    throw error;
  }
}

// Run all tests
async function runAllApiTests() {
  console.log("🚀 Starting Payment API Tests...");
  console.log("📊 Test Data:", testData);

  const results = {
    initialize: null,
    verify: null,
    methods: null,
    errors: [],
  };

  try {
    // Test 1: Initialize Payment
    results.initialize = await testInitializePayment();

    // Wait 1 second between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 2: Verify Payment
    results.verify = await testVerifyPayment();

    // Wait 1 second between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 3: Payment Methods
    results.methods = await testPaymentMethods();

    console.log("🎉 All API Tests Completed Successfully!");
    console.log("📋 Results Summary:", results);
  } catch (error) {
    results.errors.push(error.message);
    console.error("💥 API Tests Failed:", error);
  }

  return results;
}

// Check if user is authenticated
function checkAuthentication() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.warn("⚠️ No access token found. Make sure you are logged in.");
    console.log("💡 To get a token, log in to the application first.");
    return false;
  }
  console.log("✅ Authentication token found");
  return true;
}

// Export functions for manual testing
window.paymentApiTests = {
  testInitializePayment,
  testVerifyPayment,
  testPaymentMethods,
  runAllApiTests,
  checkAuthentication,
  testData,
};

console.log("🔧 Payment API Test Functions Loaded!");
console.log("📖 Available functions:");
console.log("  - paymentApiTests.runAllApiTests() - Run all tests");
console.log("  - paymentApiTests.testInitializePayment() - Test initialize");
console.log("  - paymentApiTests.testVerifyPayment() - Test verify");
console.log("  - paymentApiTests.testPaymentMethods() - Test methods");
console.log("  - paymentApiTests.checkAuthentication() - Check auth");
console.log("");
console.log("🚀 To start testing, run: paymentApiTests.runAllApiTests()");
