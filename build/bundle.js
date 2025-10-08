function splitByFilter(arr, filter) {
    return arr.reduce(([l1, l2], cur) => filter(cur) ? [l1.concat(cur), l2] : [l1, l2.concat(cur)], [[], []]);
}

let SequenceExpression$1 = class SequenceExpression {
    left;
    right;
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
};
;
let Repeater$1 = class Repeater {
    repeatee;
    repeatExpression;
    constructor(repeatee, repeatExpression) {
        this.repeatee = repeatee;
        this.repeatExpression = repeatExpression;
    }
};
let Const$2 = class Const {
    value;
    type = "Constant";
    constructor(value) {
        this.value = value;
    }
};
let Var$2 = class Var {
    name;
    type = "Variable";
    constructor(name) {
        this.name = name;
    }
};
let SigmaSum$1 = class SigmaSum {
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
};
let Add$2 = class Add {
    left;
    right;
    type = "Addition";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
};
let Sub$2 = class Sub {
    left;
    right;
    type = "Subtraction";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
};
let Div$2 = class Div {
    numerator;
    denominator;
    type = "Division";
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }
};
let Mult$2 = class Mult {
    numerator;
    denominator;
    type = "Multiplication";
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }
};
let Exp$2 = class Exp {
    base;
    exponent;
    type = "Exponentiation";
    constructor(base, exponent) {
        this.base = base;
        this.exponent = exponent;
    }
};

