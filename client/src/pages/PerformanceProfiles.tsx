import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, Zap, BarChart3, Shield, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function PerformanceProfiles() {
  const [, navigate] = useLocation();
  const { data: profiles, isLoading } = trpc.performanceProfiles.list.useQuery();

  const profileInfo = {
    Turbo: {
      icon: Zap,
      color: "from-red-500 to-orange-500",
      description: "Maximum performance for powerful devices. Pushes clock speeds and threading to the limit.",
      benefits: ["Highest FPS", "Fastest boot times", "Best for flagship phones"],
      warning: "May cause instability on older devices"
    },
    Balanced: {
      icon: BarChart3,
      color: "from-blue-500 to-purple-500",
      description: "Optimal balance between performance and stability. Recommended for most users.",
      benefits: ["Great FPS", "Stable gameplay", "Works on most devices"],
      warning: null
    },
    Compatibility: {
      icon: Shield,
      color: "from-green-500 to-emerald-500",
      description: "Maximum compatibility and stability. Prioritizes reliability over raw performance.",
      benefits: ["High compatibility", "Stable on all devices", "Best for older phones"],
      warning: "Lower FPS than other profiles"
    }
  };

  const handleDownload = (profile: any) => {
    const element = document.createElement("a");
    const file = new Blob([profile.configYaml], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "config.yml";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Performance Profiles</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Download Optimized Profiles</h2>
          <p className="text-gray-300 text-lg">
            Choose a pre-built performance profile tailored to your device and gaming preferences. Download the config.yml file and place it in your HyperPS3 configuration directory.
          </p>
        </div>

        {/* Profiles Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-gray-300">Loading profiles...</p>
          </div>
        ) : profiles && profiles.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {profiles.map((profile) => {
              const info = profileInfo[profile.name as keyof typeof profileInfo];
              const Icon = info?.icon || Download;

              return (
                <Card
                  key={profile.id}
                  className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20 flex flex-col"
                >
                  <CardHeader>
                    <div className={`w-12 h-12 bg-gradient-to-br ${info?.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription className="text-base">{profile.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-6 flex-1">
                      <h4 className="font-semibold text-blue-300 mb-3">Key Benefits</h4>
                      <ul className="space-y-2">
                        {info?.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      {info?.warning && (
                        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded text-sm text-yellow-200">
                          ⚠️ {info.warning}
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      onClick={() => handleDownload(profile)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download config.yml
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">No profiles available yet.</p>
          </div>
        )}

        {/* Installation Guide */}
        <Card className="bg-white/5 border-white/10 mb-12">
          <CardHeader>
            <CardTitle>How to Install</CardTitle>
            <CardDescription>Follow these steps to apply your downloaded profile</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-4">
                <span className="font-bold text-blue-400 flex-shrink-0">1.</span>
                <span>Download your preferred profile using the button above</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-blue-400 flex-shrink-0">2.</span>
                <span>Locate your HyperPS3 configuration directory (usually in your app data folder)</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-blue-400 flex-shrink-0">3.</span>
                <span>Replace or backup your existing config.yml file</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-blue-400 flex-shrink-0">4.</span>
                <span>Place the downloaded config.yml in the configuration directory</span>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-blue-400 flex-shrink-0">5.</span>
                <span>Restart HyperPS3 and launch your game</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="border-blue-500/50 text-white hover:bg-blue-500/10"
            onClick={() => navigate("/settings-guide")}
          >
            Learn More About Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
