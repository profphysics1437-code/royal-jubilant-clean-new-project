"use client";

import { useEffect, useState, useRef } from "react";
import { Save, Loader2, Upload, User as UserIcon, Mail, Phone, Globe, Lock, Check } from "lucide-react";
import { AdminPageHeader, AdminCard } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  preferredLang: string | null;
  createdAt: string;
}

export function ProfilePage({ portal }: { portal: "admin" | "agent" }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [preferredLang, setPreferredLang] = useState("en");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/auth/profile").then((r) => r.json()).then((d) => {
      if (d.user) {
        setUser(d.user);
        setName(d.user.name || "");
        setPhone(d.user.phone || "");
        setAvatarUrl(d.user.avatarUrl || "");
        setPreferredLang(d.user.preferredLang || "en");
      }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "avatars");
      // Pick endpoint by portal — agents can't pass requireAdmin() on
      // /api/admin/upload, so they POST to /api/agent/upload instead.
      const endpoint =
        portal === "agent" ? "/api/agent/upload" : "/api/admin/upload";
      const res = await fetch(endpoint, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      const url = data.files[0].url;
      setAvatarUrl(url);
      // Save immediately
      await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      });
      toast.success("Profile photo updated");
      load();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingPhoto(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, preferredLang }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toast.success("Profile updated");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-8 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="My Profile"
        subtitle={`Manage your ${portal === "admin" ? "admin" : "agent"} account — update your photo, contact info, and password.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Profile photo + info */}
        <div className="space-y-6">
          {/* Profile photo */}
          <AdminCard className="p-6">
            <h2 className="font-serif text-lg font-medium text-[#0A1F44] mb-4">Profile Photo</h2>
            <div className="flex items-center gap-4">
              <div className="size-24 rounded-full overflow-hidden bg-royal-gradient-diagonal flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  (user.name || user.email).charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="rounded-full"
                >
                  {uploadingPhoto ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Upload className="size-4 mr-1.5" />}
                  {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      setAvatarUrl("");
                      await fetch("/api/auth/profile", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ avatarUrl: null }),
                      });
                      toast.success("Photo removed");
                      load();
                    }}
                    className="text-red-600 ml-2"
                  >
                    Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG, or WEBP · Max 8MB</p>
              </div>
            </div>
          </AdminCard>

          {/* Personal info */}
          <AdminCard className="p-6">
            <h2 className="font-serif text-lg font-medium text-[#0A1F44] mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <Label><UserIcon className="size-3 inline mr-1" /> Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-[#F9FAFB]" placeholder="Your name" />
              </div>
              <div>
                <Label><Mail className="size-3 inline mr-1" /> Email (cannot change)</Label>
                <Input value={user.email} disabled className="bg-muted text-muted-foreground" />
              </div>
              <div>
                <Label><Phone className="size-3 inline mr-1" /> Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-[#F9FAFB]" placeholder="+971 50 123 4567" />
              </div>
              <div>
                <Label><Globe className="size-3 inline mr-1" /> Preferred Language</Label>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-[#F9FAFB] px-3 text-sm"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="ur">Urdu</option>
                  <option value="hi">Hindi</option>
                  <option value="fa">Farsi</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                <span>Role:</span>
                <span className={`px-2 py-0.5 rounded-full font-medium ${user.role === "admin" ? "bg-[#C9A961]/15 text-[#A68A3F]" : "bg-blue-100 text-blue-700"}`}>
                  {user.role}
                </span>
                <span className="ml-auto">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 rounded-full w-full">
                {saving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                Save Changes
              </Button>
            </div>
          </AdminCard>
        </div>

        {/* Right: Change password */}
        <div>
          <AdminCard className="p-6">
            <h2 className="font-serif text-lg font-medium text-[#0A1F44] mb-2">Change Password</h2>
            <p className="text-xs text-muted-foreground mb-4">Update your password regularly to keep your account secure.</p>
            <div className="space-y-4">
              <div>
                <Label><Lock className="size-3 inline mr-1" /> Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-[#F9FAFB]"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label><Lock className="size-3 inline mr-1" /> New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#F9FAFB]"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <Label><Check className="size-3 inline mr-1" /> Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#F9FAFB]"
                  placeholder="Re-enter new password"
                />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
              <Button onClick={handleChangePassword} disabled={saving} className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 rounded-full w-full">
                {saving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Lock className="size-4 mr-1.5" />}
                Change Password
              </Button>
            </div>
          </AdminCard>

          {/* Security tips */}
          <AdminCard className="p-6 mt-6">
            <h3 className="font-serif text-base font-medium text-[#0A1F44] mb-3">Security Tips</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="size-3 text-green-600 mt-0.5 flex-shrink-0" /> Use at least 8 characters with a mix of letters, numbers, and symbols</li>
              <li className="flex items-start gap-2"><Check className="size-3 text-green-600 mt-0.5 flex-shrink-0" /> Don't reuse passwords from other accounts</li>
              <li className="flex items-start gap-2"><Check className="size-3 text-green-600 mt-0.5 flex-shrink-0" /> Change your password every 90 days</li>
              <li className="flex items-start gap-2"><Check className="size-3 text-green-600 mt-0.5 flex-shrink-0" /> Never share your password with anyone</li>
              <li className="flex items-start gap-2"><Check className="size-3 text-green-600 mt-0.5 flex-shrink-0" /> Sign out when using shared computers</li>
            </ul>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
