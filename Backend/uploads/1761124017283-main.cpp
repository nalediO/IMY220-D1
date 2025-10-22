#include <iostream>

#include "FibonacciPrinter.h"

using namespace std;

/*
    Output in out.txt
*/

int main() {
    FibonacciPrinter<int> i(7);
    i.fillArray(5, 2, 20);
    i.printArray();

    FibonacciPrinter<string> s(10);
    s.fillArray("A", "B", "a");
    s.printArray();
}