const boom = "foobar"; // should fail single quotes, unused variable

debugger; // should fail, no debugger statements left in code

function doSomething() {
    var myVariable = 5; // don't use vars
    const myConstant = 10;
    const anotherConstant = 12;
    let myLet = 8; // should fail, newlines between a let and const statement. let should be const
    const yetAnotherConstant = 11; // should fail should fail, newlines between a let and const statement.

    if(myLet) { // should fail for incorrect whitespace
        console.log(myLet);
    }

    console.log(
        myConstant,
        myVariable,
        anotherConstant,
        yetAnotherConstant
    );
}
doSomething(); // should fail, newline after functions

(function() { // incorrect whitespace

}());
