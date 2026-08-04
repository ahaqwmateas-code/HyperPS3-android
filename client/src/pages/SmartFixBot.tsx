import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap, Copy, Check } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface FixRecommendation {
  settings: Record<string, string>;
  explanation: string;
  severity: "low" | "medium" | "high";
}

export default function SmartFixBot() {
  const [, navigate] = useLocation();
  const [gameSerial, setGameSerial] = useState("");
  const [issue, setIssue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<FixRecommendation | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameSerial.trim() || !issue.trim()) {
      toast.error("Please provide both game serial and issue description");
      return;
    }

    setIsAnalyzing(true);

    // Simulate LLM analysis - in production this would call your LLM API
    setTimeout(() => {
      const mockRecommendations: Record<string, FixRecommendation> = {
        "black_screen": {
          settings: {
            "PPU_Decoder": "LLVM",
            "SPU_Decoder": "ASMJIT",
            "Write_Color_Buffers": "true",
            "Write_Depth_Buffer": "true",
            "Strict_Rendering_Mode": "true"
          },
          explanation: "Black screen typically indicates a rendering issue. We've enabled strict rendering mode and color/depth buffer writing to ensure proper frame output.",
          severity: "high"
        },
        "crash": {
          settings: {
            "SPU_Block_Size": "Safe",
            "Accurate_SPU_DMA": "true",
            "Accurate_SPU_Reservations": "true",
            "Thread_Scheduler_Mode": "Affinity"
          },
          explanation: "Game crashes often stem from SPU emulation issues. We've enabled accurate SPU DMA and reservations with safe block size to improve stability.",
          severity: "high"
        },
        "slow": {
          settings: {
            "Clocks_Scale": "150",
            "Thread_Scheduler_Mode": "Affinity",
            "Max_SPURS_Threads": "8",
            "Asynchronous_Queue_Scheduler": "true"
          },
          explanation: "Slow performance can be improved by increasing clock scaling and enabling async queue scheduling. The affinity scheduler helps distribute work efficiently.",
          severity: "medium"
        },
        "audio": {
          settings: {
            "Audio_Backend": "OpenAL",
            "Accurate_Audio_Timing": "true",
            "Audio_Buffer_Size": "512"
          },
          explanation: "Audio issues are often resolved by using OpenAL backend with accurate timing and appropriate buffer size for your device.",
          severity: "low"
        }
      };

      const lowerIssue = issue.toLowerCase();
      let rec = mockRecommendations["crash"];

      if (lowerIssue.includes("black") || lowerIssue.includes("screen")) {
        rec = mockRecommendations["black_screen"];
      } else if (lowerIssue.includes("slow") || lowerIssue.includes("lag") || lowerIssue.includes("fps")) {
        rec = mockRecommendations["slow"];
      } else if (lowerIssue.includes("audio") || lowerIssue.includes("sound")) {
        rec = mockRecommendations["audio"];
      }

      setRecommendation(rec);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleCopySettings = () => {
    if (!recommendation) return;

    const yamlContent = Object.entries(recommendation.settings)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    toast.success("Settings copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Smart Fix Bot</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
            <h2 className="text-4xl font-bold">AI-Powered Diagnostics</h2>
          </div>
          <p className="text-gray-300 text-lg">
            Describe your emulator issue and get instant, tailored configuration recommendations powered by intelligent analysis.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 sticky top-24">
              <CardHeader>
                <CardTitle>Describe Your Issue</CardTitle>
                <CardDescription>Provide details for analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Game Serial</label>
                    <Input
                      placeholder="e.g., BLUS12345"
                      value={gameSerial}
                      onChange={(e) => setGameSerial(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Issue Description</label>
                    <Textarea
                      placeholder="e.g., Game shows black screen on boot, crashes after 5 minutes, audio is distorted..."
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 min-h-24 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Get Recommendations
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {!recommendation ? (
              <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center min-h-96">
                <CardContent className="text-center">
                  <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">Enter your issue details to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Severity Badge */}
                <div>
                  <div className={`inline-block px-4 py-2 rounded-full font-medium text-sm ${
                    recommendation.severity === "high"
                      ? "bg-red-500/20 text-red-300 border border-red-500/50"
                      : recommendation.severity === "medium"
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                      : "bg-green-500/20 text-green-300 border border-green-500/50"
                  }`}>
                    {recommendation.severity === "high"
                      ? "🔴 Critical Issue"
                      : recommendation.severity === "medium"
                      ? "🟡 Moderate Issue"
                      : "🟢 Minor Issue"}
                  </div>
                </div>

                {/* Explanation */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle>Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">{recommendation.explanation}</p>
                  </CardContent>
                </Card>

                {/* Recommended Settings */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recommended Settings</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopySettings}
                        className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/40 border border-white/10 rounded p-4 font-mono text-sm space-y-2">
                      {Object.entries(recommendation.settings).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-blue-300">{key}:</span>
                          <span className="text-green-300">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card className="bg-blue-500/20 border border-blue-500/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>1. Copy the recommended settings above</p>
                    <p>2. Open your HyperPS3 configuration file (config.yml)</p>
                    <p>3. Update the settings with the recommended values</p>
                    <p>4. Restart HyperPS3 and test your game</p>
                    <p className="pt-2 text-blue-200">
                      💡 If the issue persists, try a different performance profile or submit a detailed bug report.
                    </p>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => navigate("/profiles")}
                  >
                    View Performance Profiles
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-500/50 text-white hover:bg-blue-500/10"
                    onClick={() => navigate("/bug-report")}
                  >
                    Submit Bug Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Common Issues */}
        <Card className="bg-white/5 border-white/10 mt-12">
          <CardHeader>
            <CardTitle>Common Issues & Quick Fixes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Black Screen on Boot", hint: "Try: Strict Rendering Mode + Color Buffer Writing" },
                { title: "Game Crashes", hint: "Try: Accurate SPU DMA + Safe Block Size" },
                { title: "Slow Performance", hint: "Try: Increase Clock Scale + Async Queue Scheduler" },
                { title: "Audio Issues", hint: "Try: OpenAL Backend + Accurate Audio Timing" },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded">
                  <h4 className="font-semibold text-blue-300 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-300">{item.hint}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