let Const$1 = class Const {
    value;
    type = "Constant";
    constructor(value) {
        this.value = value;
    }
};
let Var$1 = class Var {
    name;
    type = "Variable";
    constructor(name) {
        this.name = name;
    }
};
class Neg {
    subterm;
    type = "Negation";
    constructor(subterm) {
        this.subterm = subterm;
    }
}
function leftAssociativity(op) {
    return {
        left: (subterms) => subterms.length === 2 ? subterms[0] : op(...subterms.slice(0, -1)),
        right: (subterms) => subterms.at(-1),
    };
}
function rightAssociativity(op) {
    return {
        left: (subterms) => subterms.at(0),
        right: (subterms) => subterms.length === 2 ? subterms[1] : op(...subterms.slice(1)),
    };
}
class AbstractBinaryOperator {
    subterms;
    constructor(...subterms) {
        if (subterms.length < 2)
            throw Error("Binary operator needs at least two subterms");
        this.subterms = subterms;
    }
    ass = rightAssociativity(this.thisConstructor);
    get left() {
        return this.ass.left(this.subterms);
    }
    get right() {
        return this.ass.right(this.subterms);
    }
}
let Add$1 = class Add extends AbstractBinaryOperator {
    type = "Addition";
    thisConstructor(...subs) {
        return new Add(...subs);
    }
};
let Sub$1 = class Sub extends AbstractBinaryOperator {
    type = "Subtraction";
    thisConstructor(...subs) {
        return new Sub(...subs);
    }
    ass = leftAssociativity(this.thisConstructor);
};
let Div$1 = class Div extends AbstractBinaryOperator {
    type = "Division";
    thisConstructor(...subs) {
        return new Div(...subs);
    }
};
let Mult$1 = class Mult extends AbstractBinaryOperator {
    type = "Multiplication";
    thisConstructor(...subs) {
        return new Mult(...subs);
    }
};
let Exp$1 = class Exp extends AbstractBinaryOperator {
    type = "Exponentiation";
    thisConstructor(...subs) {
        return new Exp(...subs);
    }
};
class SigmaSum {
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

class SequenceExpression {
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
class DigitSeq {
    digits;
    type = "Digits";
    constructor(digits) {
        this.digits = digits;
    }
}
class Repeater {
    repeatee;
    repeatExpression;
    type = "Repeater";
    constructor(repeatee, repeatExpression) {
        this.repeatee = repeatee;
        this.repeatExpression = repeatExpression;
    }
}

// type SeqTokens = IntegerSeqTokens | DecimalSeqTokens
// type IntegerSeqTokens = [...RepeatersOrDigits]
// type DecimalSeqTokens = [...IntegerSeqTokens, ".", ...RepeatersOrDigits]
// type RepeatersOrDigits = [...(Repeater | Digits)]
// type Repeater    = [...[...Repeatee,"_",...RepeaterVal]]
// type Repeatee    = [Digit]                 | ["[", ...Digits          , "]"]
// type RepeaterVal = [AtomicExpressionToken] | ["(", ...ExpressionToken[],")"]
function isDigit(char) {
    return char.length === 1 && "0".charCodeAt(0) <= char.charCodeAt(0) && char.charCodeAt(0) <= "9".charCodeAt(0);
}
function isUppercase(char) {
    return char.length === 1 && "A".charCodeAt(0) <= char.charCodeAt(0) && char.charCodeAt(0) <= "Z".charCodeAt(0);
}
function isLowercase(char) {
    return char.length === 1 && "a".charCodeAt(0) <= char.charCodeAt(0) && char.charCodeAt(0) <= "z".charCodeAt(0);
}
function isLetter(char) {
    return isLowercase(char) || isUppercase(char);
}
function isVariable(s) {
    for (const c of s)
        if (!isLetter(c))
            return false;
    return true;
}
function readSeqEx(userInput) {
    /* SCANNER */
    const charToDigit = (c) => (c.charCodeAt(0)) - 48;
    function scan() {
        let scannerCount = 0;
        const advanceScan = () => userInput[scannerCount++];
        const peekScan = () => userInput[scannerCount];
        function scanRepeaterExpression() {
            const tokens = [];
            const atEnd = () => {
                if (scannerCount >= userInput.length)
                    throw new Error("Did not terminate repeater expression with a ']'");
                return userInput[scannerCount] === "]";
            };
            while (!atEnd()) {
                const char = advanceScan();
                switch (char) {
                    case " ":
                    case "\n":
                    case "\r":
                        continue;
                    case "(":
                    case ")":
                    case "+":
                    case "-":
                    case "*":
                    case "/":
                    case "^":
                        tokens.push(char);
                        break;
                    default:
                        if (isDigit(char)) {
                            tokens.push(scanNumber(char));
                        }
                        else if (isLetter(char)) {
                            tokens.push(scanVariable(char));
                        }
                        else
                            throw Error(`Found unexpected symbol '${char}'`);
                }
            }
            function scanNumber(currentChar) {
                let dotLocation = null;
                let result = charToDigit(currentChar);
                while (!atEnd() && (isDigit(peekScan()) || peekScan() === ".")) {
                    const char = advanceScan();
                    if (isDigit(char)) {
                        result = 10 * result + charToDigit(char);
                    }
                    else if (char === ".") {
                        if (dotLocation === null)
                            dotLocation = scannerCount;
                        else
                            throw Error("Found number with multiple dots '.'");
                    }
                }
                return dotLocation === null || dotLocation === scannerCount ? result : result / (10 ** (scannerCount - dotLocation));
            }
            function scanVariable(currentChar) {
                let result = currentChar;
                while (!atEnd() && isLetter(peekScan()))
                    result = result.concat(advanceScan());
                if (result === "i")
                    throw Error("Not allowed to use 'i' as a variable");
                return result;
            }
            return { tokenType: "RepeaterExpression", token: tokens };
        }
        function scanSequenceExpression() {
            const tokens = [];
            const atEnd = () => scannerCount >= userInput.length;
            while (!atEnd()) {
                const char = advanceScan();
                switch (char) {
                    case " ":
                    case "\n":
                    case "\r":
                    case "\t":
                        continue;
                    case "(":
                    case ")":
                    case ".":
                        tokens.push({ tokenType: char, token: char });
                        break;
                    case "_":
                        if (!atEnd() && peekScan() == "[") {
                            advanceScan(); // "["
                            tokens.push(scanRepeaterExpression());
                            advanceScan(); //"]"
                        }
                        else
                            throw new Error("An underscore '_' must be followed by a '[' to start a repeater expression");
                        break;
                    case "[":
                    case "]":
                        throw Error(`Internal: case _ should already capture all '${char}'. Could also be that the user accidentaly typed '${char}' where it doesn't belong`);
                    default:
                        if (isDigit(char))
                            tokens.push(scanDigits(char));
                        else
                            throw new Error(`Found unexpected symbol ${char}`);
                        break;
                }
            }
            function scanDigits(currentChar) {
                let result = [charToDigit(currentChar)];
                while (!atEnd() && isDigit(peekScan()))
                    result.push(charToDigit(advanceScan()));
                return { tokenType: "Digits", token: result };
            }
            return tokens;
        }
        return scanSequenceExpression();
    }
    /* PARSER */
    function parse(tokens) {
        /*
        RepeaterExpression -> Sum
        Sum -> Sub ("+" Sub)*
        Sub -> Mult ("-" Mult)*
        Mult -> Div ("*" Div)*
        Div -> Neg ("/" Neg)*
        Neg -> "-" Primary | Primary
        Primary -> Variable | "("RepeaterExpression")" | number
        */
        function parseRepeaterExpression(tokens) {
            let parserCount = 0;
            const atEnd = () => parserCount >= tokens.length;
            const advanceParse = () => {
                if (atEnd()) {
                    const errorBeginning = "";
                    if (tokens.length === 0)
                        throw new Error("Found empty expression");
                    throw new Error(`Reached end without fully parsing expression. '${tokens.slice(parserCount - 1).join()}' left`);
                }
                return tokens[parserCount++];
            };
            const peekParse = () => tokens[parserCount];
            function repeaterExpression() {
                return addition();
            }
            function binaryOperationHelper(constructor, nextFunction, operatorToken) {
                // const [constructor, nextFunction, textRepresentation] = subs
                return () => {
                    let subconcepts = [nextFunction()];
                    while (!atEnd() && peekParse() === operatorToken) {
                        advanceParse();
                        const right = nextFunction();
                        subconcepts.push(right);
                    }
                    return subconcepts.length === 1 ? subconcepts[0] : new constructor(...subconcepts);
                };
            }
            function primary() {
                const tok = advanceParse();
                if (tok === "(") {
                    const expr = repeaterExpression();
                    if (advanceParse() !== ")")
                        throw Error("Did not close bracketed expression");
                    return expr;
                }
                else if (typeof tok === "number") {
                    return new Const$1(tok);
                }
                else if (isVariable(tok)) {
                    return new Var$1(tok);
                }
                else
                    throw new Error(`Found operator '${tok}' without left hand side`);
            }
            function negation() {
                if (peekParse() === "-") {
                    advanceParse();
                    const prim = primary();
                    return new Neg(prim);
                }
                return primary();
            }
            const exponentiation = binaryOperationHelper(Exp$1, negation, "^");
            const multiplication = binaryOperationHelper(Mult$1, exponentiation, "*");
            const division = binaryOperationHelper(Div$1, multiplication, "/");
            const subtraction = binaryOperationHelper(Sub$1, division, "-");
            const addition = binaryOperationHelper(Add$1, subtraction, "+");
            const repEx = repeaterExpression();
            if (!atEnd())
                throw Error(`Could not parse entire expression. '${tokens.slice(parserCount).map(t => t.toString()).reduce((old, cur) => old.concat(cur))}' left`);
            return repEx;
        }
        /*
        SequenceExpression -> (Digits | Digits RepeaterExpression)* ("." (Digits | Digits RepeaterExpression)*)?
        Digits -> [0-9]* | "("[0-9]*")"
        RepeaterExpression -> "_[" ... "]"


        */
        function parseSequenceExpression(tokens) {
            let parserCount = 0;
            const atEnd = () => parserCount >= tokens.length;
            const advanceParse = () => tokens[parserCount++];
            const peekParse = () => tokens[parserCount];
            const left = [];
            const right = [];
            let currentSide = left;
            const checkRepeater = (currentToken) => {
                if (atEnd() || peekParse().tokenType !== "RepeaterExpression")
                    currentSide.push(new DigitSeq(currentToken.token));
                else {
                    const nextToken = peekParse();
                    currentSide.push(new Repeater(currentToken.token, parseRepeaterExpression(nextToken.token)));
                    advanceParse();
                }
            };
            while (!atEnd()) {
                const token = advanceParse();
                switch (token.tokenType) {
                    case ".": {
                        if (currentSide === right)
                            throw new Error("Found multiple dots in a sequence expression");
                        currentSide = right;
                        break;
                    }
                    case "(":
                        if (atEnd() || peekParse().tokenType !== "Digits")
                            throw Error("Expected digits after '('");
                        const digits = advanceParse();
                        if (!atEnd() && peekParse().tokenType === ")") {
                            advanceParse();
                            checkRepeater(digits);
                        }
                        else
                            throw Error("Bracketed digits are unclosed");
                        break;
                    case "Digits": {
                        if (atEnd()) {
                            currentSide.push(new DigitSeq(token.token));
                            break;
                        }
                        checkRepeater(token);
                        break;
                    }
                    case "RepeaterExpression": throw Error(`Found repeater expression without any digits beforehand. Instead found ${parserCount < 2 ? "nothing" : "'" + tokens[parserCount - 2].token.toString() + "'"}`);
                    case ")": throw Error("Found closing bracket without opening bracket");
                }
            }
            return new SequenceExpression(left, right);
        }
        return parseSequenceExpression(tokens);
    }
    return parse(scan());
}

const printDigits = (ds) => `(${ds.map(n => n.toString()).reduce((prev, curr) => prev.concat(curr))})`;
const removeOuterBracketsIfExistMathML = (ml) => {
    const first = ml.firstChild;
    const last = ml.lastChild;
    if (first !== null && first.nodeName === "mo" && first.textContent === "(" &&
        last !== null && last.nodeName === "mo" && last.textContent === ")") {
        ml.removeChild(first);
        ml.removeChild(last);
    }
};
function printSequenceExpression(seqEx) {
    const stringBuilder = [];
    for (const e of seqEx) {
        switch (e.type) {
            case "Digits":
                stringBuilder.push(printDigits(e.digits));
                break;
            case "Dot":
                stringBuilder.push(".");
                break;
            case "Repeater":
                stringBuilder.push(printDigits(e.repeatee), "_[", printExpressionAsString(e.repeatExpression), "]");
                break;
        }
    }
    return stringBuilder.join("");
}
function printExpressionAsString(repEx) {
    const printBinOP = (left, right, op) => `(${printExpressionAsString(left)} ${op} ${printExpressionAsString(right)})`;
    switch (repEx.type) {
        case "Variable":
            return repEx.name;
        case "Constant":
            return repEx.value.toString();
        case "Negation":
            return `-${printExpressionAsString(repEx.subterm)}`;
        case "Addition":
            return printBinOP(repEx.left, repEx.right, "+");
        case "Subtraction":
            if (repEx.left.type === "Constant" && repEx.left.value === 0)
                return `(-${printExpressionAsString(repEx.right)})`;
            return printBinOP(repEx.left, repEx.right, "-");
        case "Multiplication":
            return printBinOP(repEx.left, repEx.right, "*");
        case "Division":
            return printBinOP(repEx.left, repEx.right, "/");
        case "Exponentiation":
            return printBinOP(repEx.left, repEx.right, "^");
        case "SigmaAddition": throw "todo";
    }
}
function printExpressionAsMathML(ex) {
    function helper(ex) {
        const printBinOP = (subExpressions, op) => {
            const combinedML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mrow");
            const leftBracketML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
            leftBracketML.innerHTML = "(";
            combinedML.append(leftBracketML);
            for (const subExp of subExpressions) {
                combinedML.append(helper(subExp));
                if (op !== undefined) {
                    const opML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
                    opML.innerHTML = op;
                    combinedML.append(opML);
                }
            }
            combinedML.removeChild(combinedML.lastChild);
            const rightBracketML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
            rightBracketML.innerHTML = ")";
            combinedML.append(rightBracketML);
            return combinedML;
        };
        switch (ex.type) {
            case "Variable": {
                const varML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
                varML.innerHTML = ex.name;
                return varML;
            }
            case "Constant": {
                const constML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mn");
                constML.innerHTML = ex.value.toString();
                return constML;
            }
            case "Negation": {
                const minusML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
                minusML.innerHTML = "-";
                const negationML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mrow");
                negationML.append(minusML);
                if (ex.subterm.type === "Constant" || ex.subterm.type === "Variable")
                    negationML.append(printExpressionAsMathML(ex.subterm));
                else {
                    const leftBracketML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
                    leftBracketML.innerHTML = "(";
                    const rightBracketML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
                    rightBracketML.innerHTML = ")";
                    negationML.append(leftBracketML, printExpressionAsMathML(ex.subterm), rightBracketML);
                }
                return negationML;
            }
            case "Addition": {
                return printBinOP(ex.subterms, "+");
            }
            case "Subtraction": {
                return printBinOP(ex.subterms, "-");
            }
            case "Multiplication": {
                return printBinOP(ex.subterms, "·");
            }
            case "Division": {
                const leftML = helper(ex.left);
                const rightML = helper(ex.right);
                const divisionML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mfrac");
                divisionML.append(leftML, rightML);
                return divisionML;
            }
            case "Exponentiation": {
                const leftML = helper(ex.left);
                const rightML = helper(ex.right);
                const exponentiationML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "msup");
                exponentiationML.append(leftML, rightML);
                return exponentiationML;
            }
            case "SigmaAddition": {
                const indexEndTermML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mrow");
                indexEndTermML.classList.add("IndexEndTerm");
                indexEndTermML.append(helper(ex.indexEndTerm));
                const indexVarML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mi");
                indexVarML.innerHTML = "i";
                const indexStartTermML = helper(ex.indexStartTerm);
                const sumTermML = helper(ex.sumTerm);
                const sigmaML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
                sigmaML.innerHTML = "∑";
                const equalsML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
                equalsML.innerHTML = "=";
                const belowSigmaML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mrow");
                belowSigmaML.append(indexVarML, equalsML, indexStartTermML);
                const sigmaSumLeftML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "munderover");
                sigmaSumLeftML.append(sigmaML, belowSigmaML, indexEndTermML);
                const leftBracketML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
                leftBracketML.innerHTML = "(";
                const rightBracketML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mo");
                rightBracketML.innerHTML = ")";
                const combinedML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mrow");
                combinedML.append(leftBracketML, sigmaSumLeftML, sumTermML, rightBracketML);
                return combinedML;
            }
        }
    }
    const exML = helper(ex);
    removeOuterBracketsIfExistMathML(exML);
    return exML;
}
function printSequenceExpressionAsMathML(seqEx) {
    const result = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mrow");
    for (const e of seqEx) {
        switch (e.type) {
            case "Digits": {
                const digitsML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mn");
                digitsML.classList.add("Digits");
                digitsML.innerHTML = printDigits(e.digits);
                result.append(digitsML);
                break;
            }
            case "Repeater": {
                const repeateeML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mn");
                repeateeML.innerHTML = printDigits(e.repeatee);
                repeateeML.classList.add("Digits", "Repeatee");
                const repeaterExpressionML = printExpressionAsMathML(e.repeatExpression);
                repeaterExpressionML.classList.add("RepeaterExpression");
                const repeaterML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "msub");
                repeaterML.classList.add("Repeater");
                repeaterML.append(repeateeML, repeaterExpressionML);
                result.append(repeaterML);
                break;
            }
            case "Dot": {
                const dotML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mn");
                dotML.innerHTML = ".";
                dotML.classList.add("Dot");
                result.append(dotML);
                break;
            }
        }
    }
    return result;
}
const letterToMathItalic = (letters) => {
    return String.fromCharCode(...letters.split("").map(letter => letter.charCodeAt(0)));
};

