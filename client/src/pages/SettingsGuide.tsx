import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Settings, Zap, Volume2 } from "lucide-react";
import { useLocation } from "wouter";

export default function SettingsGuide() {
  const [, navigate] = useLocation();
  const { data: allSettings, isLoading } = trpc.settingsGuide.listAll.useQuery();

  const categories = [
    { name: "Core", icon: Zap, color: "from-blue-500 to-purple-600" },
    { name: "Video", icon: Settings, color: "from-purple-500 to-pink-600" },
    { name: "Audio", icon: Volume2, color: "from-green-500 to-emerald-600" },
  ];

  const groupedSettings = allSettings?.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, typeof allSettings>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Settings Guide</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Master Every Setting</h2>
          <p className="text-gray-300 text-lg">
            Comprehensive documentation of all HyperPS3 emulator settings. Learn what each option does and how to optimize for your device and games.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-gray-300">Loading settings guide...</p>
          </div>
        ) : (
          <Tabs defaultValue="Core" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 mb-8">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger
                    key={cat.name}
                    value={cat.name}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {cat.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.name} value={cat.name} className="space-y-6">
                <div className="grid gap-6">
                  {groupedSettings?.[cat.name]?.map((setting) => (
                    <Card key={setting.id} className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{setting.displayName}</CardTitle>
                            <CardDescription className="font-mono text-xs text-gray-400 mt-1">
                              {setting.settingKey}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {setting.recommendedValue && (
                              <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-xs font-medium text-blue-300">
                                Default: {setting.recommendedValue}
                              </div>
                            )}
                            {setting.recommendedValueHeavyGames && setting.recommendedValueHeavyGames !== setting.recommendedValue && (
                              <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-xs font-medium text-purple-300">
                                Heavy Games: {setting.recommendedValueHeavyGames}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-300 leading-relaxed">{setting.description}</p>

                        {setting.possibleValues && (
                          <div>
                            <h4 className="font-semibold text-blue-300 mb-2">Possible Values</h4>
                            <div className="flex flex-wrap gap-2">
                              {JSON.parse(setting.possibleValues).map((value: string) => (
                                <span
                                  key={value}
                                  className="px-3 py-1 bg-white/5 border border-white/20 rounded text-sm font-mono"
                                >
                                  {value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Recommended (General)</p>
                            <p className="font-mono text-blue-300 font-semibold">{setting.recommendedValue || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Recommended (Heavy Games)</p>
                            <p className="font-mono text-purple-300 font-semibold">{setting.recommendedValueHeavyGames || "N/A"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Tips Section */}
        <Card className="bg-white/5 border-white/10 mt-12">
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded">
                <h4 className="font-semibold text-blue-300 mb-2">For Performance</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Use LLVM decoders instead of Interpreter</li>
                  <li>• Enable Async Queue Scheduler</li>
                  <li>• Increase Clock Scale for powerful devices</li>
                  <li>• Use Affinity thread scheduler</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-500/20 border border-purple-500/50 rounded">
                <h4 className="font-semibold text-purple-300 mb-2">For Compatibility</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Use Interpreter decoders for problematic games</li>
                  <li>• Enable Strict Rendering Mode</li>
                  <li>• Enable Accurate SPU DMA</li>
                  <li>• Use Compatibility profile</li>
                </ul>
              </div>
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded">
                <h4 className="font-semibold text-green-300 mb-2">For Audio</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Use OpenAL backend</li>
                  <li>• Increase buffer size if crackling occurs</li>
                  <li>• Enable Accurate Audio Timing for heavy games</li>
                </ul>
              </div>
              <div className="p-4 bg-orange-500/20 border border-orange-500/50 rounded">
                <h4 className="font-semibold text-orange-300 mb-2">General Advice</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Start with Balanced profile</li>
                  <li>• Use Smart Fix Bot for issues</li>
                  <li>• Test settings with your specific game</li>
                  <li>• Use Performance Profiles as starting points</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 mr-4"
            onClick={() => navigate("/smart-fix")}
          >
            Get Smart Recommendations
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-blue-500/50 text-white hover:bg-blue-500/10"
            onClick={() => navigate("/profiles")}
          >
            Download Profiles
          </Button>
        </div>
      </div>
    </div>
  );
}
