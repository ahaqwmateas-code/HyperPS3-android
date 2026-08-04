import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("open");

  // Check admin access
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-12 pb-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-300 mb-6">You don't have permission to access this page.</p>
            <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-blue-500 to-purple-600">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: reports, isLoading, refetch } = trpc.bugReports.list.useQuery({
    limit: 50,
  });

  const updateMutation = trpc.bugReports.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Report updated successfully");
      setSelectedReport(null);
      setAdminNotes("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update report");
    },
  });

  const handleUpdateReport = () => {
    if (!selectedReport) return;

    updateMutation.mutate({
      id: selectedReport.id,
      status: newStatus as any,
      adminNotes: adminNotes || undefined,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "investigating":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case "fixed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "closed":
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "investigating":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      case "fixed":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "closed":
        return "bg-gray-500/20 text-gray-300 border-gray-500/50";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Bug Reports</CardTitle>
                <CardDescription>
                  {reports?.length || 0} total reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                    <p className="text-gray-300">Loading reports...</p>
                  </div>
                ) : reports && reports.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedReport?.id === report.id
                            ? "bg-blue-500/20 border-blue-500/50"
                            : "bg-white/5 border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{report.gameSerial}</p>
                            <p className="text-sm text-gray-400">{report.deviceInfo}</p>
                          </div>
                          <div className={`flex items-center gap-2 px-2 py-1 rounded border ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="text-xs font-medium capitalize">{report.status}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">{report.issueDescription}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8">No reports yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report Details & Actions */}
          <div>
            {selectedReport ? (
              <Card className="bg-white/5 border-white/10 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Report Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Game Serial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Game Serial</label>
                    <p className="text-white font-mono">{selectedReport.gameSerial}</p>
                  </div>

                  {/* Device Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Device</label>
                    <p className="text-white text-sm">{selectedReport.deviceInfo}</p>
                  </div>

                  {/* Issue */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Issue Description</label>
                    <p className="text-white text-sm">{selectedReport.issueDescription}</p>
                  </div>

                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 text-white rounded px-3 py-2 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="fixed">Fixed</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
                    <Textarea
                      placeholder="Add internal notes..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm resize-none h-20"
                    />
                  </div>

                  {/* Existing Notes */}
                  {selectedReport.adminNotes && (
                    <div className="p-3 bg-white/5 border border-white/10 rounded text-sm">
                      <p className="text-gray-400 mb-1">Previous Notes:</p>
                      <p className="text-gray-300">{selectedReport.adminNotes}</p>
                    </div>
                  )}

                  {/* Update Button */}
                  <Button
                    onClick={handleUpdateReport}
                    disabled={updateMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Report"
                    )}
                  </Button>

                  {/* Close Button */}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(null)}
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center min-h-96">
                <CardContent className="text-center">
                  <p className="text-gray-400">Select a report to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-4 mt-12">
          {[
            { label: "Total Reports", value: reports?.length || 0, color: "from-blue-500 to-purple-600" },
            { label: "Open", value: reports?.filter((r) => r.status === "open").length || 0, color: "from-yellow-500 to-orange-600" },
            { label: "Fixed", value: reports?.filter((r) => r.status === "fixed").length || 0, color: "from-green-500 to-emerald-600" },
            { label: "Closed", value: reports?.filter((r) => r.status === "closed").length || 0, color: "from-gray-500 to-slate-600" },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
