-- =============================================================
-- CampusOne Student Management System — MySQL schema
-- Works with the Spring Boot REST API (spring.jpa.hibernate.ddl-auto=validate)
-- =============================================================

CREATE DATABASE IF NOT EXISTS campusone
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campusone;

DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
  id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20)  NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  head VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE courses (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  course_id  VARCHAR(20)  NOT NULL UNIQUE,
  name       VARCHAR(150) NOT NULL,
  duration   VARCHAR(30)  NOT NULL,
  department VARCHAR(20)  NOT NULL,
  CONSTRAINT fk_course_dept FOREIGN KEY (department)
    REFERENCES departments(code) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE students (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20)  NOT NULL UNIQUE,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  phone      VARCHAR(25)  NOT NULL,
  gender     ENUM('Male','Female','Other') NOT NULL,
  dob        DATE         NOT NULL,
  address    VARCHAR(255) NOT NULL,
  department VARCHAR(20)  NOT NULL,
  course     VARCHAR(150) NOT NULL,
  year       TINYINT      NOT NULL CHECK (year BETWEEN 1 AND 4),
  status     ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_student_dept FOREIGN KEY (department)
    REFERENCES departments(code) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE marks (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20)  NOT NULL,
  subject    VARCHAR(100) NOT NULL,
  internal   INT NOT NULL CHECK (internal BETWEEN 0 AND 30),
  external   INT NOT NULL CHECK (external BETWEEN 0 AND 70),
  CONSTRAINT fk_marks_student FOREIGN KEY (student_id)
    REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_marks (student_id, subject)
) ENGINE=InnoDB;

CREATE TABLE attendance (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id        VARCHAR(20)  NOT NULL,
  subject           VARCHAR(100) NOT NULL,
  total_classes     INT NOT NULL,
  attended_classes  INT NOT NULL,
  CONSTRAINT fk_att_student FOREIGN KEY (student_id)
    REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_attendance (student_id, subject)
) ENGINE=InnoDB;

CREATE INDEX idx_students_dept ON students(department);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_att_student   ON attendance(student_id);
