import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2, TestTube } from "lucide-react";
import { toast } from "sonner";
import {
  useInitializeFlutterwavePayment,
  useVerifyFlutterwavePayment,
} from "@/lib/api/hooks/paymentHooks";

interface ApiTestResult {
  endpoint: string;
  status: "pending" | "success" | "error";
  response?: any;
  error?: string;
  duration?: number;
}

export function PaymentApiTester() {
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testInvoiceId, setTestInvoiceId] = useState("test-invoice-123");
  const [testAmount, setTestAmount] = useState(1000);
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testName, setTestName] = useState("Test User");
  const [testPhone, setTestPhone] = useState("+250788123456");

  const initializePaymentMutation = useInitializeFlutterwavePayment();
  const verifyPaymentMutation = useVerifyFlutterwavePayment();

  const addTestResult = (result: ApiTestResult) => {
    setTestResults((prev) => [...prev, result]);
  };

  const testInitializePayment = async () => {
    const startTime = Date.now();
    addTestResult({
      endpoint: "POST /v1/payments/flutterwave/initialize",
      status: "pending",
    });

    try {
      const result = await initializePaymentMutation.mutateAsync({
        invoice_id: testInvoiceId,
        amount: testAmount,
        customer_email: testEmail,
        customer_name: testName,
        customer_phone: testPhone,
      });

      const duration = Date.now() - startTime;

      addTestResult({
        endpoint: "POST /v1/payments/flutterwave/initialize",
        status: "success",
        response: result,
        duration,
      });

      toast.success("Initialize payment API test passed!");
    } catch (error: any) {
      const duration = Date.now() - startTime;

      addTestResult({
        endpoint: "POST /v1/payments/flutterwave/initialize",
        status: "error",
        error: error.message || "Unknown error",
        duration,
      });

      toast.error(`Initialize payment API test failed: ${error.message}`);
    }
  };

  const testVerifyPayment = async () => {
    const startTime = Date.now();
    const testTxRef = "test_tx_ref_123456789";

    addTestResult({
      endpoint: "GET /v1/payments/flutterwave/verify",
      status: "pending",
    });

    try {
      const result = await verifyPaymentMutation.mutateAsync(testTxRef);

      const duration = Date.now() - startTime;

      addTestResult({
        endpoint: "GET /v1/payments/flutterwave/verify",
        status: "success",
        response: result,
        duration,
      });

      toast.success("Verify payment API test passed!");
    } catch (error: any) {
      const duration = Date.now() - startTime;

      addTestResult({
        endpoint: "GET /v1/payments/flutterwave/verify",
        status: "error",
        error: error.message || "Unknown error",
        duration,
      });

      toast.error(`Verify payment API test failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);

    // Test initialize payment
    await testInitializePayment();

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test verify payment
    await testVerifyPayment();

    setIsTesting(false);
    toast.info("All API tests completed!");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "pending":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Payment API Tester
        </h1>
        <p className="text-muted-foreground">
          Test the backend payment endpoints to verify they're working correctly
        </p>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceId">Invoice ID</Label>
              <Input
                id="invoiceId"
                value={testInvoiceId}
                onChange={(e) => setTestInvoiceId(e.target.value)}
                placeholder="test-invoice-123"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (RWF)</Label>
              <Input
                id="amount"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="email">Customer Email</Label>
              <Input
                id="email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Test User"
              />
            </div>
            <div>
              <Label htmlFor="phone">Customer Phone</Label>
              <Input
                id="phone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+250788123456"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={runAllTests}
              disabled={isTesting}
              className="flex-1"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing APIs...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={testInitializePayment}
              disabled={isTesting}
            >
              Test Initialize
            </Button>
            <Button
              variant="outline"
              onClick={testVerifyPayment}
              disabled={isTesting}
            >
              Test Verify
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span
                        className={`font-medium ${getStatusColor(
                          result.status
                        )}`}
                      >
                        {result.endpoint}
                      </span>
                    </div>
                    {result.duration && (
                      <span className="text-sm text-muted-foreground">
                        {result.duration}ms
                      </span>
                    )}
                  </div>

                  {result.status === "success" && result.response && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <pre className="text-xs text-green-800 overflow-x-auto">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.status === "error" && result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-800">{result.error}</p>
                    </div>
                  )}

                  {result.status === "pending" && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-800">Testing...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Endpoints Info */}
      <Card>
        <CardHeader>
          <CardTitle>Expected API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold">
                POST /v1/payments/flutterwave/initialize
              </h4>
              <p className="text-sm text-muted-foreground">
                Initialize payment with Flutterwave
              </p>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                {`{
  "invoice_id": "string",
  "amount": number,
  "customer_email": "string",
  "customer_name": "string",
  "customer_phone": "string",
  "redirect_url": "string"
}`}
              </pre>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold">
                GET /v1/payments/flutterwave/verify
              </h4>
              <p className="text-sm text-muted-foreground">
                Verify payment status with transaction reference
              </p>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                {`Query Parameters:
?tx_ref=LC_2DED70BB-1028-4815-9FA3-645046356211_1757751239345_TGUDPV`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
