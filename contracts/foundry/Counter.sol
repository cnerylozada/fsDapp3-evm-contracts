// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Counter {
    uint public x;
    error Counter__InvalidInputs();

    event Increment(uint by);

    function inc() public {
        x++;
        emit Increment(1);
    }

    function incBy(uint by) public {
        if (by <= 0) revert Counter__InvalidInputs();

        x += by;
        emit Increment(by);
    }
}
