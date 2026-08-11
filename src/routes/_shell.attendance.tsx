import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TableEmptyRow, TableLoadingRows } from "@/components/common/TableStates";
import { TablePagination } from "@/components/common/TablePagination";
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
import { Progress } from "@/components/ui/progress";
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
import { attendanceService } from "@/services/attendanceService";
import { studentService } from "@/services/studentService";
import { attendancePercent } from "@/services/types";
import type { Attendance } from "@/services/types";

const SUBJECTS = [
  "Data Structures",
  "DBMS",
  "Operating Systems",
  "Mathematics III",
  "Computer Networks",
  "Software Engineering",
];
const PAGE_SIZE = 10;

export const Route = createFileRoute("/_shell/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance Management — CampusOne SMS" },
      {
        name: "description",
        content:
          "Track classes attended per subject and monitor attendance percentage for every student.",
      },
      { property: "og:title", content: "Attendance Management — CampusOne SMS" },
      {
        property: "og:description",
        content: "Subject-wise attendance tracking with live percentage calculation.",
      },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const qc = useQueryClient();
  const attendance = useQuery({ queryKey: ["attendance"], queryFn: attendanceService.list });
  const students = useQuery({ queryKey: ["students"], queryFn: studentService.list });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Attendance | null>(null);
  const [form, setForm] = useState({ studentId: "", subject: "", total: "", attended: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const nameOf = (studentId: string) =>
    (students.data ?? []).find((s) => s.studentId === studentId)?.name ?? studentId;

  const save = useMutation({
    mutationFn: () =>
      attendanceService.create({
        studentId: form.studentId,
        subject: form.subject,
        totalClasses: Number(form.total),
        attendedClasses: Number(form.attended),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance recorded successfully");
      setOpen(false);
    },
    onError: () => toast.error("Could not record attendance"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => attendanceService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance entry deleted");
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (attendance.data ?? []).filter(
      (a) =>
        q === "" ||
        a.studentId.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q) ||
        nameOf(a.studentId).toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendance.data, students.data, search]);

  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const total = Number(form.total);
    const attended = Number(form.attended);
    if (!form.studentId) next["studentId"] = "Select a student";
    if (!form.subject) next["subject"] = "Select a subject";
    if (!total || total <= 0) next["total"] = "Total classes must be greater than 0";
    if (Number.isNaN(attended) || attended < 0) next["attended"] = "Enter attended classes";
    else if (attended > total) next["attended"] = "Attended cannot exceed total classes";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  };

  const preview = attendancePercent({
    totalClasses: Number(form.total) || 0,
    attendedClasses: Number(form.attended) || 0,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Subject-wise attendance with live percentages."
        actions={
          <Button
            onClick={() => {
              setForm({ studentId: "", subject: "", total: "", attended: "" });
              setErrors({});
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Record attendance
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden p-0 shadow-card">
        <div className="border-b p-4">
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student or subject"
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead className="hidden sm:table-cell">Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Attended</TableHead>
                <TableHead className="w-48">Percentage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.isLoading ? (
                <TableLoadingRows rows={8} cols={7} />
              ) : rows.length === 0 ? (
                <TableEmptyRow colSpan={7} message="No attendance records found." />
              ) : (
                rows.map((a) => {
                  const pct = attendancePercent(a);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.studentId}</TableCell>
                      <TableCell className="hidden max-w-40 truncate sm:table-cell">
                        {nameOf(a.studentId)}
                      </TableCell>
                      <TableCell className="max-w-40 truncate">{a.subject}</TableCell>
                      <TableCell>{a.totalClasses}</TableCell>
                      <TableCell>{a.attendedClasses}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="w-24" />
                          <Badge variant={pct >= 75 ? "default" : "destructive"}>{pct}%</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete attendance entry"
                            onClick={() => setToDelete(a)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record attendance</DialogTitle>
            <DialogDescription>Percentage is calculated automatically.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label>Student</Label>
              <Select
                value={form.studentId}
                onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {(students.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.studentId}>
                      {s.studentId} — {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors["studentId"] ? (
                <p className="text-xs text-destructive">{errors["studentId"]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select
                value={form.subject}
                onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors["subject"] ? (
                <p className="text-xs text-destructive">{errors["subject"]}</p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="total">Total classes</Label>
                <Input
                  id="total"
                  inputMode="numeric"
                  value={form.total}
                  onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
                />
                {errors["total"] ? (
                  <p className="text-xs text-destructive">{errors["total"]}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="attended">Attended classes</Label>
                <Input
                  id="attended"
                  inputMode="numeric"
                  value={form.attended}
                  onChange={(e) => setForm((f) => ({ ...f, attended: e.target.value }))}
                />
                {errors["attended"] ? (
                  <p className="text-xs text-destructive">{errors["attended"]}</p>
                ) : null}
              </div>
            </div>
            <div className="rounded-xl border bg-muted/50 p-3 text-sm">
              Attendance percentage: <strong>{preview}%</strong>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save attendance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this attendance entry?"
        description={`${toDelete?.subject} for ${toDelete?.studentId} will be removed.`}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
