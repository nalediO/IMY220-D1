#include "Truck.h"
#include <iostream>

/*
    This is a simple main program to help you test your Truck assignment operator.
    Feel free to create additional tests.
    Please ensure that your code compiles locally before uploading to Fitchfork.
*/
int main(int argc, char* argv[]) {
    Truck* t1 = new Truck("MAN", "3000x superlux", 4);
    Truck* t2 = new Truck("Scania", "R500", 6);
    *t1 = *t2;

    t1->print();

    delete t1;
    delete t2;
    return 0;
}