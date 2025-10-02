#include "Marksheet.h"

Marksheet::Marksheet(int classSize) : classSize(classSize) {
    students = new Student*[classSize];
    for (int i = 0; i < classSize; i++) {
        students[i] = NULL;
    }
}

Marksheet::~Marksheet() {
    /*
        Add your code here
    */
}

void Marksheet::addStudent(const Student& student, int index) {
    if (students[index]) {
        delete students[index];
    }
    students[index] = new Student(student);
}

ostream& operator<<(ostream& os, const Marksheet& m) {
    /*
        Add your code here
    */
}