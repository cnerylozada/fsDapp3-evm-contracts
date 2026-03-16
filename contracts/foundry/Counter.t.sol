// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Counter} from "./Counter.sol";
import {Test} from "forge-std/Test.sol";

contract CounterTest is Test {
    Counter counter;

    function setUp() public {
        counter = new Counter();
    }

    function test_initialValue_shouldStartWithZero() public view {
        assertEq(counter.x(), 0);
    }

    function test_incFunction_shouldIncrementValueByOne() public {
        counter.inc();
        assertEq(counter.x(), 1);
    }

    function test_incByFunction_shouldIncrementValueAndEmitEventByInputPassed()
        public
    {
        uint value = 7;

        vm.expectEmit();
        emit Counter.Increment(value);

        counter.incBy(value);
        assertEq(counter.x(), value);
    }

    function test_incByFunction_shouldRevertIfInvalidInputIsPassed() public {
        vm.expectRevert(Counter.Counter__InvalidInputs.selector);
        counter.incBy(0);
    }

    function testFuzz_incFunction(uint8 randomValue) public {
        for (uint8 i = 0; i < randomValue; i++) {
            counter.inc();
        }
        assertEq(counter.x(), randomValue);
    }
}
