import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_shell/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — CampusOne SMS" },
      {
        name: "description",
        content: "View and update the signed-in administrator profile and account preferences.",
      },
      { property: "og:title", content: "My Profile — CampusOne SMS" },
      {
        property: "og:description",
        content: "Administrator account details for the CampusOne Student Management System.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 98450 11223");

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const initials =
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Your administrator account details." />

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="bg-surface-gradient overflow-hidden p-0 shadow-card">
          <div className="bg-brand-gradient h-24" />
          <CardContent className="-mt-12 space-y-3 p-6 text-center">
            <span className="mx-auto grid size-24 place-items-center rounded-2xl border-4 border-card bg-primary/10 font-display text-3xl font-semibold text-primary">
              {initials}
            </span>
            <div>
              <h2 className="truncate text-lg font-semibold capitalize">{name || "Administrator"}</h2>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
            <Badge className="mx-auto flex w-fit items-center gap-1">
              <ShieldCheck className="size-3.5" /> {user?.role ?? "Administrator"}
            </Badge>
            <Separator />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                logout();
                toast.success("You have been signed out");
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" /> Logout
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account information</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Profile updated successfully");
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="pname">Full name</Label>
                <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pemail">Email</Label>
                <Input id="pemail" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pphone">Phone</Label>
                <Input id="pphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prole">Role</Label>
                <Input id="prole" value={user?.role ?? "Administrator"} disabled />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">
                  <Save className="size-4" /> Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
