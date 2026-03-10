import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Edit2, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ProfilePage() {
  const { user, updateProfile } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });

  const handleSave = async () => {
    await updateProfile(form);
    setModalOpen(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" className="ml-auto" onClick={() => { setForm({ name: user.name, email: user.email }); setModalOpen(true); }}>
            <Edit2 className="h-4 w-4 mr-2" />Edit
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-card-foreground">Points</span>
            </div>
            <p className="text-2xl font-bold text-primary">{user.points.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-card-foreground">Achievements</span>
            </div>
            <p className="text-2xl font-bold text-primary">{user.achievements.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Achievements</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {user.achievements.map(a => (
            <div key={a} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-accent" />
              </div>
              <span className="text-sm font-medium text-card-foreground">{a}</span>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
