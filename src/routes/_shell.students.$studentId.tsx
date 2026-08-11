import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { StudentFormDialog } from "@/components/students/StudentFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { attendanceService } from "@/services/attendanceService";
import { courseService } from "@/services/courseService";
import { departmentService } from "@/services/departmentService";
import { markService } from "@/services/markService";
import { studentService } from "@/services/studentService";
import { attendancePercent, gradeOf, resultOf, totalMarks } from "@/services/types";

export const Route = createFileRoute("/_shell/students/$studentId")({
  head: () => ({
    meta: [
      { title: "Student Profile — CampusOne SMS" },
      {
        name: "description",
        content:
          "Full student profile with personal details, course, department, marks and attendance records.",
      },
      { property: "og:title", content: "Student Profile — CampusOne SMS" },
      {
        property: "og:description",
        content: "Personal details, academic performance and attendance for a single student.",
      },
    ],
  }),
  component: StudentProfilePage,
});

function StudentProfilePage() {
  const { studentId } = useParams({ from: "/_shell/students/$studentId" });
  const [editing, setEditing] = useState(false);

  const student = useQuery({
    queryKey: ["students", studentId],
    queryFn: () => studentService.get(studentId),
  });
  const marks = useQuery({
    queryKey: ["marks", studentId],
    queryFn: () => markService.listByStudent(studentId),
  });
  const attendance = useQuery({
    queryKey: ["attendance", studentId],
    queryFn: () => attendanceService.listByStudent(studentId),
  });
  const departments = useQuery({ queryKey: ["departments"], queryFn: departmentService.list });
  const courses = useQuery({ queryKey: ["courses"], queryFn: courseService.list });

  const s = student.data;
  const attRows = attendance.data ?? [];
  const avgAttendance = attRows.length
    ? Math.round((attRows.reduce((sum, a) => sum + attendancePercent(a), 0) / attRows.length) * 10) /
      10
    : 0;

  if (student.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!s) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-muted-foreground">This student record no longer exists.</p>
        <Button asChild className="mt-4 w-fit self-center">
          <Link to="/students">Back to students</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={s.name}
        description={`${s.studentId} • ${s.course}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/students">
                <ArrowLeft className="size-4" /> Back
              </Link>
            </Button>
            <Button onClick={() => setEditing(true)}>
              <Pencil className="size-4" /> Edit profile
            </Button>
          </>
        }
      />

      <Card className="bg-surface-gradient overflow-hidden p-0 shadow-card">
        <div className="bg-brand-gradient h-20" />
        <CardContent className="-mt-10 space-y-5 p-6">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4">
            <span className="grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-card bg-primary/10 font-display text-2xl font-semibold text-primary">
              {s.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{s.department}</Badge>
                <Badge variant="secondary">Year {s.year}</Badge>
                <Badge variant={s.status === "Active" ? "default" : "outline"}>{s.status}</Badge>
              </div>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Info icon={Mail} label="Email" value={s.email} />
            <Info icon={Phone} label="Phone" value={s.phone} />
            <Info icon={UserRound} label="Gender" value={s.gender} />
            <Info icon={CalendarDays} label="Date of birth" value={s.dob} />
            <Info icon={MapPin} label="Address" value={s.address} />
            <Info icon={UserRound} label="Course" value={s.course} />
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Marks</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Internal</TableHead>
                    <TableHead>External</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(marks.data ?? []).map((m) => {
                    const total = totalMarks(m);
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="max-w-36 truncate">{m.subject}</TableCell>
                        <TableCell>{m.internal}</TableCell>
                        <TableCell>{m.external}</TableCell>
                        <TableCell className="font-medium">{total}</TableCell>
                        <TableCell>{gradeOf(total)}</TableCell>
                        <TableCell>
                          <Badge variant={resultOf(total) === "Pass" ? "default" : "destructive"}>
                            {resultOf(total)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">Attendance</CardTitle>
            <Badge variant="secondary">{avgAttendance}% average</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {attRows.map((a) => (
              <div key={a.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">{a.subject}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {a.attendedClasses}/{a.totalClasses} • {attendancePercent(a)}%
                  </span>
                </div>
                <Progress value={attendancePercent(a)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <StudentFormDialog
        open={editing}
        onOpenChange={setEditing}
        student={s}
        departments={departments.data ?? []}
        courses={courses.data ?? []}
      />
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl border bg-card p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}
