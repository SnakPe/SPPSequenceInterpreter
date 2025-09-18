import { Const, Var, Sub, Exp, Mult, Div, Add, Neg } from "../Sequences/Expression.js"
import { RepeaterExpression } from "../Sequences/Repeater.js"
import { SequenceExpression, Repeater, DigitSeq } from "../Sequences/Sequence.js"

type Uppercase = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" 
type Lowercase = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" 
export type Letter = Uppercase | Lowercase

// I am not properly able to describe variable text as a type. variables only consist of letters 
export type VariableText = `${Letter}${string}` & {}
export type VariableTextHelper<Input extends string> = 
	Input extends `${infer Char}${infer Rest}` ? `${Char}${VariableTextHelper<Rest>}` : 
	Input extends "" ? "" : 
	never 

type Token = 
	| {tokenType : "Digits", token : Digits}
	| {tokenType : "RepeaterExpression", token : ExpressionToken[]} 
	| {tokenType : ".", token : "."} 
	| {tokenType : "(", token : "("} 
	| {tokenType : ")", token : ")"} 

export type Operator = "+" | "-" | "*" | "/" | "^"
type ExpressionToken =
	| VariableText
	| number
	| Operator
	| "("
	| ")"

type NaturalsUnionHelper<Min extends number, Max extends number, Helper extends 1[] = []> = 
	Max extends Helper["length"] ? Max :
	Min extends 0 ? (Helper["length"] | NaturalsUnionHelper<0,Max,[...Helper,1]>) :
	Min extends Helper["length"] ? NaturalsUnionHelper<0,Max,Helper> : 
	NaturalsUnionHelper<Min,Max,[...Helper,1]>

type Digit = NaturalsUnionHelper<0,9>
type DigitString = `${Digit}`
export type Digits = Digit[]
export type DigitsString<N extends number = number, N2 extends unknown[] = []> = N2["length"] extends N ? "" : (`${DigitString}` | `${DigitString}${DigitsString<N,[...N2,1]>}`)

// type SeqTokens = IntegerSeqTokens | DecimalSeqTokens
// type IntegerSeqTokens = [...RepeatersOrDigits]
// type DecimalSeqTokens = [...IntegerSeqTokens, ".", ...RepeatersOrDigits]

// type RepeatersOrDigits = [...(Repeater | Digits)]

// type Repeater    = [...[...Repeatee,"_",...RepeaterVal]]
// type Repeatee    = [Digit]                 | ["[", ...Digits          , "]"]
// type RepeaterVal = [AtomicExpressionToken] | ["(", ...ExpressionToken[],")"]

function isDigit(char : string): char is `${Digit}`{
	return char.length === 1 && "0".charCodeAt(0) <= char.charCodeAt(0) && char.charCodeAt(0) <= "9".charCodeAt(0) 
}
function isUppercase(char : string): char is Uppercase{
	return char.length === 1 && "A".charCodeAt(0) <= char.charCodeAt(0) && char.charCodeAt(0) <= "Z".charCodeAt(0) 
}
function isLowercase(char : string): char is Lowercase{
	return char.length === 1 && "a".charCodeAt(0) <= char.charCodeAt(0) && char.charCodeAt(0) <= "z".charCodeAt(0) 
}
function isLetter(char : string): char is Letter{
	return isLowercase(char) || isUppercase(char)
}
export function isVariable(s : string): s is VariableText{
	for(const c of s)
		if(!isLetter(c))return false
	return true
}

