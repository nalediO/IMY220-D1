#include "Truck.h"
#include <iostream>

Truck::Truck(const string &make, const string &model, const int numWheels): Vehicle(make,model) {
    this->numWheels = new int(numWheels);
}

Truck::~Truck() {
    delete numWhes;
}

void Truck::setNumWheels(const int numWheels) {
    *(this->numWheels) = numWheels;
}

void Truck::print() const {
    Vehicle::print();
    cout << "Number of wheels: " << *numWheels << endl;
}

Truck & Truck::operator=(const Truck &otherTruck) {
    /* Add your code here */
}