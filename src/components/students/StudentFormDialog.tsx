import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { studentService } from "@/services/studentService";
import type { Course, Department, Student } from "@/services/types";

type FormState = Omit<Student, "id">;

const empty: FormState = {
  studentId: "",
  name: "",
  email: "",
  phone: "",
  gender: "Male",
  dob: "",
  address: "",
  department: "",
  course: "",
  year: 1,
  status: "Active",
};

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
  departments,
  courses,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  departments: Department[];
  courses: Course[];
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      student
        ? { ...student }
        : { ...empty, studentId: `STU${Math.floor(2000 + Math.random() * 8000)}` },
    );
  }, [open, student]);

  const save = useMutation({
    mutationFn: async (payload: FormState) =>
      student
        ? studentService.update(student.studentId, payload)
        : studentService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success(student ? "Student updated successfully" : "Student added successfully");
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.studentId.trim()) next["studentId"] = "Student ID is required";
    if (form.name.trim().length < 3) next["name"] = "Enter the full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next["email"] = "Enter a valid email";
    if (form.phone.replace(/\D/g, "").length < 10) next["phone"] = "Enter a valid phone number";
    if (!form.dob) next["dob"] = "Date of birth is required";
    if (!form.department) next["department"] = "Select a department";
    if (!form.course) next["course"] = "Select a course";
    if (!form.address.trim()) next["address"] = "Address is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate(form);
  };

  const err = (k: string) =>
    errors[k] ? <p className="text-xs text-destructive">{errors[k]}</p> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{student ? "Edit student" : "Add new student"}</DialogTitle>
          <DialogDescription>
            All fields are validated before the record is saved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              value={form.studentId}
              onChange={(e) => set("studentId", e.target.value)}
              disabled={Boolean(student)}
            />
            {err("studentId")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            {err("name")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            {err("email")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            {err("phone")}
          </div>
          <div className="space-y-1.5">
            <Label>Gender</Label>
            <Select
              value={form.gender}
              onValueChange={(v) => set("gender", v as Student["gender"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Male", "Female", "Other"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
            />
            {err("dob")}
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={form.department} onValueChange={(v) => set("department", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.code}>
                    {d.code} — {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err("department")}
          </div>
          <div className="space-y-1.5">
            <Label>Course</Label>
            <Select value={form.course} onValueChange={(v) => set("course", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err("course")}
          </div>
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Select
              value={String(form.year)}
              onValueChange={(v) => set("year", Number(v) as Student["year"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    Year {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as Student["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              rows={2}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
            {err("address")}
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {student ? "Save changes" : "Add student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
