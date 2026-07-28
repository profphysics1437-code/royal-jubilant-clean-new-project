"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  Heart,
  Search,
  Calendar,
  Bell,
  MessageSquare,
  FileText,
  User as UserIcon,
  LogIn,
  Eye,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { properties as fallbackProperties, agents as fallbackAgents } from "@/lib/data";
import { useApi } from "@/lib/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DashboardModal() {
  const { dashboardOpen, setDashboardOpen, savedProperties, openProperty } = useStore();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  // Fetch from DB (with fallback so UI renders instantly)
  const { data: propData } = useApi<{ properties: any[] }>("/api/public/properties?limit=0", { properties: [] });
  const properties: any[] = propData?.properties || [];
  const { data: agentData } = useApi<{ agents: any[] }>("/api/public/agents", { agents: fallbackAgents });
  const agents: any[] = agentData?.agents || fallbackAgents;

  const saved = properties.filter((p) => savedProperties.includes(p.id));

  return (
    <AnimatePresence>
      {dashboardOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDashboardOpen(false)}
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-8"
          >
            {/* Header */}
            <div className="bg-royal-gradient-diagonal text-white p-6 lg:p-8 relative">
              <button onClick={() => setDashboardOpen(false)} className="absolute top-4 right-4 size-10 rounded-full hover:bg-white/10 flex items-center justify-center">
                <X className="size-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-11 rounded-xl bg-[#C9A961] flex items-center justify-center">
                  <LayoutDashboard className="size-5 text-[#0A1F44]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-medium">Client Portal</h2>
                  <p className="text-xs text-white/60">Your saved properties, searches, viewings & messages</p>
                </div>
              </div>
            </div>

            {!loggedIn ? (
              <div className="p-6 lg:p-12 max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h3 className="font-serif text-xl text-[#0A1F44]">
                    {mode === "login" ? "Welcome back" : "Create your account"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mode === "login" ? "Sign in to access your saved properties and viewing requests" : "Save properties, track viewings and get alerts on new listings"}
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setLoggedIn(true); }} className="space-y-4">
                  {mode === "register" && (
                    <div>
                      <Label className="text-xs tracking-luxury uppercase text-[#A68A3F] mb-2 block">Full Name</Label>
                      <Input required className="h-10 bg-[#F9FAFB]" />
                    </div>
                  )}
                  <div>
                    <Label className="text-xs tracking-luxury uppercase text-[#A68A3F] mb-2 block">Email</Label>
                    <Input type="email" required className="h-10 bg-[#F9FAFB]" />
                  </div>
                  <div>
                    <Label className="text-xs tracking-luxury uppercase text-[#A68A3F] mb-2 block">Password</Label>
                    <Input type="password" required className="h-10 bg-[#F9FAFB]" />
                  </div>

                  <Button type="submit" className="w-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-full h-11">
                    <LogIn className="size-4 mr-1.5" />
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLoggedIn(true)}
                    className="w-full rounded-full h-11 border-[#C9A961]/40 hover:bg-[#C9A961]/10"
                  >
                    <svg className="size-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Continue with Google
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    {mode === "login" ? "Don't have an account? " : "Already a client? "}
                    <button
                      type="button"
                      onClick={() => setMode(mode === "login" ? "register" : "login")}
                      className="text-[#A68A3F] font-medium hover:underline"
                    >
                      {mode === "login" ? "Register" : "Sign in"}
                    </button>
                  </p>
                </form>
              </div>
            ) : (
              <div className="p-6 lg:p-8">
                <Tabs defaultValue="saved" className="w-full">
                  <TabsList className="w-full justify-start bg-[#F9FAFB] h-auto p-1.5 rounded-xl gap-1 overflow-x-auto no-scrollbar mb-6">
                    <TabsTrigger value="saved" className="rounded-lg data-[state=active]:bg-white text-xs gap-1.5 whitespace-nowrap">
                      <Heart className="size-3.5" /> Saved ({saved.length})
                    </TabsTrigger>
                    <TabsTrigger value="searches" className="rounded-lg data-[state=active]:bg-white text-xs gap-1.5 whitespace-nowrap">
                      <Search className="size-3.5" /> Searches (3)
                    </TabsTrigger>
                    <TabsTrigger value="viewings" className="rounded-lg data-[state=active]:bg-white text-xs gap-1.5 whitespace-nowrap">
                      <Calendar className="size-3.5" /> Viewings (2)
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="rounded-lg data-[state=active]:bg-white text-xs gap-1.5 whitespace-nowrap">
                      <MessageSquare className="size-3.5" /> Messages
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white text-xs gap-1.5 whitespace-nowrap">
                      <Bell className="size-3.5" /> Alerts (4)
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-white text-xs gap-1.5 whitespace-nowrap">
                      <FileText className="size-3.5" /> Documents
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white text-xs gap-1.5 whitespace-nowrap">
                      <UserIcon className="size-3.5" /> Profile
                    </TabsTrigger>
                  </TabsList>

                  {/* Saved properties */}
                  <TabsContent value="saved">
                    {saved.length === 0 ? (
                      <EmptyState
                        icon={<Heart className="size-8" />}
                        title="No saved properties yet"
                        desc="Tap the heart icon on any listing to save it here for later."
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {saved.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setDashboardOpen(false);
                              setTimeout(() => openProperty(p.id), 100);
                            }}
                            className="group cursor-pointer bg-[#F9FAFB] rounded-2xl overflow-hidden border border-border/60 hover:border-[#C9A961] transition-all"
                          >
                            <div className="aspect-[4/3] overflow-hidden">
                              <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover zoom-img" />
                            </div>
                            <div className="p-4">
                              <h4 className="font-serif text-sm font-medium text-[#0A1F44] line-clamp-1">{p.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{p.community}</p>
                              <p className="font-serif text-base font-semibold text-[#0A1F44] mt-2">
                                AED {(p.price / 1000000).toFixed(2)}M
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Saved searches */}
                  <TabsContent value="searches">
                    <div className="space-y-3">
                      {[
                        { name: "Palm Jumeirah · Villas 5+ beds", alerts: 12, last: "2h ago" },
                        { name: "Downtown · Penthouses AED 10M+", alerts: 4, last: "1d ago" },
                        { name: "Dubai Hills · Townhouses", alerts: 8, last: "3d ago" },
                      ].map((s) => (
                        <div key={s.name} className="p-4 rounded-2xl bg-[#F9FAFB] border border-border/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-white flex items-center justify-center">
                              <Search className="size-4 text-[#A68A3F]" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#0A1F44]">{s.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{s.alerts} new matches · last alert {s.last}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-[#A68A3F] text-xs">View matches</Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Viewings */}
                  <TabsContent value="viewings">
                    <div className="space-y-3">
                      {[
                        { prop: properties[0], date: "Sat 6 Jul, 14:00", agent: agents[0], status: "Confirmed" },
                        { prop: properties[5], date: "Mon 8 Jul, 11:30", agent: agents[4], status: "Pending" },
                      ].map((v, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-[#F9FAFB] border border-border/60 flex items-center gap-4">
                          <img src={v.prop.images[0]} alt="" className="size-16 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#0A1F44] truncate">{v.prop.title}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              <Clock className="size-3" /> {v.date}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              With {v.agent.name} · {v.agent.title}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-medium ${
                            v.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {v.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Messages */}
                  <TabsContent value="messages">
                    <div className="space-y-3">
                      {agents.slice(0, 3).map((a) => (
                        <div key={a.id} className="p-4 rounded-2xl bg-[#F9FAFB] border border-border/60 flex items-center gap-3 hover:border-[#C9A961] transition-colors cursor-pointer">
                          <img src={a.photo} alt="" className="size-12 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-[#0A1F44]">{a.name}</div>
                              <span className="text-[10px] text-muted-foreground">2h ago</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              Thank you for your enquiry — I have prepared a shortlist of properties matching your requirements for review...
                            </p>
                          </div>
                          <span className="size-2 rounded-full bg-[#C9A961]" />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Notifications */}
                  <TabsContent value="notifications">
                    <div className="space-y-3">
                      {[
                        { icon: <TrendingUp className="size-4" />, title: "New listing matches your search", body: "Palm Jumeirah · 5+ beds · AED 18.5M", time: "2h ago" },
                        { icon: <Eye className="size-4" />, title: "Price reduction on saved property", body: "Sky Residence at Address Sky View — now AED 13.2M", time: "5h ago" },
                        { icon: <Bell className="size-4" />, title: "Viewing reminder", body: "Tomorrow 14:00 — Palm Signature Villa with Alexander", time: "1d ago" },
                        { icon: <FileText className="size-4" />, title: "New document shared", body: "Valuation report for Palm Jumeirah villa", time: "2d ago" },
                      ].map((n, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-[#F9FAFB] border border-border/60 flex items-start gap-3">
                          <div className="size-9 rounded-lg bg-white flex items-center justify-center text-[#A68A3F] flex-shrink-0">
                            {n.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-[#0A1F44]">{n.title}</div>
                              <span className="text-[10px] text-muted-foreground">{n.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Documents */}
                  <TabsContent value="documents">
                    <EmptyState
                      icon={<FileText className="size-8" />}
                      title="Document vault"
                      desc="Your agreements, valuations and title-deed copies will appear here — secured by ISO 27001."
                    />
                  </TabsContent>

                  {/* Profile */}
                  <TabsContent value="profile">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs tracking-luxury uppercase text-[#A68A3F] mb-2 block">Full Name</Label>
                          <Input defaultValue="John Smith" className="h-10 bg-[#F9FAFB]" />
                        </div>
                        <div>
                          <Label className="text-xs tracking-luxury uppercase text-[#A68A3F] mb-2 block">Email</Label>
                          <Input type="email" defaultValue="john@example.com" className="h-10 bg-[#F9FAFB]" />
                        </div>
                        <div>
                          <Label className="text-xs tracking-luxury uppercase text-[#A68A3F] mb-2 block">Phone</Label>
                          <Input defaultValue="+971 50 123 4567" className="h-10 bg-[#F9FAFB]" />
                        </div>
                        <div>
                          <Label className="text-xs tracking-luxury uppercase text-[#A68A3F] mb-2 block">Preferred Language</Label>
                          <Input defaultValue="English" className="h-10 bg-[#F9FAFB]" />
                        </div>
                        <Button className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-full">
                          Save Changes
                        </Button>
                      </div>
                      <div className="bg-[#F9FAFB] rounded-2xl p-6">
                        <h4 className="text-xs tracking-luxury uppercase text-[#A68A3F] font-semibold mb-3">Account Summary</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between pb-2 border-b border-border">
                            <span className="text-muted-foreground">Member since</span>
                            <span className="text-[#0A1F44] font-medium">Jul 2024</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-border">
                            <span className="text-muted-foreground">Saved properties</span>
                            <span className="text-[#0A1F44] font-medium">{saved.length}</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-border">
                            <span className="text-muted-foreground">Viewings attended</span>
                            <span className="text-[#0A1F44] font-medium">3</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Active searches</span>
                            <span className="text-[#0A1F44] font-medium">3</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center py-16">
      <div className="size-16 rounded-full bg-[#F9FAFB] flex items-center justify-center mx-auto mb-4 text-[#A68A3F]">
        {icon}
      </div>
      <h3 className="font-serif text-lg text-[#0A1F44] mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{desc}</p>
    </div>
  );
}
