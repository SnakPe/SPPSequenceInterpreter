export class SequenceExpression {
    left;
    right;
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
    *[Symbol.iterator]() {
        for (const e of this.left)
            yield e;
        if (this.right.length !== 0)
            yield { type: "Dot" };
        for (const e of this.right)
            yield e;
    }
}
;
export class DigitSeq {
    digits;
    type = "Digits";
    constructor(digits) {
        this.digits = digits;
    }
}
export class Repeater {
    repeatee;
    repeatExpression;
    type = "Repeater";
    constructor(repeatee, repeatExpression) {
        this.repeatee = repeatee;
        this.repeatExpression = repeatExpression;
    }
}
