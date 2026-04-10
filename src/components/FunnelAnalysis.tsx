import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, TrendingDown, ArrowRight, Info, AlertTriangle, Save, BarChart3, MousePointer2, LayoutDashboard, Search, ShoppingCart, CreditCard, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";

interface FunnelData {
  impressions: number;
  clicks: number;
  landingPageViews: number;
  addToCart: number;
  purchases: number;
}

interface Step {
  name: string;
  value: number;
  conversion: number;
  drop: number;
  color: string;
  icon: any;
}

export const FunnelAnalysis: React.FC = () => {
  const { user, userData } = useAuth();
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [funnelSteps, setFunnelSteps] = useState<Step[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [problemArea, setProblemArea] = useState<string | null>(null);
  const [reportName, setReportName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rawFunnelData, setRawFunnelData] = useState<FunnelData | null>(null);

  useEffect(() => {
    if (userData?.metaAccessToken) {
      fetchAdAccounts();
    }
  }, [userData]);

  useEffect(() => {
    if (selectedAccount) {
      fetchCampaigns();
    }
  }, [selectedAccount]);

  const fetchAdAccounts = async () => {
    setFetchingMeta(true);
    try {
      const res = await fetch(`/api/meta/adaccounts?accessToken=${userData.metaAccessToken}`);
      const data = await res.json();
      if (data.data) setAdAccounts(data.data);
    } catch (err) {
      setError("Failed to fetch ad accounts");
    } finally {
      setFetchingMeta(false);
    }
  };

  const fetchCampaigns = async () => {
    setFetchingMeta(true);
    try {
      const res = await fetch(`/api/meta/campaigns?accessToken=${userData.metaAccessToken}&adAccountId=${selectedAccount}`);
      const data = await res.json();
      if (data.data) setCampaigns(data.data);
    } catch (err) {
      setError("Failed to fetch campaigns");
    } finally {
      setFetchingMeta(false);
    }
  };

  const analyzeFunnel = async () => {
    if (!selectedCampaign) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/meta/insights?accessToken=${userData.metaAccessToken}&objectId=${selectedCampaign}`);
      const data = await res.json();
      
      if (data.data && data.data.length > 0) {
        const insight = data.data[0];
        const actions = insight.actions || [];
        
        const getActionValue = (type: string) => {
          const action = actions.find((a: any) => a.action_type === type);
          return action ? parseInt(action.value) : 0;
        };

        const rawData: FunnelData = {
          impressions: parseInt(insight.impressions) || 0,
          clicks: parseInt(insight.inline_link_clicks) || 0,
          landingPageViews: getActionValue('landing_page_view'),
          addToCart: getActionValue('off_site_combined_ads_add_to_cart') || getActionValue('add_to_cart'),
          purchases: getActionValue('off_site_combined_ads_purchase') || getActionValue('purchase'),
        };

        setRawFunnelData(rawData);
        processFunnelData(rawData);
      } else {
        setError("No data found for this campaign in the last 30 days.");
      }
    } catch (err) {
      setError("Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  };

  const processFunnelData = (data: FunnelData) => {
    const steps = [
      { name: "Impressions", value: data.impressions, icon: Search },
      { name: "Clicks", value: data.clicks, icon: MousePointer2 },
      { name: "LP Views", value: data.landingPageViews, icon: LayoutDashboard },
      { name: "Add to Cart", value: data.addToCart, icon: ShoppingCart },
      { name: "Purchases", value: data.purchases, icon: CreditCard },
    ];

    const processedSteps: Step[] = steps.map((step, i) => {
      const prevValue = i === 0 ? step.value : steps[i - 1].value;
      const conversion = prevValue === 0 ? 0 : (step.value / prevValue) * 100;
      const drop = 100 - conversion;
      return {
        ...step,
        conversion: i === 0 ? 100 : conversion,
        drop: i === 0 ? 0 : drop,
        color: "#3b82f6" // Default blue
      };
    });

    // Identify problem area (highest drop rate after impressions)
    let maxDrop = -1;
    let problemIdx = -1;
    for (let i = 1; i < processedSteps.length; i++) {
      if (processedSteps[i].drop > maxDrop && processedSteps[i].value > 0) {
        maxDrop = processedSteps[i].drop;
        problemIdx = i;
      }
    }

    if (problemIdx !== -1) {
      processedSteps[problemIdx].color = "#ef4444"; // Red for problem area
      setProblemArea(processedSteps[problemIdx].name);
    }

    setFunnelSteps(processedSteps);
    generateInsights(processedSteps);
  };

  const generateInsights = (steps: Step[]) => {
    const newInsights: string[] = [];
    
    // CTR Insight (Impression -> Click)
    if (steps[1].conversion < 1) {
      newInsights.push("Low CTR: Your ad creative might not be resonating with the audience. Try testing new hooks or visuals.");
    }
    
    // LPV Insight (Click -> LPV)
    if (steps[2].conversion < 70 && steps[1].value > 0) {
      newInsights.push("High Click-to-LPV Drop: Your landing page might be loading too slowly or there's a disconnect between the ad and the page.");
    }
    
    // ATC Insight (LPV -> ATC)
    if (steps[3].conversion < 5 && steps[2].value > 0) {
      newInsights.push("Low ATC Rate: Your product offer or landing page content might not be persuasive enough.");
    }
    
    // Purchase Insight (ATC -> Purchase)
    if (steps[4].conversion < 30 && steps[3].value > 0) {
      newInsights.push("Checkout Friction: High abandonment at checkout. Check for unexpected shipping costs or a complex checkout process.");
    }

    if (newInsights.length === 0) {
      newInsights.push("Your funnel is performing within healthy benchmarks. Keep scaling!");
    }

    setInsights(newInsights);
  };

  const handleSaveReport = async () => {
    if (!user || !rawFunnelData || !reportName) return;
    setSaving(true);
    try {
      const campaign = campaigns.find(c => c.id === selectedCampaign);
      const account = adAccounts.find(a => a.account_id === selectedAccount);

      await addDoc(collection(db, "reports"), {
        userId: user.uid,
        name: reportName,
        adAccountId: selectedAccount,
        adAccountName: account?.name || selectedAccount,
        campaignId: selectedCampaign,
        campaignName: campaign?.name || selectedCampaign,
        data: rawFunnelData,
        createdAt: new Date().toISOString()
      });
      setIsDialogOpen(false);
      setReportName("");
      alert("Report saved successfully!");
    } catch (err: any) {
      setError("Failed to save report: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-bold">Funnel Configuration</CardTitle>
          <CardDescription>Select your ad account and campaign to analyze.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end p-6">
          <div className="space-y-2">
            <Label className="text-slate-600 font-bold text-xs uppercase tracking-wider">Ad Account</Label>
            <Select onValueChange={setSelectedAccount} value={selectedAccount} disabled={fetchingMeta}>
              <SelectTrigger className="rounded-xl border-slate-200 h-11">
                <SelectValue placeholder={fetchingMeta ? "Loading..." : "Select Account"} />
              </SelectTrigger>
              <SelectContent>
                {adAccounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.account_id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 font-bold text-xs uppercase tracking-wider">Campaign</Label>
            <Select onValueChange={setSelectedCampaign} value={selectedCampaign} disabled={!selectedAccount || fetchingMeta}>
              <SelectTrigger className="rounded-xl border-slate-200 h-11">
                <SelectValue placeholder={fetchingMeta ? "Loading..." : "Select Campaign"} />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map(camp => (
                  <SelectItem key={camp.id} value={camp.id}>{camp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={analyzeFunnel} disabled={!selectedCampaign || loading} className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            Analyze Funnel
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="rounded-2xl bg-red-50 border-red-100 text-red-900">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      ) : funnelSteps.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 bg-slate-50/30">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <TrendingDown className="h-5 w-5 text-blue-500" />
                  Funnel Visualization
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 rounded-lg border-slate-200 hover:bg-slate-50">
                      <Save className="h-4 w-4" />
                      Save Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Save Funnel Report</DialogTitle>
                      <DialogDescription>
                        Give your report a name to save it to your dashboard.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Report Name</Label>
                        <Input 
                          id="name" 
                          placeholder="e.g. Q1 Campaign Analysis" 
                          value={reportName}
                          onChange={(e) => setReportName(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                      <Button onClick={handleSaveReport} disabled={saving || !reportName} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Report
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col gap-6">
                  {funnelSteps.map((step, i) => (
                    <motion.div 
                      key={step.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step.color === '#ef4444' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{step.name}</span>
                            <span className="font-mono font-bold text-slate-700">{step.value.toLocaleString()}</span>
                          </div>
                          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(step.value / funnelSteps[0].value) * 100}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-full ${step.color === '#ef4444' ? 'bg-red-500' : 'bg-blue-600'} rounded-full`}
                            />
                          </div>
                        </div>
                        {i > 0 && (
                          <div className="w-24 text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Conversion</p>
                            <p className={`text-sm font-black ${step.color === '#ef4444' ? 'text-red-600' : 'text-green-600'}`}>
                              {step.conversion.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>
                      {i < funnelSteps.length - 1 && (
                        <div className="ml-5 h-6 border-l-2 border-dashed border-slate-200 my-1" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className={`border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white ${problemArea ? "ring-2 ring-red-100" : ""}`}>
              <CardHeader className={`border-b border-slate-100 ${problemArea ? 'bg-red-50/50' : 'bg-slate-50/30'}`}>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${problemArea ? 'text-red-500' : 'text-slate-400'}`} />
                  Critical Drop Point
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {problemArea ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      You are losing <span className="font-black text-red-600">{funnelSteps.find(s => s.name === problemArea)?.drop.toFixed(1)}%</span> of users at the <span className="font-bold text-slate-900">{problemArea}</span> stage.
                    </p>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-xs font-bold text-red-800 uppercase tracking-widest mb-1">Impact Level</p>
                      <p className="text-xl font-black text-red-600">High Priority</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Analyze a campaign to see results.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 bg-slate-50/30">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  Smart Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {insights.map((insight, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                       <ArrowRight className="h-3 w-3 text-blue-500" />
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-3xl py-20">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-2">
              <BarChart3 className="h-8 w-8 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">No Data Analyzed</h3>
              <p className="text-slate-500 max-w-xs">Select a campaign above to see your funnel breakdown and insights.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
