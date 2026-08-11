import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TableEmptyRow, TableLoadingRows } from "@/components/common/TableStates";
import { TablePagination } from "@/components/common/TablePagination";
import { StudentFormDialog } from "@/components/students/StudentFormDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { Student } from "@/services/types";

const PAGE_SIZE = 8;

export const Route = createFileRoute("/_shell/students/")({
  head: () => ({
    meta: [
      { title: "Student Management — CampusOne SMS" },
      {
        name: "description",
        content:
          "Add, edit, search, filter and delete student records with department and course filters.",
      },
      { property: "og:title", content: "Student Management — CampusOne SMS" },
      {
        property: "og:description",
        content: "Complete student directory with CRUD, search, filters and pagination.",
      },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["students"], queryFn: studentService.list });
  const departments = useQuery({ queryKey: ["departments"], queryFn: departmentService.list });
  const courses = useQuery({ queryKey: ["courses"], queryFn: courseService.list });

  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [course, setCourse] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [toDelete, setToDelete] = useState<Student | null>(null);

  const remove = useMutation({
    mutationFn: (studentId: string) => studentService.remove(studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully");
    },
    onError: () => toast.error("Could not delete the student"),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter(
      (s) =>
        (dept === "all" || s.department === dept) &&
        (course === "all" || s.course === course) &&
        (q === "" ||
          [s.name, s.studentId, s.email, s.phone].some((v) => v.toLowerCase().includes(q))),
    );
  }, [data, search, dept, course]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        description="Search, filter and maintain every student record."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" /> Add student
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden p-0 shadow-card">
        <div className="grid gap-3 border-b p-4 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative min-w-0">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, ID, email or phone"
              className="pl-9"
            />
          </div>
          <Select
            value={dept}
            onValueChange={(v) => {
              setDept(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="md:w-52">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {(departments.data ?? []).map((d) => (
                <SelectItem key={d.id} value={d.code}>
                  {d.code} — {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={course}
            onValueChange={(v) => {
              setCourse(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="md:w-56">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {(courses.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="hidden xl:table-cell">Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows rows={8} cols={8} />
              ) : pageRows.length === 0 ? (
                <TableEmptyRow colSpan={8} message="No students match your search or filters." />
              ) : (
                pageRows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.studentId}</TableCell>
                    <TableCell className="max-w-40 truncate">{s.name}</TableCell>
                    <TableCell className="hidden max-w-52 truncate md:table-cell">
                      {s.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{s.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.department}</Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-48 truncate xl:table-cell">
                      {s.course}
                    </TableCell>
                    <TableCell>Year {s.year}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" aria-label="View student">
                          <Link to="/students/$studentId" params={{ studentId: s.studentId }}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit student"
                          onClick={() => {
                            setEditing(s);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete student"
                          onClick={() => setToDelete(s)}
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

        <TablePagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      </Card>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="size-3.5" /> {filtered.length} record(s) after filters
      </p>

      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editing}
        departments={departments.data ?? []}
        courses={courses.data ?? []}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete ${toDelete?.name}?`}
        description="This will permanently remove the student record from the system."
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.studentId);
          setToDelete(null);
        }}
      />
    </div>
  );
}
