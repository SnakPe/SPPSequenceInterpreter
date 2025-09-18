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
export class Neg {
    subExpression;
    type = "Negation";
    constructor(subExpression) {
        this.subExpression = subExpression;
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
    left;
    right;
    type = "Division";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
export class Mult {
    left;
    right;
    type = "Multiplication";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
export class Exp {
    left;
    right;
    type = "Exponentiation";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
export class SigmaSum {
    indexStartTerm;
    indexEndTerm;
    sumTerm;
    type = "SigmaAddition";
    constructor(indexStartTerm, indexEndTerm, sumTerm) {
        this.indexStartTerm = indexStartTerm;
        this.indexEndTerm = indexEndTerm;
        this.sumTerm = sumTerm;
    }
}
