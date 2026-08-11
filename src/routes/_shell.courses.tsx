import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TableEmptyRow, TableLoadingRows } from "@/components/common/TableStates";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { courseService } from "@/services/courseService";
import { departmentService } from "@/services/departmentService";
import { studentService } from "@/services/studentService";
import type { Course } from "@/services/types";

export const Route = createFileRoute("/_shell/courses")({
  head: () => ({
    meta: [
      { title: "Course Management — CampusOne SMS" },
      {
        name: "description",
        content: "Create, update and remove academic courses with duration and owning department.",
      },
      { property: "og:title", content: "Course Management — CampusOne SMS" },
      {
        property: "og:description",
        content: "Full course catalogue management for the campus.",
      },
    ],
  }),
  component: CoursesPage,
});

const emptyCourse: Omit<Course, "id"> = {
  courseId: "",
  name: "",
  duration: "4 Years",
  department: "",
};

function CoursesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["courses"], queryFn: courseService.list });
  const departments = useQuery({ queryKey: ["departments"], queryFn: departmentService.list });
  const students = useQuery({ queryKey: ["students"], queryFn: studentService.list });

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyCourse);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Course | null>(null);

  const save = useMutation({
    mutationFn: (payload: Omit<Course, "id">) =>
      editing ? courseService.update(editing.id, payload) : courseService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success(editing ? "Course updated successfully" : "Course added successfully");
      setOpen(false);
    },
    onError: () => toast.error("Could not save the course"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => courseService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter(
      (c) => q === "" || [c.name, c.courseId, c.department].some((v) => v.toLowerCase().includes(q)),
    );
  }, [data, search]);

  const openForm = (course: Course | null) => {
    setEditing(course);
    setForm(course ? { ...course } : { ...emptyCourse, courseId: `C-${100 + (data?.length ?? 0)}` });
    setErrors({});
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.courseId.trim()) next["courseId"] = "Course ID is required";
    if (form.name.trim().length < 3) next["name"] = "Enter the course name";
    if (!form.duration.trim()) next["duration"] = "Duration is required";
    if (!form.department) next["department"] = "Select a department";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate(form);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        description="Maintain the academic course catalogue."
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus className="size-4" /> Add course
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden p-0 shadow-card">
        <div className="border-b p-4">
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses"
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course ID</TableHead>
                <TableHead>Course name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="hidden sm:table-cell">Enrolled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows rows={5} cols={6} />
              ) : filtered.length === 0 ? (
                <TableEmptyRow colSpan={6} message="No courses found." />
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.courseId}</TableCell>
                    <TableCell className="max-w-64 truncate">{c.name}</TableCell>
                    <TableCell>{c.duration}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.department}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {(students.data ?? []).filter((s) => s.course === c.name).length}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit course"
                          onClick={() => openForm(c)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete course"
                          onClick={() => setToDelete(c)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit course" : "Add new course"}</DialogTitle>
            <DialogDescription>Courses belong to exactly one department.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="courseId">Course ID</Label>
              <Input
                id="courseId"
                value={form.courseId}
                onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
              />
              {errors["courseId"] ? (
                <p className="text-xs text-destructive">{errors["courseId"]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="courseName">Course name</Label>
              <Input
                id="courseName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {errors["name"] ? (
                <p className="text-xs text-destructive">{errors["name"]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                placeholder="e.g. 4 Years"
              />
              {errors["duration"] ? (
                <p className="text-xs text-destructive">{errors["duration"]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {(departments.data ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.code}>
                      {d.code} — {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors["department"] ? (
                <p className="text-xs text-destructive">{errors["department"]}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Add course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete ${toDelete?.name}?`}
        description="Students linked to this course will keep their existing record."
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
