import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, Zap, CheckCircle, Clock, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AutoUpdate() {
  const [, navigate] = useLocation();
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);

  const { data: updates, isLoading: updatesLoading, refetch } = trpc.autoUpdate.checkForUpdates.useQuery();
  const { data: stats } = trpc.autoUpdate.getUpdateStatistics.useQuery();

  const markInstalledMutation = trpc.autoUpdate.markUpdateInstalled.useMutation({
    onSuccess: () => {
      toast.success("Update marked as installed!");
      refetch();
    },
  });

  const applyCrashFixMutation = trpc.autoUpdate.applyCrashFix.useMutation({
    onSuccess: () => {
      toast.success("Crash fix applied automatically!");
      refetch();
    },
  });

  const enableModMutation = trpc.autoUpdate.enableMod.useMutation({
    onSuccess: () => {
      toast.success("Mod enabled automatically!");
      refetch();
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Auto-Update System</h1>
          <Button onClick={() => refetch()} className="bg-blue-500 hover:bg-blue-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Now
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Auto-Update Status */}
        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Auto-Update Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded p-4">
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-xl font-bold text-green-400">
                  {autoCheckEnabled ? "✓ Enabled" : "✗ Disabled"}
                </p>
              </div>
              <div className="bg-white/10 rounded p-4">
                <p className="text-gray-400 text-sm">Check Interval</p>
                <p className="text-xl font-bold text-blue-400">Every 1 Hour</p>
              </div>
              <div className="bg-white/10 rounded p-4">
                <p className="text-gray-400 text-sm">Last Check</p>
                <p className="text-xl font-bold text-purple-400">
                  {updates ? new Date(updates.lastCheckTime).toLocaleTimeString() : "Never"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCheckEnabled}
                  onChange={(e) => setAutoCheckEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Enable automatic update checks</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {updatesLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p>Checking for updates...</p>
          </div>
        ) : (
          <>
            {/* App Update */}
            {updates?.appUpdate && (
              <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    App Update Available
                  </CardTitle>
                  <CardDescription>New version with improvements and fixes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Version</p>
                      <p className="text-2xl font-bold text-blue-400">{updates.appUpdate.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">File Size</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {(updates.appUpdate.fileSize / 1024 / 1024).toFixed(1)}MB
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Priority</p>
                      <p className="text-2xl font-bold text-red-400 capitalize">{updates.appUpdate.priority}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">What's New:</p>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {updates.appUpdate.changelog.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => markInstalledMutation.mutate({ version: updates.appUpdate!.version })}
                    disabled={markInstalledMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download & Install Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Crash Fix Updates */}
            {updates && updates.crashFixUpdates.length > 0 && (
              <Card className="bg-white/5 border-white/10 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Crash Fixes Available ({updates.crashFixUpdates.length})
                  </CardTitle>
                  <CardDescription>Auto-apply fixes to stop game crashes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {updates.crashFixUpdates.map((fix) => (
                    <div key={fix.id} className="bg-black/40 rounded p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{fix.fixName}</h3>
                          <p className="text-sm text-gray-400">{fix.gameTitle} ({fix.gameSerial})</p>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-300">
                          {fix.successRate}% Success
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{fix.description}</p>
                      <Button
                        size="sm"
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
                        onClick={() => applyCrashFixMutation.mutate({ fixId: fix.id })}
                        disabled={applyCrashFixMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {fix.isAutoApply ? "Auto-Applied" : "Apply Fix"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Mod Updates */}
            {updates && updates.modUpdates.length > 0 && (
              <Card className="bg-white/5 border-white/10 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Mod Updates Available ({updates.modUpdates.length})
                  </CardTitle>
                  <CardDescription>New special mods and enhancements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {updates.modUpdates.map((mod) => (
                    <div key={mod.id} className="bg-black/40 rounded p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{mod.name}</h3>
                          <p className="text-sm text-gray-400">v{mod.version}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-xs text-blue-300">
                          {mod.gameSerials.length} games
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{mod.description}</p>
                      <Button
                        size="sm"
                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50"
                        onClick={() => enableModMutation.mutate({ modId: mod.id })}
                        disabled={enableModMutation.isPending}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {mod.isAutoEnable ? "Auto-Enabled" : "Enable Mod"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Update Statistics */}
            {stats && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Update Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-black/40 rounded p-4 border border-white/10">
                      <p className="text-gray-400 text-sm">Total App Updates</p>
                      <p className="text-2xl font-bold text-blue-400">{stats.totalAppUpdates}</p>
                    </div>
                    <div className="bg-black/40 rounded p-4 border border-white/10">
                      <p className="text-gray-400 text-sm">Crash Fixes Released</p>
                      <p className="text-2xl font-bold text-red-400">{stats.totalCrashFixes}</p>
                    </div>
                    <div className="bg-black/40 rounded p-4 border border-white/10">
                      <p className="text-gray-400 text-sm">Special Mods</p>
                      <p className="text-2xl font-bold text-yellow-400">{stats.totalMods}</p>
                    </div>
                    <div className="bg-black/40 rounded p-4 border border-white/10">
                      <p className="text-gray-400 text-sm">Avg Fix Success Rate</p>
                      <p className="text-2xl font-bold text-green-400">{stats.averageCrashFixSuccessRate}%</p>
                    </div>
                    <div className="bg-black/40 rounded p-4 border border-white/10">
                      <p className="text-gray-400 text-sm">On Latest Version</p>
                      <p className="text-2xl font-bold text-purple-400">{stats.usersOnLatestVersion}%</p>
                    </div>
                    <div className="bg-black/40 rounded p-4 border border-white/10">
                      <p className="text-gray-400 text-sm">With Latest Fixes</p>
                      <p className="text-2xl font-bold text-cyan-400">{stats.usersWithLatestCrashFixes}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