export function readSeqEx(userInput : string){
	
	/* SCANNER */


	const charToDigit = (c : DigitString) => (c.charCodeAt(0))-48 as Digit
	


	function scan(){
		let scannerCount : number = 0
		const advanceScan = () => userInput[scannerCount++]
		const peekScan = () => userInput[scannerCount]

		function scanRepeaterExpression() : {tokenType : "RepeaterExpression", token : ExpressionToken[]}{
			const tokens : ExpressionToken[] = []
			const atEnd = () => {
				if(scannerCount >= userInput.length) throw new Error("Did not terminate repeater expression with a ']'")
				return userInput[scannerCount] === "]"
			}
			while(!atEnd()){
				const char = advanceScan()
				switch(char){
					case " ":
					case "\n":
					case "\r":
						continue
					case "(":
					case ")":
					case "+":
					case "-":
					case "*":
					case "/":
					case "^":
						tokens.push(char)
						break
					default:
						if(isDigit(char)){
							tokens.push(scanNumber(char))
						}
						else if(isLetter(char)){
							tokens.push(scanVariable(char))
						}
						else throw Error(`Found unexpected symbol '${char}'`)
				}
			}
			function scanNumber(currentChar : DigitString) : number{
				let dotLocation : null | number = null
				let result = charToDigit(currentChar)
				while(!atEnd() && (isDigit(peekScan()) || peekScan() === ".")){
					const char = advanceScan()
					if(isDigit(char)){
						result = 10*result + charToDigit(char)
					}
					else if(char === "."){
						if(dotLocation === null)
							dotLocation = scannerCount
						else throw Error("Found number with multiple dots '.'")
					}
				}
				return dotLocation === null ? result : result / (10*(scannerCount-dotLocation))
			}
			function scanVariable(currentChar : Letter) : VariableText{
				let result : VariableText = currentChar
				while(!atEnd() && isLetter(peekScan()))
					result = result.concat(advanceScan()) as VariableText
				if(result === "i") throw Error("Not allowed to use 'i' as a variable")
				return result
			}
			return {tokenType : "RepeaterExpression", token : tokens}
		}
		function scanSequenceExpression(){
			const tokens : Token[] = []
			const atEnd   = () => scannerCount >= userInput.length
			while(!atEnd()){
				const char = advanceScan()
				switch(char){
					case " ":
					case "\n":
					case "\r":
					case "\t":
						continue
					case "(":
					case ")":
					case ".":
						tokens.push({tokenType : char, token : char} as any)
						break
					case "_":
						if(!atEnd() && peekScan() == "["){
							advanceScan() // "["
							tokens.push(scanRepeaterExpression())
							advanceScan() //"]"
							
						}
						else throw new Error("An underscore '_' must be followed by a '[' to start a repeater expression")
						break
					case "[":
					case "]":
						throw Error(`Internal: case _ should already capture all '${char}'. Could also be that the user accidentaly typed '${char}' where it doesn't belong`)
					default:
						if(isDigit(char))
							tokens.push(scanDigits(char))
						else
							throw new Error(`Found unexpected symbol ${char}`)
						break
				}
			}
			function scanDigits(currentChar : DigitString) : {tokenType : "Digits", token : Digits}{
				let result = [charToDigit(currentChar)]
				while(!atEnd() && isDigit(peekScan()))
					result.push(charToDigit(advanceScan() as DigitString))
				return {tokenType : "Digits", token : result}
			}
			return tokens
		}
		return scanSequenceExpression()
	}

	
	/* PARSER */
	function parse(tokens : Token[]){

		/* 
		RepeaterExpression -> Sum
		Sum -> Sub ("+" Sub)*
		Sub -> Mult ("-" Mult)*
		Mult -> Div ("*" Div)*
		Div -> Neg ("/" Neg)*
		Neg -> "-" Primary | Primary 
		Primary -> Variable | "("RepeaterExpression")" | number
		*/
		function parseRepeaterExpression(tokens : ExpressionToken[]) : RepeaterExpression{
			let parserCount = 0
			const atEnd = () => parserCount >= tokens.length
			const advanceParse = () => {
				if(atEnd()){ 
					const errorBeginning = ""
					if(tokens.length === 0) throw new Error("Found empty expression")
					throw new Error(`Reached end without fully parsing expression. '${tokens.slice(parserCount-1).join()}' left`)
				}
				return tokens[parserCount++]
			}
			const peekParse = () => tokens[parserCount]

			function repeaterExpression() : RepeaterExpression{
				return addition()
			}
			// type ExprConstructor = new <BoundVariables extends VariableText[] = VariableText[],Left extends RepeaterExpression<BoundVariables> = RepeaterExpression<BoundVariables>, Right extends RepeaterExpression<BoundVariables> = RepeaterExpression<BoundVariables>>(left : Left,right : Right) => RepeaterExpression
			type ExpressionFunction = () => RepeaterExpression
			function binaryOperationHelper(
				constructor: new (left: RepeaterExpression, right: RepeaterExpression) => RepeaterExpression,
				nextFunction: ExpressionFunction,
				operator: Operator
			) : (() => RepeaterExpression){
				// const [constructor, nextFunction, textRepresentation] = subs
				return () => {
					let left = nextFunction()
					while(!atEnd() && peekParse() === operator){
						advanceParse()
						const right = nextFunction()
						left = new constructor(left,right)
					}
					return left
				}
			}
			function primary() : RepeaterExpression{
				const tok = advanceParse()
				if(tok === "("){
					const expr = repeaterExpression()
					if(advanceParse() !== ")") throw Error("Did not close bracketed expression")
					return expr
				}
				else if(typeof tok === "number"){
					return new Const(tok)
				}
				else if(isVariable(tok)){
					return new Var(tok)
				}
				else throw new Error(`Found operator '${tok}' without left hand side`)
			}
			function negation(){
				if(peekParse() === "-"){
					advanceParse()
					const prim = primary()
					return new Neg(prim)
				}
				return primary()
			}
			const exponentiation = binaryOperationHelper(Exp , negation      , "^")
			const multiplication = binaryOperationHelper(Mult, exponentiation, "*")
			const division       = binaryOperationHelper(Div , multiplication, "/")
			const subtraction    = binaryOperationHelper(Sub , division      , "-")
			const addition       = binaryOperationHelper(Add , subtraction   , "+")
			
			const repEx = repeaterExpression()
			if(!atEnd())throw Error(`Could not parse entire expression. '${tokens.slice(parserCount).map(t => t.toString()).reduce((old,cur) => old.concat(cur))}' left`)
			return repEx
		}

		/*
		SequenceExpression -> (Digits | Digits RepeaterExpression)* ("." (Digits | Digits RepeaterExpression)*)? 
		Digits -> [0-9]* | "("[0-9]*")"
		RepeaterExpression -> "_[" ... "]"


		*/
		function parseSequenceExpression(tokens : Token[]){
			let parserCount = 0
			const atEnd = () => parserCount >= tokens.length
			const advanceParse = () => tokens[parserCount++]
			const peekParse = () => tokens[parserCount]

			const left : (DigitSeq | Repeater)[] = []
			const right : (DigitSeq | Repeater)[] = []
			let currentSide = left

			const checkRepeater = (currentToken : {tokenType : "Digits", token : Digits}) => {
				const nextToken = peekParse()
				if(nextToken.tokenType === "RepeaterExpression"){
					currentSide.push(new Repeater(currentToken.token, parseRepeaterExpression(nextToken.token)))
					advanceParse()
				}
				else currentSide.push(new DigitSeq(currentToken.token))
			}

			while(!atEnd()){
				const token = advanceParse()
				switch(token.tokenType){
					case ".":{
						if(currentSide === right) throw new Error("Found multiple dots in a sequence expression")
						currentSide = right
						break
					}
					case "(" :
						if(atEnd() || peekParse().tokenType !== "Digits")
							throw Error("Expected digits after '('")
						const digits = advanceParse() as {tokenType : "Digits", token : Digits}
						if(!atEnd() && peekParse().tokenType === ")"){
							advanceParse()
							checkRepeater(digits)
						}
						else throw Error("Bracketed digits are unclosed")
						break
					case "Digits":{
						if(atEnd()){
							currentSide.push(new DigitSeq(token.token))
							break
						}
						checkRepeater(token)
						break
					}
					case "RepeaterExpression": throw Error(`Found repeater expression without any digits beforehand. Instead found ${parserCount < 2 ? "nothing" : "'" + tokens[parserCount-2].token.toString() + "'"}`)
					case ")": throw Error("Found closing bracket without opening bracket")
				}
			}
			return new SequenceExpression(left,right)
		}
		return parseSequenceExpression(tokens)
	}
	return parse(scan())
}