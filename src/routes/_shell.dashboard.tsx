import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  Percent,
  Plus,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableLoadingRows } from "@/components/common/TableStates";
import { attendanceService } from "@/services/attendanceService";
import { courseService } from "@/services/courseService";
import { departmentService } from "@/services/departmentService";
import { studentService } from "@/services/studentService";
import { attendancePercent } from "@/services/types";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CampusOne SMS" },
      {
        name: "description",
        content:
          "Campus overview with total students, courses, departments, average attendance and recent admissions.",
      },
      { property: "og:title", content: "Admin Dashboard — CampusOne SMS" },
      {
        property: "og:description",
        content: "Live campus metrics: students, courses, departments and attendance.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const students = useQuery({ queryKey: ["students"], queryFn: studentService.list });
  const courses = useQuery({ queryKey: ["courses"], queryFn: courseService.list });
  const departments = useQuery({ queryKey: ["departments"], queryFn: departmentService.list });
  const attendance = useQuery({ queryKey: ["attendance"], queryFn: attendanceService.list });

  const rows = attendance.data ?? [];
  const avgAttendance = rows.length
    ? Math.round((rows.reduce((sum, a) => sum + attendancePercent(a), 0) / rows.length) * 10) / 10
    : 0;

  const byDepartment = (departments.data ?? []).map((d) => ({
    ...d,
    count: (students.data ?? []).filter((s) => s.department === d.code).length,
  }));
  const maxCount = Math.max(1, ...byDepartment.map((d) => d.count));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="A live snapshot of campus operations."
        actions={
          <>
            <Button asChild>
              <Link to="/students">
                <Plus className="size-4" /> Add student
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/courses">
                <BookOpen className="size-4" /> Add course
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/marks">
                <ClipboardList className="size-4" /> Enter marks
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/attendance">
                <CalendarCheck className="size-4" /> Mark attendance
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total students"
          value={students.data?.length ?? 0}
          hint={`${(students.data ?? []).filter((s) => s.status === "Active").length} active`}
          icon={Users}
          loading={students.isLoading}
        />
        <StatCard
          label="Total courses"
          value={courses.data?.length ?? 0}
          hint="Across all departments"
          icon={BookOpen}
          tone="accent"
          loading={courses.isLoading}
        />
        <StatCard
          label="Departments"
          value={departments.data?.length ?? 0}
          hint="Academic units"
          icon={Building2}
          tone="success"
          loading={departments.isLoading}
        />
        <StatCard
          label="Avg. attendance"
          value={`${avgAttendance}%`}
          hint="Current semester"
          icon={Percent}
          tone="warning"
          loading={attendance.isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">Recent students</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/students">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.isLoading ? (
                    <TableLoadingRows rows={5} cols={5} />
                  ) : (
                    (students.data ?? []).slice(0, 6).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.studentId}</TableCell>
                        <TableCell>
                          <Link
                            to="/students/$studentId"
                            params={{ studentId: s.studentId }}
                            className="hover:text-primary hover:underline"
                          >
                            {s.name}
                          </Link>
                        </TableCell>
                        <TableCell>{s.department}</TableCell>
                        <TableCell>Year {s.year}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "Active" ? "default" : "secondary"}>
                            {s.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students by department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {byDepartment.map((d) => (
              <div key={d.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium">{d.code}</span>
                  <span className="shrink-0 text-muted-foreground">{d.count}</span>
                </div>
                <Progress value={(d.count / maxCount) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