function interpretSeqEx(seqEx, base = 10) {
    let cummulativeReqEx = undefined;
    let result = undefined;
    function addIfExists(original, toAdd) {
        if (original === undefined)
            return toAdd;
        if (original.type === "Addition")
            return new Add$1(...original.subterms, toAdd);
        return new Add$1(original, toAdd);
    }
    function addIfExistsReversed(original, toAdd) {
        if (original === undefined)
            return toAdd;
        if (original.type === "Addition")
            return new Add$1(toAdd, ...original.subterms);
        return new Add$1(toAdd, original);
    }
    const digitsToNumber = (d) => d.reduce((prev, curr) => 10 * prev + curr, 0);
    for (const e of seqEx.left.slice().reverse()) {
        switch (e.type) {
            case "Digits": {
                const oldCum = new Mult$1(new Const$1(digitsToNumber(e.digits)), new Exp$1(new Const$1(base), cummulativeReqEx ?? new Const$1(0)));
                cummulativeReqEx = addIfExistsReversed(cummulativeReqEx, new Const$1(e.digits.length));
                result = addIfExistsReversed(result, oldCum);
                break;
            }
            case "Repeater": {
                // cummulativeReqEx = addIfExistsReversed<RepeaterExpression|undefined>(cummulativeReqEx,new Const(e.repeatee.length-1))
                result = addIfExistsReversed(result, new SigmaSum(new Const$1(1), e.repeatExpression, 
                //(digits)*(10^expr*10^(length*i-1))
                new Mult$1(new Const$1(digitsToNumber(e.repeatee)), new Mult$1(new Exp$1(new Const$1(base), cummulativeReqEx ?? new Const$1(0)), //10^expr
                new Exp$1(new Const$1(base), new Mult$1(new Const$1(e.repeatee.length), new Sub$1(new Var$1("i"), new Const$1(1)))) //10^(length*i-1)
                ))));
                cummulativeReqEx = addIfExistsReversed(cummulativeReqEx, new Mult$1(new Const$1(e.repeatee.length), e.repeatExpression));
                break;
            }
        }
    }
    // The same as above but instead of Mult we use Div. This needs to be written more cleanly
    cummulativeReqEx = undefined;
    for (const e of seqEx.right) {
        switch (e.type) {
            case "Digits": {
                cummulativeReqEx = addIfExists(cummulativeReqEx, new Const$1(e.digits.length));
                result = addIfExists(result, new Div$1(new Const$1(digitsToNumber(e.digits)), new Exp$1(new Const$1(base), cummulativeReqEx)));
                break;
            }
            case "Repeater": {
                // cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx,new Const(e.repeatee.length-1))
                result = addIfExists(result, new SigmaSum(new Const$1(1), e.repeatExpression, 
                //(digits)/(10^expr*10^(length*i))
                new Div$1(new Const$1(digitsToNumber(e.repeatee)), new Mult$1(new Exp$1(new Const$1(base), cummulativeReqEx ?? new Const$1(0)), new Exp$1(new Const$1(base), new Mult$1(new Const$1(e.repeatee.length), new Var$1("i")))))));
                cummulativeReqEx = addIfExists(cummulativeReqEx, new Mult$1(new Const$1(e.repeatee.length), e.repeatExpression));
                break;
            }
        }
    }
    if (result === undefined) {
        //Empty sequent
        return new Const$1(0);
    }
    return result;
}
function assignValue(interpretation, expr) {
    function binTypeToOperator(binType) {
        return (acc, cur) => {
            switch (binType) {
                case "Addition":
                    return acc + cur;
                case "Subtraction":
                    return acc - cur;
                case "Multiplication":
                    return acc * cur;
                case "Division":
                    return acc / cur;
                case "Exponentiation":
                    return acc ** cur;
            }
        };
    }
    switch (expr.type) {
        case "Variable": {
            if (!interpretation.has(expr.name))
                throw Error(`Found variable ${expr.name} in expression, but not in interpretation`);
            return interpretation.get(expr.name);
        }
        case "Constant": {
            return expr.value;
        }
        case "Negation": {
            return -assignValue(interpretation, expr.subterm);
        }
        case "Addition":
        case "Subtraction":
        case "Multiplication":
        case "Division":
        case "Exponentiation": {
            return expr.subterms.map(sub => assignValue(interpretation, sub)).reduce(binTypeToOperator(expr.type));
        }
        case "SigmaAddition": {
            let sum = 0;
            const endTerm = assignValue(interpretation, expr.indexEndTerm);
            const startTerm = assignValue(interpretation, expr.indexStartTerm);
            for (let i = startTerm; i <= endTerm; i++) {
                interpretation.set("i", i);
                sum += assignValue(interpretation, expr.sumTerm);
            }
            // interpretation.delete("i")
            return sum;
            break;
        }
    }
}

