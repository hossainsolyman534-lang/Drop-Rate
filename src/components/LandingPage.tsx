import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowRight, CheckCircle2, BarChart3, MousePointer2, ShoppingCart, CreditCard, Zap, ShieldCheck, Search } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onConnect: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onConnect }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">DropLab</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#problem" className="hover:text-blue-600 transition-colors">Problem</a>
            <a href="#solution" className="hover:text-blue-600 transition-colors">Solution</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          </div>
          <Button onClick={onConnect} variant="default" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
              <Zap className="h-3 w-3" />
              Funnel Drop Analysis
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Find Where Your Ads Are <span className="text-blue-600">Losing Customers</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
              Connect your Meta Ads Manager and instantly see where users drop off in your funnel — no guesswork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={onConnect} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-14 text-lg shadow-lg shadow-blue-200 hover:translate-y-[-2px] transition-all">
                Connect Meta Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-xl px-8 h-14 text-lg border-slate-200 hover:bg-slate-50">
                See Demo
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-50 to-slate-50 rounded-[2rem] -z-10 blur-2xl opacity-50" />
            <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Campaign</p>
                    <p className="font-bold text-slate-900">Summer Sale 2024</p>
                  </div>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">Live</div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: "Impressions", value: "124,500", drop: null, color: "bg-slate-100" },
                    { label: "Clicks", value: "3,240", drop: "97.4%", color: "bg-blue-100" },
                    { label: "LP Views", value: "1,120", drop: "65.4%", color: "bg-blue-200" },
                    { label: "Add to Cart", value: "84", drop: "92.5%", color: "bg-red-100", highlight: true },
                    { label: "Purchases", value: "12", drop: "85.7%", color: "bg-blue-400" },
                  ].map((step, i) => (
                    <div key={i} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">{step.label}</span>
                        <span className="text-sm font-bold text-slate-900">{step.value}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - (i * 20)}%` }}
                          transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                          className={`h-full ${step.highlight ? 'bg-red-500' : 'bg-blue-600'} rounded-full`} 
                        />
                      </div>
                      {step.drop && (
                        <div className={`absolute -right-2 top-8 text-[10px] font-bold px-1.5 py-0.5 rounded ${step.highlight ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                          -{step.drop}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Running Ads But Not Getting Sales?</h2>
            <p className="text-lg text-slate-500">You’re losing money — but don’t know where.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: MousePointer2, title: "Empty Clicks", desc: "Getting clicks but no conversions on your site." },
              { icon: Search, title: "Lost Visitors", desc: "Visitors not reaching checkout or landing page." },
              { icon: CreditCard, title: "Abandoned Carts", desc: "High cart additions but no final purchases." },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
             <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: BarChart3, title: "Auto Funnel Tracking", desc: "We automatically map your Meta data into a clear funnel." },
                  { icon: ShieldCheck, title: "Step-by-Step Analysis", desc: "See exactly where users drop off between each stage." },
                  { icon: Zap, title: "Clear Problem ID", desc: "Instantly identify the biggest bottleneck in your funnel." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900">{item.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">See Exactly Where Users Drop</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Stop guessing why your campaigns aren't profitable. Our tool connects directly to your Meta Ads account to provide a granular breakdown of your customer journey.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Impression", "Click", "LPV", "ATC", "Purchase"].map((step, i) => (
                <React.Fragment key={i}>
                  <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-slate-700">{step}</div>
                  {i < 4 && <ArrowRight className="h-4 w-4 text-slate-300 self-center" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50/50 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900">Everything You Need to Optimize</h2>
            <p className="text-lg text-slate-500">Powerful features to help you scale your ads with confidence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Automatic Analysis", desc: "No manual data entry. We sync everything automatically." },
              { title: "Drop Rate Detection", desc: "Calculates conversion and drop rates between every step." },
              { title: "Problem Highlight", desc: "Automatically flags the stage with the highest drop rate." },
              { title: "Actionable Insights", desc: "Rule-based suggestions to help you fix common issues." },
            ].map((feature, i) => (
              <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                <CardContent className="p-8 space-y-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          <h2 className="text-4xl font-bold text-slate-900 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Connect Account", desc: "Securely link your Meta Ads account in one click." },
              { step: "02", title: "Select Campaign", desc: "Choose the ad account and date range to analyze." },
              { step: "03", title: "Get Insights", desc: "See your funnel breakdown and fix bottlenecks." },
            ].map((item, i) => (
              <div key={i} className="space-y-4 relative">
                <span className="text-6xl font-black text-slate-100 absolute -top-8 -left-4 -z-10">{item.step}</span>
                <h3 className="font-bold text-slate-900 text-xl">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
          <h2 className="text-4xl md:text-5xl font-bold text-white relative z-10">Stop Guessing. Start Fixing.</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto relative z-10">
            Join hundreds of advertisers who use DropLab to optimize their funnel and increase their ROI.
          </p>
          <div className="relative z-10">
            <Button onClick={onConnect} size="lg" className="bg-white hover:bg-slate-100 text-slate-900 rounded-xl px-10 h-14 text-lg font-bold">
              Analyze My Funnel
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1 rounded-md">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">DropLab</span>
          </div>
          <p className="text-sm text-slate-400">© 2024 DropLab Analysis Tool. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
