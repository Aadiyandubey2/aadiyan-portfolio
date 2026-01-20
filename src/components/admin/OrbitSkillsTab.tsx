import { useState } from "react";
import { Plus, Trash2, Save, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { availableIcons } from "@/components/ui/orbiting-skills";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OrbitSkill {
  id: string;
  name: string;
  icon: string;
  color: string;
  orbit_index: number;
  display_order: number;
}

interface OrbitSkillsTabProps {
  orbitSkills: OrbitSkill[];
  setOrbitSkills: React.Dispatch<React.SetStateAction<OrbitSkill[]>>;
  secretCode: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadData: () => Promise<void>;
}

// Color presets for easy selection
const colorPresets = [
  { value: "#00d4ff", label: "Cyan" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ec4899", label: "Pink" },
  { value: "#61DAFB", label: "React Blue" },
  { value: "#339933", label: "Node Green" },
  { value: "#3178C6", label: "TypeScript Blue" },
  { value: "#3ECF8E", label: "Supabase Green" },
];

export default function OrbitSkillsTab({
  orbitSkills,
  setOrbitSkills,
  secretCode,
  isLoading,
  setIsLoading,
  loadData,
}: OrbitSkillsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const innerOrbitSkills = orbitSkills.filter((s) => s.orbit_index === 0);
  const outerOrbitSkills = orbitSkills.filter((s) => s.orbit_index === 1);

  const saveOrbitSkill = async (skill: OrbitSkill) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { action: "updateOrbitSkill", secretCode, data: skill },
      });
      if (error) throw error;
      toast.success("Orbit skill saved!");
      loadData();
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to save orbit skill");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrbitSkill = async (id: string) => {
    if (!confirm("Delete this orbit skill?")) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { action: "deleteOrbitSkill", secretCode, data: { id } },
      });
      if (error) throw error;
      toast.success("Orbit skill deleted!");
      loadData();
    } catch (error) {
      toast.error("Failed to delete orbit skill");
    } finally {
      setIsLoading(false);
    }
  };

  const addNewSkill = (orbitIndex: number) => {
    const newSkill: OrbitSkill = {
      id: `new-${Date.now()}`,
      name: "New Skill",
      icon: "sparkle",
      color: "#00d4ff",
      orbit_index: orbitIndex,
      display_order: orbitIndex === 0 ? innerOrbitSkills.length : outerOrbitSkills.length,
    };
    setOrbitSkills([...orbitSkills, newSkill]);
    setEditingId(newSkill.id);
  };

  const updateSkill = (id: string, updates: Partial<OrbitSkill>) => {
    setOrbitSkills(orbitSkills.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const renderSkillCard = (skill: OrbitSkill) => {
    const isEditing = editingId === skill.id;
    const isNew = skill.id.startsWith("new-");

    return (
      <div
        key={skill.id}
        className="glass-card rounded-xl p-4 space-y-3 border"
        style={{ borderColor: `${skill.color}30` }}
      >
        <div className="flex items-center justify-between">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${skill.color}20`, border: `1px solid ${skill.color}40` }}
          >
            <span className="text-xs font-mono" style={{ color: skill.color }}>
              {skill.icon.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <Button
                size="sm"
                onClick={() => saveOrbitSkill(skill)}
                disabled={isLoading}
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingId(skill.id)}
              >
                Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => (isNew ? setOrbitSkills(orbitSkills.filter((s) => s.id !== skill.id)) : deleteOrbitSkill(skill.id))}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <Input
                value={skill.name}
                onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                placeholder="Skill name"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Icon</label>
              <Select value={skill.icon} onValueChange={(value) => updateSkill(skill.id, { icon: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Color</label>
              <div className="flex gap-2">
                <Select value={skill.color} onValueChange={(value) => updateSkill(skill.id, { color: value })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorPresets.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="color"
                  value={skill.color}
                  onChange={(e) => updateSkill(skill.id, { color: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Display Order</label>
              <Input
                type="number"
                value={skill.display_order}
                onChange={(e) => updateSkill(skill.id, { display_order: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
          </div>
        ) : (
          <div>
            <p className="font-medium" style={{ color: skill.color }}>
              {skill.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Icon: {availableIcons.find((i) => i.value === skill.icon)?.label || skill.icon}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Orbit className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-bold">Skills Visualization</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Customize the orbiting skills visualization that appears on the Skills page. 
          Add skills to inner or outer orbits and set their icons and colors.
        </p>

        {/* Inner Orbit */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-cyan-400">Inner Orbit</h3>
              <p className="text-xs text-muted-foreground">Skills that orbit closer to center (faster rotation)</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => addNewSkill(0)}>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {innerOrbitSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                No skills in inner orbit. Click Add to create one.
              </p>
            ) : (
              innerOrbitSkills
                .sort((a, b) => a.display_order - b.display_order)
                .map(renderSkillCard)
            )}
          </div>
        </div>

        {/* Outer Orbit */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-purple-400">Outer Orbit</h3>
              <p className="text-xs text-muted-foreground">Skills that orbit further from center (slower rotation)</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => addNewSkill(1)}>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outerOrbitSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                No skills in outer orbit. Click Add to create one.
              </p>
            ) : (
              outerOrbitSkills
                .sort((a, b) => a.display_order - b.display_order)
                .map(renderSkillCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
