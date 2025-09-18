export class SequenceExpression {
    left;
    right;
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
;
export class Repeater {
    repeatee;
    repeatExpression;
    constructor(repeatee, repeatExpression) {
        this.repeatee = repeatee;
        this.repeatExpression = repeatExpression;
    }
}
export class Const {
    value;
    type = "Constant";
    constructor(value) {
        this.value = value;
    }
}
export class Var {
    name;
    type = "Variable";
    constructor(name) {
        this.name = name;
    }
}
export class SigmaSum {
    indexVar;
    indexStart;
    indexEnd;
    expr;
    type = "SigmaAddition";
    constructor(indexVar, indexStart, indexEnd, expr) {
        this.indexVar = indexVar;
        this.indexStart = indexStart;
        this.indexEnd = indexEnd;
        this.expr = expr;
    }
}
export class Add {
    left;
    right;
    type = "Addition";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
export class Sub {
    left;
    right;
    type = "Subtraction";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
export class Div {
    numerator;
    denominator;
    type = "Division";
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }
}
export class Mult {
    numerator;
    denominator;
    type = "Multiplication";
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }
}
export class Exp {
    base;
    exponent;
    type = "Exponentiation";
    constructor(base, exponent) {
        this.base = base;
        this.exponent = exponent;
    }
}
