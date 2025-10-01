// user_iterator.cpp
#include "userIterator.h"

// Constructor
UserIterator::UserIterator(UserCollection* users) : users(users), index(0) {}

// Returns the current user
User* UserIterator::current() {
    return users->getUser(index);
}

// Moves to the next user
bool UserIterator::next() {
    index++;
    return (index < users->count());
}

// Resets the iterator to the beginning
void UserIterator::reset() {
    index = 0;
}

// Checks if there are more users to iterate
bool UserIterator::hasNext() {
    return (index < users->count());
}