function collectVariablesFromExpression(exp) {
    switch (exp.type) {
        case "Variable":
            return exp.name === "i" ? new Set() : new Set([exp.name]);
        case "Constant":
            return new Set();
        case "Negation":
            return collectVariablesFromExpression(exp.subterm);
        case "Addition":
        case "Multiplication":
        case "Subtraction":
        case "Division":
        case "Exponentiation":
            return exp.subterms.reduce((acc, cur) => acc.union(collectVariablesFromExpression(cur)), new Set())
                .union(collectVariablesFromExpression(exp.right));
        case "SigmaAddition":
            return collectVariablesFromExpression(exp.indexEndTerm)
                .union(collectVariablesFromExpression(exp.indexStartTerm))
                .union(collectVariablesFromExpression(exp.sumTerm));
    }
}
function collectVariables(seq) {
    const variables = new Set();
    for (const seqPart of seq) {
        if (seqPart.type !== "Repeater")
            continue;
        variables.union(collectVariablesFromExpression(seqPart.repeatExpression));
    }
    return variables;
}

function simplifyExpression(ex) {
    function associativeCommutativeBinHelper(ex) {
        let neutralElement;
        let AssBinOp;
        let op;
        switch (ex.type) {
            case "Addition":
                neutralElement = 0;
                AssBinOp = Add$1;
                op = (a, c) => a + c.value;
                break;
            case "Multiplication":
                neutralElement = 1;
                AssBinOp = Mult$1;
                op = (a, c) => a * c.value;
        }
        const simplifiedSubterms = ex.subterms.map(subEx => simplifyExpression(subEx));
        // const [constants,nonconstants] = simplifiedSubterms.reduce<[Const[],Expression[]]>(([consts,nonconsts], cur) => cur.type === "Constant" ? [consts.concat(cur),nonconsts] : [consts,nonconsts.concat(cur)],[[],[]])
        const [constants, nonconstants] = splitByFilter(simplifiedSubterms, (sub) => sub.type === "Constant");
        const constantPart = new Const$1(constants.reduce(op, neutralElement));
        if (nonconstants.length === 0)
            return constantPart;
        if (constantPart.value === neutralElement) {
            if (nonconstants.length === 1)
                return nonconstants[0];
            return new AssBinOp(...nonconstants);
        }
        if (ex.type === "Multiplication" && constantPart.value === 0) {
            return constantPart;
        }
        return new AssBinOp(constantPart, ...nonconstants);
    }
    switch (ex.type) {
        case "Constant":
        case "Variable": {
            return ex;
        }
        case "Negation": {
            const sub = simplifyExpression(ex.subterm);
            if (sub.type === "Constant")
                return new Const$1(-sub.value);
            if (sub.type === "Negation")
                return sub.subterm;
            return new Neg(sub);
        }
        case "Addition":
        case "Multiplication":
            return associativeCommutativeBinHelper(ex);
        case "Subtraction": {
            // const l = simplifyExpression(ex.left)
            // const r = simplifyExpression(ex.right)
            // if(l.type === "Constant" && r.type === "Constant") return new Const(l.value-r.value)
            // if(l.type === "Constant" && l.value === 0) return new Neg(r)
            // if(r.type === "Constant" && r.value === 0) return l
            // if(r.type === "Negation") return new Add(l,r.subterm)
            // return new Sub(l,r)
            // a-b-...-z = a+(-b)+...+(-z)
            const firstSub = simplifyExpression(ex.subterms[0]);
            const [negatedConstants, negatedNonconstants] = splitByFilter(ex.subterms.slice(1).map(sub => simplifyExpression(new Neg(sub))), (t) => t.type === "Constant");
            const constantPart = new Const$1(negatedConstants.reduce((acc, cur) => acc + cur.value, 0));
            if (firstSub.type === "Constant")
                constantPart.value += firstSub.value;
            else
                negatedNonconstants.push(firstSub);
            if (negatedNonconstants.length === 0)
                return constantPart;
            if (constantPart.value === 0) {
                if (negatedNonconstants.length === 1)
                    return negatedNonconstants[0];
                return new Add$1(...negatedNonconstants);
            }
            return new Add$1(constantPart, ...negatedNonconstants);
        }
        case "Division": {
            const l = simplifyExpression(ex.left);
            const r = simplifyExpression(ex.right);
            if (l.type === "Constant" && r.type === "Constant")
                return new Const$1(l.value / r.value);
            if (l.type === "Constant" && l.value === 0)
                return new Const$1(0);
            if (r.type === "Constant" && r.value === 1)
                return l;
            return new Div$1(l, r);
        }
        case "Exponentiation": {
            const l = simplifyExpression(ex.left);
            const r = simplifyExpression(ex.right);
            if (l.type === "Constant" && r.type === "Constant")
                return new Const$1(l.value ** r.value);
            if (l.type === "Constant" && l.value === 0)
                return new Const$1(0);
            if (r.type === "Constant" && r.value === 0)
                return new Const$1(1);
            if (r.type === "Constant" && r.value === 1)
                return l;
            if (l.type === "Constant" && l.value === 1)
                return new Const$1(1);
            return new Exp$1(l, r);
        }
        case "SigmaAddition": {
            // the start term should always by Const(1). We simplify anyways...
            const startTerm = simplifyExpression(ex.indexStartTerm);
            const endTerm = simplifyExpression(ex.indexEndTerm);
            const sumTerm = simplifyExpression(ex.sumTerm);
            const varsInSumTerm = collectVariablesFromExpression(sumTerm);
            if (startTerm.type !== "Constant" || endTerm.type !== "Constant" || (varsInSumTerm.size === 1 && !varsInSumTerm.has("i") || varsInSumTerm.size > 1))
                return new SigmaSum(startTerm, endTerm, sumTerm);
            let sum = 0;
            for (let i = startTerm.value; i <= endTerm.value; i++)
                sum += assignValue(new Map([["i", i]]), sumTerm);
            return new Const$1(sum);
        }
    }
}

