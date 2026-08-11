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
import { markService } from "@/services/markService";
import { studentService } from "@/services/studentService";
import { gradeOf, resultOf, totalMarks } from "@/services/types";
import type { Mark } from "@/services/types";

const SUBJECTS = [
  "Data Structures",
  "DBMS",
  "Operating Systems",
  "Mathematics III",
  "Computer Networks",
  "Software Engineering",
];
const PAGE_SIZE = 10;

export const Route = createFileRoute("/_shell/marks")({
  head: () => ({
    meta: [
      { title: "Marks Management — CampusOne SMS" },
      {
        name: "description",
        content:
          "Record internal and external marks per subject with automatic totals, grades and pass/fail results.",
      },
      { property: "og:title", content: "Marks Management — CampusOne SMS" },
      {
        property: "og:description",
        content: "Internal + external marks with auto-calculated grade and result.",
      },
    ],
  }),
  component: MarksPage,
});

function MarksPage() {
  const qc = useQueryClient();
  const marks = useQuery({ queryKey: ["marks"], queryFn: markService.list });
  const students = useQuery({ queryKey: ["students"], queryFn: studentService.list });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Mark | null>(null);
  const [form, setForm] = useState({ studentId: "", subject: "", internal: "", external: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const nameOf = (studentId: string) =>
    (students.data ?? []).find((s) => s.studentId === studentId)?.name ?? studentId;

  const save = useMutation({
    mutationFn: () =>
      markService.create({
        studentId: form.studentId,
        subject: form.subject,
        internal: Number(form.internal),
        external: Number(form.external),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marks"] });
      toast.success("Marks saved successfully");
      setOpen(false);
    },
    onError: () => toast.error("Could not save marks"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => markService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marks"] });
      toast.success("Marks entry deleted");
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (marks.data ?? []).filter(
      (m) =>
        q === "" ||
        m.studentId.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        nameOf(m.studentId).toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marks.data, students.data, search]);

  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.studentId) next["studentId"] = "Select a student";
    if (!form.subject) next["subject"] = "Select a subject";
    const internal = Number(form.internal);
    const external = Number(form.external);
    if (Number.isNaN(internal) || internal < 0 || internal > 30)
      next["internal"] = "Internal marks must be 0–30";
    if (Number.isNaN(external) || external < 0 || external > 70)
      next["external"] = "External marks must be 0–70";
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  };

  const previewTotal = (Number(form.internal) || 0) + (Number(form.external) || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks Management"
        description="Internal and external marks with automatic grading."
        actions={
          <Button
            onClick={() => {
              setForm({ studentId: "", subject: "", internal: "", external: "" });
              setErrors({});
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Add marks
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
                <TableHead>Internal</TableHead>
                <TableHead>External</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marks.isLoading ? (
                <TableLoadingRows rows={8} cols={9} />
              ) : rows.length === 0 ? (
                <TableEmptyRow colSpan={9} message="No marks recorded yet." />
              ) : (
                rows.map((m) => {
                  const total = totalMarks(m);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.studentId}</TableCell>
                      <TableCell className="hidden max-w-40 truncate sm:table-cell">
                        {nameOf(m.studentId)}
                      </TableCell>
                      <TableCell className="max-w-40 truncate">{m.subject}</TableCell>
                      <TableCell>{m.internal}</TableCell>
                      <TableCell>{m.external}</TableCell>
                      <TableCell className="font-medium">{total}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{gradeOf(total)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={resultOf(total) === "Pass" ? "default" : "destructive"}>
                          {resultOf(total)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete marks entry"
                            onClick={() => setToDelete(m)}
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
            <DialogTitle>Add marks</DialogTitle>
            <DialogDescription>
              Total, grade and result are calculated automatically.
            </DialogDescription>
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
                <Label htmlFor="internal">Internal marks (0–30)</Label>
                <Input
                  id="internal"
                  inputMode="numeric"
                  value={form.internal}
                  onChange={(e) => setForm((f) => ({ ...f, internal: e.target.value }))}
                />
                {errors["internal"] ? (
                  <p className="text-xs text-destructive">{errors["internal"]}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external">External marks (0–70)</Label>
                <Input
                  id="external"
                  inputMode="numeric"
                  value={form.external}
                  onChange={(e) => setForm((f) => ({ ...f, external: e.target.value }))}
                />
                {errors["external"] ? (
                  <p className="text-xs text-destructive">{errors["external"]}</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/50 p-3 text-sm">
              <span>
                Total: <strong>{previewTotal}</strong>
              </span>
              <span>
                Grade: <strong>{gradeOf(previewTotal)}</strong>
              </span>
              <span>
                Result: <strong>{resultOf(previewTotal)}</strong>
              </span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save marks
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this marks entry?"
        description={`${toDelete?.subject} for ${toDelete?.studentId} will be removed.`}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
