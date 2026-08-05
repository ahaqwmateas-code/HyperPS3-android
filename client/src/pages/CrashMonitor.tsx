import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, Zap, Loader2, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function CrashMonitor() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [gameSerial, setGameSerial] = useState("BCES00510");
  
  const { data: crashes, isLoading, refetch } = trpc.crashes.getCrashesForGame.useQuery({
    gameSerial,
    limit: 20,
  });

  const applyFixMutation = trpc.crashes.applyFix.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const reportSuccessMutation = trpc.crashes.reportFixSuccess.useMutation({
    onSuccess: () => {
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
          <h1 className="text-2xl font-bold">Crash Monitor</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Selection */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle>Select Game to Monitor</CardTitle>
            <CardDescription>View crashes and auto-fixes for specific games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="text"
                value={gameSerial}
                onChange={(e) => setGameSerial(e.target.value.toUpperCase())}
                placeholder="Enter game serial (e.g., BCES00510)"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <Button
                onClick={() => refetch()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Crashes List */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Recent Crashes</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-gray-300">Loading crashes...</p>
            </div>
          ) : crashes && crashes.length > 0 ? (
            <div className="space-y-4">
              {crashes.map((crash) => (
                <Card
                  key={crash.id}
                  className={`bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors ${
                    crash.fixedByAutoFix ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {crash.fixedByAutoFix ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-red-400" />
                          )}
                          <CardTitle className="text-xl">
                            {crash.crashType.replace(/_/g, " ").toUpperCase()}
                          </CardTitle>
                          {crash.fixedByAutoFix && (
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs font-medium text-green-300">
                              Fixed
                            </span>
                          )}
                        </div>
                        <CardDescription>
                          {new Date(crash.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      {!crash.fixedByAutoFix && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          onClick={() => applyFixMutation.mutate({
                            crashLogId: crash.id,
                            fixProfileId: 1, // Would be dynamic in production
                          })}
                          disabled={applyFixMutation.isPending}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Auto-Fix
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {crash.errorMessage && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Error Message:</p>
                        <pre className="bg-black/40 border border-white/10 rounded p-3 text-xs text-gray-300 overflow-x-auto">
                          {crash.errorMessage}
                        </pre>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Crash Type</p>
                        <p className="text-white font-medium">{crash.crashType}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Emulator Version</p>
                        <p className="text-white font-medium">{crash.emulatorVersion || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Performance Profile</p>
                        <p className="text-white font-medium">{crash.performanceProfile || "Default"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className={`font-medium ${crash.fixedByAutoFix ? "text-green-400" : "text-red-400"}`}>
                          {crash.fixedByAutoFix ? "Fixed" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">No crashes detected for this game!</p>
                <p className="text-gray-400 text-sm mt-2">Great job! The game is running smoothly.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
