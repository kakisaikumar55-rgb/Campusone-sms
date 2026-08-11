import type { Attendance, Course, Department, Mark, Student } from "./types";

export const departments: Department[] = [
  { id: 1, code: "CSE", name: "Computer Science & Engineering", head: "Dr. Anitha Rao" },
  { id: 2, code: "ECE", name: "Electronics & Communication", head: "Dr. Vivek Menon" },
  { id: 3, code: "MECH", name: "Mechanical Engineering", head: "Dr. Rajesh Iyer" },
  { id: 4, code: "IT", name: "Information Technology", head: "Dr. Priya Nair" },
  { id: 5, code: "MBA", name: "Business Administration", head: "Dr. Sameer Khan" },
];

export const courses: Course[] = [
  { id: 1, courseId: "C-101", name: "B.Tech Computer Science", duration: "4 Years", department: "CSE" },
  { id: 2, courseId: "C-102", name: "B.Tech Information Technology", duration: "4 Years", department: "IT" },
  { id: 3, courseId: "C-103", name: "B.Tech Electronics", duration: "4 Years", department: "ECE" },
  { id: 4, courseId: "C-104", name: "B.Tech Mechanical", duration: "4 Years", department: "MECH" },
  { id: 5, courseId: "C-105", name: "Master of Business Administration", duration: "2 Years", department: "MBA" },
  { id: 6, courseId: "C-106", name: "M.Tech Data Science", duration: "2 Years", department: "CSE" },
];

const names = [
  "Aarav Sharma", "Diya Patel", "Rohan Verma", "Isha Kulkarni", "Karthik Reddy",
  "Meera Joshi", "Aditya Nair", "Sneha Gupta", "Vikram Singh", "Ananya Rao",
  "Rahul Menon", "Pooja Desai", "Arjun Pillai", "Nisha Agarwal", "Siddharth Bose",
  "Kavya Krishnan", "Manish Tiwari", "Riya Chatterjee", "Harsh Vardhan", "Tanvi Shetty",
  "Nikhil Jain", "Shruti Mishra", "Aman Kapoor", "Lakshmi Iyer", "Deepak Chauhan",
  "Priyanka Ghosh", "Varun Malhotra", "Sanya Bhatt", "Yash Thakur", "Neha Saxena",
];

const genders: Student["gender"][] = ["Male", "Female", "Other"];

export const students: Student[] = names.map((name, i) => {
  const course = courses[i % courses.length]!;
  return {
    id: i + 1,
    studentId: `STU${String(1001 + i)}`,
    name,
    email: `${name.toLowerCase().split(" ").join(".")}@campus.edu`,
    phone: `+91 9${String(800000000 + i * 137911).slice(0, 9)}`,
    gender: genders[i % 2 === 0 ? 0 : 1] ?? "Male",
    dob: `${1999 + (i % 5)}-0${(i % 9) + 1}-1${i % 9}`,
    address: `${12 + i} MG Road, ${["Bengaluru", "Pune", "Hyderabad", "Chennai", "Mysuru"][i % 5]}, India`,
    department: course.department,
    course: course.name,
    year: ((i % 4) + 1) as Student["year"],
    status: i % 11 === 0 ? "Inactive" : "Active",
  };
});

const subjects = ["Data Structures", "DBMS", "Operating Systems", "Mathematics III", "Computer Networks"];

export const marks: Mark[] = students.flatMap((s, si) =>
  subjects.map((subject, i) => ({
    id: si * 10 + i + 1,
    studentId: s.studentId,
    subject,
    internal: 20 + ((si * 3 + i * 7) % 11),
    external: 38 + ((si * 5 + i * 11) % 33),
  })),
);

export const attendance: Attendance[] = students.flatMap((s, si) =>
  subjects.map((subject, i) => {
    const total = 60;
    return {
      id: si * 10 + i + 1,
      studentId: s.studentId,
      subject,
      totalClasses: total,
      attendedClasses: 38 + ((si * 7 + i * 5) % 22),
    };
  }),
);
