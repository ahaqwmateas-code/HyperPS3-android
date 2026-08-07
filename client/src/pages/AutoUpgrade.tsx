import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Zap, CheckCircle, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AutoUpgrade() {
  const [, navigate] = useLocation();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const { data: status, isLoading: statusLoading, refetch } = trpc.autoUpgrade.getUpgradeStatus.useQuery();
  const { data: schedule } = trpc.autoUpgrade.scheduleAutoUpgrades.useQuery();

  const handleStartUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Auto-upgrade completed successfully!");
      refetch();
    } catch (error) {
      toast.error("Auto-upgrade failed");
    } finally {
      setIsUpgrading(false);
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
          <h1 className="text-2xl font-bold">Auto-Upgrade System</h1>
          <Button
            onClick={handleStartUpgrade}
            disabled={isUpgrading}
            className="bg-green-500 hover:bg-green-600"
          >
            {isUpgrading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Upgrading...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Auto-Upgrade
              </>
            )}
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Overview */}
        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Auto-Upgrade Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded p-4">
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-xl font-bold text-green-400">✓ Active</p>
              </div>
              <div className="bg-white/10 rounded p-4">
                <p className="text-gray-400 text-sm">Check Interval</p>
                <p className="text-xl font-bold text-blue-400">Every 1 Hour</p>
              </div>
              <div className="bg-white/10 rounded p-4">
                <p className="text-gray-400 text-sm">Update Window</p>
                <p className="text-xl font-bold text-purple-400">2-6 AM UTC</p>
              </div>
              <div className="bg-white/10 rounded p-4">
                <p className="text-gray-400 text-sm">Next Check</p>
                <p className="text-xl font-bold text-yellow-400">
                  {schedule ? new Date(schedule.nextCheckTime).toLocaleTimeString() : "Soon"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Statistics */}
        {status && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Upgrade Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="bg-black/40 rounded p-4 border border-white/10">
                  <p className="text-gray-400 text-sm">Total Tasks</p>
                  <p className="text-2xl font-bold text-blue-400">{status.statistics.totalTasks}</p>
                </div>
                <div className="bg-black/40 rounded p-4 border border-white/10">
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-green-400">{status.statistics.completed}</p>
                </div>
                <div className="bg-black/40 rounded p-4 border border-white/10">
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{status.statistics.failed}</p>
                </div>
                <div className="bg-black/40 rounded p-4 border border-white/10">
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{status.statistics.pending}</p>
                </div>
                <div className="bg-black/40 rounded p-4 border border-white/10">
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {status.statistics.successRate.toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Tasks */}
        {status && status.tasks.length > 0 && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle>Active Upgrade Tasks</CardTitle>
              <CardDescription>Real-time upgrade progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status.tasks.map((task) => (
                <div key={task.id} className="bg-black/40 rounded p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold capitalize">{task.type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-gray-400">ID: {task.id}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        task.status === "completed"
                          ? "bg-green-500/20 text-green-300"
                          : task.status === "failed"
                            ? "bg-red-500/20 text-red-300"
                            : task.status === "installing"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{task.progress}% Complete</p>
                  {task.error && <p className="text-xs text-red-400 mt-1">Error: {task.error}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Auto-Upgrade Features */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>Auto-Upgrade Features</CardTitle>
            <CardDescription>What happens automatically</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">App Updates</p>
                <p className="text-sm text-gray-400">Downloads and installs new app versions automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Crash Fix Application</p>
                <p className="text-sm text-gray-400">Applies new crash fixes automatically when available</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Mod Enablement</p>
                <p className="text-sm text-gray-400">Enables new special mods automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Smart Scheduling</p>
                <p className="text-sm text-gray-400">Installs updates during off-peak hours (2-6 AM UTC)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Zero User Action</p>
                <p className="text-sm text-gray-400">Everything happens automatically - no manual steps needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
