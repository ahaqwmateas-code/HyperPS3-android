import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, AlertCircle, CheckCircle, Clock, XCircle, Bell } from "lucide-react";
import { toast } from "sonner";

export default function UserDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-12 pb-12 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-gray-300 mb-6">You need to sign in to access your dashboard.</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: userReports, isLoading: reportsLoading } = trpc.bugReports.myReports.useQuery({ limit: 50 });
  const { data: notifications, isLoading: notificationsLoading } = trpc.notifications.list.useQuery({ limit: 20 });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      toast.success("Notification marked as read");
    },
  });

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <Button
            variant="ghost"
            onClick={() => logout()}
            className="text-white hover:bg-white/10"
          >
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Profile Card */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle>Welcome, {user?.name || user?.email || "User"}!</CardTitle>
            <CardDescription>Manage your bug reports and stay updated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="text-white font-medium">{user?.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Member Since</p>
                <p className="text-white font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Role</p>
                <p className="text-white font-medium capitalize">{user?.role || "User"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 mb-8">
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600">
              My Bug Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600">
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Bug Reports Tab */}
          <TabsContent value="reports">
            {reportsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                <p className="text-gray-300">Loading your reports...</p>
              </div>
            ) : userReports && userReports.length > 0 ? (
              <div className="space-y-4">
                {userReports.map((report: any) => (
                  <Card key={report.id} className="bg-white/5 border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{report.gameSerial}</CardTitle>
                          <CardDescription>{report.deviceInfo}</CardDescription>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded border ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span className="text-xs font-medium capitalize">{report.status}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-gray-300">{report.issueDescription}</p>
                      {report.adminNotes && (
                        <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded text-sm">
                          <p className="text-blue-300 font-medium mb-1">Admin Response:</p>
                          <p className="text-gray-300">{report.adminNotes}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400">
                        Submitted {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 mb-6">You haven't submitted any bug reports yet.</p>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => navigate("/bug-report")}
                  >
                    Submit Your First Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            {notificationsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                <p className="text-gray-300">Loading notifications...</p>
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification: any) => (
                  <Card
                    key={notification.id}
                    className={`bg-white/5 border-white/10 ${!notification.isRead ? "border-blue-500/50 bg-blue-500/10" : ""}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Bell className="w-4 h-4 text-blue-400" />
                            <p className="font-medium">{notification.type}</p>
                            {!notification.isRead && (
                              <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/50 rounded text-xs text-blue-300">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 flex-shrink-0"
                            onClick={() => markAsReadMutation.mutate({ id: notification.id })}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-12 pb-12 text-center">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">No notifications yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-white/5 border-white/10 mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="border-blue-500/50 text-white hover:bg-blue-500/10 h-auto py-3"
                onClick={() => navigate("/smart-fix")}
              >
                Get Smart Recommendations
              </Button>
              <Button
                variant="outline"
                className="border-blue-500/50 text-white hover:bg-blue-500/10 h-auto py-3"
                onClick={() => navigate("/compatibility")}
              >
                Search Game Compatibility
              </Button>
              <Button
                variant="outline"
                className="border-blue-500/50 text-white hover:bg-blue-500/10 h-auto py-3"
                onClick={() => navigate("/bug-report")}
              >
                Submit Bug Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