function createInputBorder() {
    const b = document.createElement("div");
    b.classList.add("inputBorder");
    return b;
}
onload = () => {
    const sequenceInput = document.getElementById("SequenceInput");
    const parserOutput = document.getElementById("ParserOutput");
    const sequenceOutput = document.getElementById("SequenceOutput");
    const simplifierOutput = document.getElementById("SimplifierOutput");
    const variableAssigner = document.getElementById("VariableAssigner");
    const valueOutput = document.getElementById("ValueOutput");
    /* INPUT HANDLING */
    // Sequence Input
    function readUserInput(ev) {
        ev?.preventDefault();
        parserOutput.innerHTML = "";
        let seqEx = undefined;
        try {
            seqEx = readSeqEx(sequenceInput.value);
            parserOutput.append(printSequenceExpressionAsMathML(seqEx));
        }
        catch (e) {
            const error = document.createElement("div");
            error.classList.add("Error");
            if (Error.isError(e))
                error.innerHTML = `Error : ${e.message}`;
            parserOutput.append(error);
        }
        return seqEx;
    }
    function showSequence(seqEx) {
        sequenceOutput.innerHTML = "";
        const seq = interpretSeqEx(seqEx);
        sequenceOutput.append(printExpressionAsMathML(seq));
        return seq;
    }
    function showSimplification(seq) {
        simplifierOutput.innerHTML = "";
        const simplifiedExpression = simplifyExpression(seq);
        simplifierOutput.append(printExpressionAsMathML(simplifiedExpression));
        return simplifiedExpression;
    }
    //Variable Assignment
    const handleVarInput = (seq, varsToInputElems) => () => {
        const interpretation = new Map(varsToInputElems.map(([val, elem]) => [val, elem.valueAsNumber]));
        valueOutput.innerHTML = assignValue(interpretation, seq).toString();
    };
    const createVariableAssignmentInput = (seq) => {
        const variables = collectVariablesFromExpression(seq);
        const varsToInputElems = [];
        variableAssigner.innerHTML = "";
        for (const variable of variables) {
            const id = `VariableInput:${variable}`;
            const varLabel = document.createElement("label");
            varLabel.innerText = `${variable}:`;
            varLabel.htmlFor = id;
            const varInputBorder = createInputBorder();
            const varInputField = document.createElement("input");
            varInputField.id = id;
            varInputField.type = "number";
            varInputField.onchange = handleVarInput(seq, varsToInputElems);
            varInputField.onkeyup = handleVarInput(seq, varsToInputElems);
            varsToInputElems.push([variable, varInputField]);
            varInputBorder.appendChild(varInputField);
            const varInput = document.createElement("div");
            varInput.append(varLabel, varInputBorder);
            variableAssigner.append(varInput);
        }
    };
    const handleSeqExInput = () => {
        const seqEx = readUserInput();
        if (seqEx === undefined)
            return;
        const seq = showSequence(seqEx);
        showSimplification(seq);
        createVariableAssignmentInput(seq);
    };
    sequenceInput.onkeyup = handleSeqExInput;
    handleSeqExInput();
};

class Const {
    value;
    type = "Constant";
    constructor(value) {
        this.value = value;
    }
}
class Var {
    name;
    type = "Variable";
    constructor(name) {
        this.name = name;
    }
}
class Add {
    left;
    right;
    type = "Addition";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
class Sub {
    left;
    right;
    type = "Subtraction";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
class Div {
    left;
    right;
    type = "Division";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
class Mult {
    left;
    right;
    type = "Multiplication";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
class Exp {
    left;
    right;
    type = "Exponentiation";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
