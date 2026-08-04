import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function BugReport() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    gameSerial: "",
    deviceInfo: "",
    issueDescription: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.bugReports.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Bug report submitted successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit bug report");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to submit a bug report");
      navigate("/");
      return;
    }

    if (!formData.gameSerial.trim() || !formData.deviceInfo.trim() || !formData.issueDescription.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.issueDescription.length < 10) {
      toast.error("Issue description must be at least 10 characters");
      return;
    }

    submitMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center px-4">
        <Card className="bg-white/5 border-white/10 max-w-md w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
            <p className="text-gray-300 mb-6">
              Your bug report has been submitted successfully. Our team will review it shortly.
            </p>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Submit Bug Report</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">Report an Issue</h2>
          <p className="text-gray-300 text-lg">
            Help us improve HyperPS3 by reporting bugs and compatibility issues. Your feedback is invaluable to our community.
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>Bug Report Form</CardTitle>
            <CardDescription>All fields are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Game Serial */}
              <div>
                <label className="block text-sm font-medium mb-2">Game Serial Number</label>
                <p className="text-xs text-gray-400 mb-2">e.g., BLUS12345 or BLES00001</p>
                <Input
                  placeholder="Enter game serial..."
                  value={formData.gameSerial}
                  onChange={(e) => setFormData({ ...formData, gameSerial: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Device Info */}
              <div>
                <label className="block text-sm font-medium mb-2">Device Information</label>
                <p className="text-xs text-gray-400 mb-2">e.g., Samsung Galaxy S24 Ultra, Android 14</p>
                <Input
                  placeholder="Enter device model and OS..."
                  value={formData.deviceInfo}
                  onChange={(e) => setFormData({ ...formData, deviceInfo: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Issue Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Issue Description</label>
                <p className="text-xs text-gray-400 mb-2">Describe the problem in detail (minimum 10 characters)</p>
                <Textarea
                  placeholder="Describe what's happening... (e.g., black screen on boot, game crashes after 5 minutes, audio is distorted)"
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 min-h-32 resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1">Tips for better reports:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Include the exact error message if available</li>
                    <li>• Mention which performance profile you're using</li>
                    <li>• Describe steps to reproduce the issue</li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Bug Report"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="bg-white/5 border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">What happens after I submit a report?</h4>
              <p className="text-sm text-gray-300">
                Our team reviews all submissions and prioritizes them based on impact and frequency. You'll receive updates via your dashboard.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">Can I track my report status?</h4>
              <p className="text-sm text-gray-300">
                Yes! Visit your dashboard to see all your submitted reports and their current status.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">How do I get help fixing my issue?</h4>
              <p className="text-sm text-gray-300">
                Try our Smart Fix Bot for instant recommendations, or check the Settings Guide for detailed explanations of each option.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
