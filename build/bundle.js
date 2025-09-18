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
class Neg {
    subExpression;
    type = "Negation";
    constructor(subExpression) {
        this.subExpression = subExpression;
    }
}
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
    left;
    right;
    type = "Division";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
};
let Mult$2 = class Mult {
    left;
    right;
    type = "Multiplication";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
};
let Exp$2 = class Exp {
    left;
    right;
    type = "Exponentiation";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
};
let SigmaSum$1 = class SigmaSum {
    indexStartTerm;
    indexEndTerm;
    sumTerm;
    type = "SigmaAddition";
    constructor(indexStartTerm, indexEndTerm, sumTerm) {
        this.indexStartTerm = indexStartTerm;
        this.indexEndTerm = indexEndTerm;
        this.sumTerm = sumTerm;
    }
};

let SequenceExpression$1 = class SequenceExpression {
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
};
;
class DigitSeq {
    digits;
    type = "Digits";
    constructor(digits) {
        this.digits = digits;
    }
}
let Repeater$1 = class Repeater {
    repeatee;
    repeatExpression;
    type = "Repeater";
    constructor(repeatee, repeatExpression) {
        this.repeatee = repeatee;
        this.repeatExpression = repeatExpression;
    }
};

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
                return dotLocation === null ? result : result / (10 * (scannerCount - dotLocation));
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
            function binaryOperationHelper(constructor, nextFunction, operator) {
                // const [constructor, nextFunction, textRepresentation] = subs
                return () => {
                    let left = nextFunction();
                    while (!atEnd() && peekParse() === operator) {
                        advanceParse();
                        const right = nextFunction();
                        left = new constructor(left, right);
                    }
                    return left;
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
                    return new Const$2(tok);
                }
                else if (isVariable(tok)) {
                    return new Var$2(tok);
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
            const exponentiation = binaryOperationHelper(Exp$2, negation, "^");
            const multiplication = binaryOperationHelper(Mult$2, exponentiation, "*");
            const division = binaryOperationHelper(Div$2, multiplication, "/");
            const subtraction = binaryOperationHelper(Sub$2, division, "-");
            const addition = binaryOperationHelper(Add$2, subtraction, "+");
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
                const nextToken = peekParse();
                if (nextToken.tokenType === "RepeaterExpression") {
                    currentSide.push(new Repeater$1(currentToken.token, parseRepeaterExpression(nextToken.token)));
                    advanceParse();
                }
                else
                    currentSide.push(new DigitSeq(currentToken.token));
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
            return new SequenceExpression$1(left, right);
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
function collectSubExpressions(ex) {
    const result = [];
    const stack = [ex.right, ex.left];
    while (stack.length > 0) {
        const nextElement = stack.pop();
        if (nextElement.type === ex.type)
            stack.push(nextElement.right, nextElement.left);
        else
            result.push(nextElement);
    }
    return result;
}
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
            return `-${printExpressionAsString(repEx.subExpression)}`;
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
                negationML.append(minusML, printExpressionAsMathML(ex.subExpression));
                return negationML;
            }
            case "Addition": {
                return printBinOP(collectSubExpressions(ex), "+");
            }
            case "Subtraction": {
                return printBinOP(collectSubExpressions(ex), "-");
            }
            case "Multiplication": {
                return printBinOP(collectSubExpressions(ex), "·");
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
                const indexEndTermML = helper(ex.indexEndTerm);
                indexEndTermML.classList.add("IndexEndTerm");
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
                const combinedML = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mrow");
                combinedML.append(sigmaSumLeftML, sumTermML);
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
        return original === undefined ? toAdd : new Add$2(original, toAdd);
    }
    function addIfExistsReversed(original, toAdd) {
        return original === undefined ? toAdd : new Add$2(toAdd, original);
    }
    const digitsToNumber = (d) => d.reduce((prev, curr) => 10 * prev + curr, 0);
    for (const e of seqEx.left.slice().reverse()) {
        switch (e.type) {
            case "Digits": {
                const cum = new Mult$2(new Const$2(digitsToNumber(e.digits)), new Exp$2(new Const$2(base), cummulativeReqEx ?? new Const$2(0)));
                cummulativeReqEx = addIfExistsReversed(cummulativeReqEx, new Const$2(e.digits.length));
                result = addIfExistsReversed(result, cum);
                break;
            }
            case "Repeater": {
                // cummulativeReqEx = addIfExistsReversed<RepeaterExpression|undefined>(cummulativeReqEx,new Const(e.repeatee.length-1))
                result = addIfExistsReversed(result, new SigmaSum$1(new Const$2(1), e.repeatExpression, new Mult$2(new Const$2(digitsToNumber(e.repeatee)), new Mult$2(new Exp$2(new Const$2(base), cummulativeReqEx ?? new Const$2(0)), new Exp$2(new Const$2(base), new Mult$2(new Const$2(e.repeatee.length), new Var$2("i")))))
                //Sum((digits)*(10^expr*10^i))
                ));
                cummulativeReqEx = addIfExistsReversed(cummulativeReqEx, new Mult$2(new Const$2(e.repeatee.length), e.repeatExpression));
                break;
            }
        }
    }
    // The same as above but instead of Mult we use Div. This needs to be written more cleanly
    cummulativeReqEx = undefined;
    for (const e of seqEx.right) {
        switch (e.type) {
            case "Digits": {
                cummulativeReqEx = addIfExists(cummulativeReqEx, new Const$2(e.digits.length));
                result = addIfExists(result, new Div$2(new Const$2(digitsToNumber(e.digits)), new Exp$2(new Const$2(base), cummulativeReqEx)));
                break;
            }
            case "Repeater": {
                // cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx,new Const(e.repeatee.length-1))
                result = addIfExists(result, new SigmaSum$1(new Const$2(1), e.repeatExpression, new Div$2(new Const$2(digitsToNumber(e.repeatee)), new Mult$2(new Exp$2(new Const$2(base), cummulativeReqEx ?? new Const$2(0)), new Exp$2(new Const$2(base), new Mult$2(new Const$2(e.repeatee.length), new Var$2("i")))))
                //Sum((digits)/(10^expr*10^i))
                ));
                cummulativeReqEx = addIfExists(cummulativeReqEx, new Mult$2(new Const$2(e.repeatee.length), e.repeatExpression));
                break;
            }
        }
    }
    if (result === undefined)
        throw Error("Found empty Sequent");
    return result;
}
function assignValue(interpretation, expr) {
    switch (expr.type) {
        case "Variable": {
            if (!interpretation.has(expr.name))
                throw Error(`Found variable ${expr.name} in expression, but not in interpretation`);
            return interpretation.get(expr.name);
            break;
        }
        case "Constant": {
            return expr.value;
            break;
        }
        case "Negation": {
            return -assignValue(interpretation, expr.subExpression);
        }
        case "Addition": {
            return assignValue(interpretation, expr.left) + assignValue(interpretation, expr.right);
            break;
        }
        case "Subtraction": {
            return assignValue(interpretation, expr.left) - assignValue(interpretation, expr.right);
            break;
        }
        case "Multiplication": {
            return assignValue(interpretation, expr.left) * assignValue(interpretation, expr.right);
            break;
        }
        case "Division": {
            return (assignValue(interpretation, expr.left) / assignValue(interpretation, expr.right));
            break;
        }
        case "Exponentiation": {
            return assignValue(interpretation, expr.left) ** assignValue(interpretation, expr.right);
            break;
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

onload = () => {
    const sequenceInput = document.getElementById("SequenceInput");
    const sequenceInputButton = document.getElementById("SequenceInputButton");
    const parserOutput = document.getElementById("ParserOutput");
    const sequenceOutput = document.getElementById("SequenceOutput");
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
        sequenceOutput.append(printExpressionAsMathML(interpretSeqEx(seqEx)));
    }
    const handleInput = () => {
        const seqEx = readUserInput();
        if (seqEx !== undefined)
            showSequence(seqEx);
    };
    sequenceInput.onkeyup = handleInput;
    handleInput();
};

class SequenceExpression {
    left;
    right;
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
;
class Repeater {
    repeatee;
    repeatExpression;
    constructor(repeatee, repeatExpression) {
        this.repeatee = repeatee;
        this.repeatExpression = repeatExpression;
    }
}
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
class SigmaSum {
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
let Add$1 = class Add {
    left;
    right;
    type = "Addition";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
};
let Sub$1 = class Sub {
    left;
    right;
    type = "Subtraction";
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
};
let Div$1 = class Div {
    numerator;
    denominator;
    type = "Division";
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }
};
let Mult$1 = class Mult {
    numerator;
    denominator;
    type = "Multiplication";
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }
};
let Exp$1 = class Exp {
    base;
    exponent;
    type = "Exponentiation";
    constructor(base, exponent) {
        this.base = base;
        this.exponent = exponent;
    }
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
