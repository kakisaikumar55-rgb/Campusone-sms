import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { courseService } from "@/services/courseService";
import { departmentService } from "@/services/departmentService";
import { studentService } from "@/services/studentService";
import type { Department } from "@/services/types";

export const Route = createFileRoute("/_shell/departments")({
  head: () => ({
    meta: [
      { title: "Department Management — CampusOne SMS" },
      {
        name: "description",
        content: "Manage academic departments, their heads, courses and enrolled student counts.",
      },
      { property: "og:title", content: "Department Management — CampusOne SMS" },
      {
        property: "og:description",
        content: "Create, edit and delete academic departments across the campus.",
      },
    ],
  }),
  component: DepartmentsPage,
});

const emptyDept: Omit<Department, "id"> = { code: "", name: "", head: "" };

function DepartmentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.list,
  });
  const students = useQuery({ queryKey: ["students"], queryFn: studentService.list });
  const courses = useQuery({ queryKey: ["courses"], queryFn: courseService.list });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState(emptyDept);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Department | null>(null);

  const save = useMutation({
    mutationFn: (payload: Omit<Department, "id">) =>
      editing ? departmentService.update(editing.id, payload) : departmentService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success(editing ? "Department updated" : "Department added");
      setOpen(false);
    },
    onError: () => toast.error("Could not save the department"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => departmentService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted successfully");
    },
  });

  const openForm = (dept: Department | null) => {
    setEditing(dept);
    setForm(dept ? { ...dept } : emptyDept);
    setErrors({});
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.code.trim()) next["code"] = "Department code is required";
    if (form.name.trim().length < 3) next["name"] = "Enter the department name";
    if (!form.head.trim()) next["head"] = "Head of department is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate(form);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        description="Academic units, their heads and enrolment."
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus className="size-4" /> Add department
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
          : (data ?? []).map((d) => (
              <Card key={d.id} className="bg-surface-gradient shadow-card">
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Building2 className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold">{d.code}</h3>
                      <p className="truncate text-xs text-muted-foreground">{d.name}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit department"
                        onClick={() => openForm(d)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete department"
                        onClick={() => setToDelete(d)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Head: <span className="font-medium text-foreground">{d.head}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                    <div>
                      <p className="font-display text-xl font-semibold">
                        {(students.data ?? []).filter((s) => s.department === d.code).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div>
                      <p className="font-display text-xl font-semibold">
                        {(courses.data ?? []).filter((c) => c.department === d.code).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit department" : "Add new department"}</DialogTitle>
            <DialogDescription>Use a short unique code such as CSE or ECE.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="code">Department code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
              {errors["code"] ? (
                <p className="text-xs text-destructive">{errors["code"]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deptName">Department name</Label>
              <Input
                id="deptName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {errors["name"] ? (
                <p className="text-xs text-destructive">{errors["name"]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="head">Head of department</Label>
              <Input
                id="head"
                value={form.head}
                onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))}
              />
              {errors["head"] ? (
                <p className="text-xs text-destructive">{errors["head"]}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Add department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete ${toDelete?.code}?`}
        description="This removes the department from the directory."
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
