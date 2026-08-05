import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, Settings, Zap, Smartphone, Copy, CheckCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AppSettings() {
  const [, navigate] = useLocation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: config, isLoading: configLoading } = trpc.appConfig.getConfig.useQuery();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">App Configuration</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {configLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p>Loading configuration...</p>
          </div>
        ) : config ? (
          <>
            {/* Version Info */}
            <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  App Version & Build
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded p-4">
                    <p className="text-gray-400 text-sm">Version</p>
                    <p className="text-2xl font-bold text-blue-400">{config.version}</p>
                  </div>
                  <div className="bg-white/10 rounded p-4">
                    <p className="text-gray-400 text-sm">Build Number</p>
                    <p className="text-2xl font-bold text-purple-400">{config.buildNumber}</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded p-4 border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">API Endpoint</p>
                  <div className="flex items-center justify-between bg-black/40 rounded p-3">
                    <code className="text-xs text-gray-300 break-all">{config.apiUrl}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(config.apiUrl, "api-url")}
                    >
                      {copiedId === "api-url" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Status */}
            <Card className="bg-white/5 border-white/10 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Enabled Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(config.features).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between bg-white/5 rounded p-4 border border-white/10">
                      <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <div className={`w-3 h-3 rounded-full ${enabled ? "bg-green-400" : "bg-red-400"}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Default Settings */}
            <Card className="bg-white/5 border-white/10 mb-8">
              <CardHeader>
                <CardTitle>Default Emulator Settings</CardTitle>
                <CardDescription>Optimal settings for best performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(config.defaultSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-black/40 rounded p-3 border border-white/10">
                      <span className="text-sm capitalize text-gray-300">{key.replace(/([A-Z])/g, " $1")}</span>
                      <code className="text-xs bg-blue-500/20 px-3 py-1 rounded text-blue-300">
                        {String(value)}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Profiles */}
            <Card className="bg-white/5 border-white/10 mb-8">
              <CardHeader>
                <CardTitle>Optimized Game Profiles</CardTitle>
                <CardDescription>{Object.keys(config.gameProfiles).length} games configured</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(config.gameProfiles).map((game) => (
                    <div key={game.serial} className="bg-black/40 rounded p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{game.title}</h3>
                          <p className="text-xs text-gray-400">{game.serial}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs text-green-300">
                          {game.compatibilityLevel}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-400">Target FPS</p>
                          <p className="font-semibold text-blue-300">{game.fps} FPS</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Notes</p>
                          <p className="font-semibold text-gray-300">{game.notes.split(" ")[0]}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Profiles */}
            <Card className="bg-white/5 border-white/10 mb-8">
              <CardHeader>
                <CardTitle>Performance Profiles</CardTitle>
                <CardDescription>Choose based on your device specs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {config.performanceProfiles.map((profile) => (
                    <div key={profile.level} className="bg-black/40 rounded p-4 border border-white/10 text-center">
                      <h3 className="font-semibold mb-2 capitalize">{profile.name}</h3>
                      <div className="space-y-2 text-xs text-gray-400">
                        <p>
                          <span className="text-blue-300 font-semibold">{profile.targetFps}</span> FPS
                        </p>
                        <p>
                          <span className="text-purple-300 font-semibold">{profile.minRam}</span> MB RAM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Features */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Available Special Features</CardTitle>
                <CardDescription>{config.specialFeatures.length} features available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {config.specialFeatures.map((feature) => (
                    <div key={feature.id} className="bg-black/40 rounded p-4 border border-white/10">
                      <h3 className="font-semibold mb-1">{feature.name}</h3>
                      <p className="text-xs text-gray-400 mb-2">{feature.description}</p>
                      <span className="inline-block px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                        {feature.category}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Download Instructions */}
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  For App Developers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">
                  The app can fetch this complete configuration from:
                </p>
                <div className="bg-black/40 rounded p-4 border border-white/10">
                  <code className="text-xs text-gray-300 break-all">
                    GET /api/trpc/appConfig.getConfig
                  </code>
                </div>
                <p className="text-sm text-gray-300">
                  All settings, game profiles, and special features are automatically provided by the website API.
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
