/*
==================== DONT MAKE ANY CHANGES TO THIS FILE ====================
*/

#include "Student.h"

Student::Student(string sN, float m) : studentNumber(sN), mark(m) {
}

Student::Student(const Student& other) {
    studentNumber = other.studentNumber;
    mark = other.mark;
}

string Student::getStudentNumber() {
    return studentNumber;
}

float Student::getMark() {
    return mark;
}
