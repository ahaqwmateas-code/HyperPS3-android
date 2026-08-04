import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function VersionTracker() {
  const [, navigate] = useLocation();
  const { data: versions, isLoading } = trpc.emulatorVersions.list.useQuery({ limit: 10 });
  const { data: latest } = trpc.emulatorVersions.latest.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Version Tracker</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Latest Version Banner */}
        {latest && (
          <div className="mb-12 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h2 className="text-3xl font-bold">HyperPS3 v{latest.version}</h2>
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-sm font-medium text-green-300">
                    Latest
                  </span>
                </div>
                <p className="text-gray-300 mb-4">Released {new Date(latest.releaseDate).toLocaleDateString()}</p>
                <p className="text-gray-200 mb-6 max-w-2xl">{latest.changelogText.split("\n")[0]}</p>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex-shrink-0"
                onClick={() => window.open("https://files.manuscdn.com/user_upload_by_module/session_file/310519663872070748/rkjVoglTZzhtyEVw.apk", "_blank")}
              >
                <Download className="w-5 h-5 mr-2" />
                Download APK (Ultra-Fast)
              </Button>
            </div>
          </div>
        )}

        {/* Version History */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Version History</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-gray-300">Loading versions...</p>
            </div>
          ) : versions && versions.length > 0 ? (
            <div className="space-y-4">
              {versions.map((version) => (
                <Card
                  key={version.id}
                  className={`bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors ${
                    version.isLatest ? "border-blue-500/50 bg-blue-500/10" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-2xl">v{version.version}</CardTitle>
                          {version.isLatest && (
                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-xs font-medium text-blue-300">
                              Latest
                            </span>
                          )}
                          {version.isCritical && (
                            <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-xs font-medium text-red-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Critical
                            </span>
                          )}
                        </div>
                        <CardDescription>
                          Released {new Date(version.releaseDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
                        onClick={() => window.open(version.downloadUrl, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <pre className="bg-black/40 border border-white/10 rounded p-4 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
                        {version.changelogText}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No versions available</p>
          )}
        </div>

        {/* Update Guide */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>How to Update</CardTitle>
            <CardDescription>Follow these steps to update HyperPS3</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-4">
                <span className="font-bold text-blue-400 flex-shrink-0">1.</span>
                <span>Download the latest APK from the version above</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-blue-400 flex-shrink-0">2.</span>
                <span>Open the APK file on your Android device</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-blue-400 flex-shrink-0">3.</span>
                <span>If prompted, allow installation from unknown sources</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-blue-400 flex-shrink-0">4.</span>
                <span>Follow the installation wizard</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-blue-400 flex-shrink-0">5.</span>
                <span>Launch HyperPS3 and enjoy the new features!</span>
              </li>
            </ol>

            <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded mt-6">
              <p className="text-sm text-yellow-200">
                <strong>Tip:</strong> Your game saves and settings are preserved during updates. No data will be lost.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white/5 border-white/10 mt-8">
          <CardHeader>
            <CardTitle>Stay Updated</CardTitle>
            <CardDescription>Get notified about new releases and critical updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Sign in to your HyperPS3 account to receive notifications about new versions and critical security updates.
            </p>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => navigate("/")}
            >
              Sign In to Enable Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
