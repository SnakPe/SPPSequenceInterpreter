import { Digits, Letter, Operator, VariableText } from "../../Parsing/Parser.js";
import { BinaryExpression, Expression } from "../Expression.js";
import { SequenceExpression } from "../Sequence.js";


const printDigits = (ds : Digits) => `(${ds.map(n => n.toString()).reduce((prev,curr) => prev.concat(curr))})`
const removeOuterBracketsIfExistMathML = (ml : MathMLElement) => {
	const first = ml.firstChild
	const last = ml.lastChild
	if(first !== null && first.nodeName === "mo" && first.textContent === "(" &&
		 last  !== null && last .nodeName === "mo" && last .textContent === ")"
	){
		ml.removeChild(first)
		ml.removeChild(last)
	}
}
export function printSequenceExpression(seqEx : SequenceExpression) : string{
	const stringBuilder : string[] = []
	for(const e of seqEx){
		switch(e.type){
			case "Digits":
				stringBuilder.push(printDigits(e.digits))
				break
			case "Dot":
				stringBuilder.push(".")
				break
			case "Repeater":
				stringBuilder.push(printDigits(e.repeatee), "_[", printExpressionAsString(e.repeatExpression), "]")
				break
		}
	}
	return stringBuilder.join("")
}
export function printExpressionAsString(repEx : Expression) : string{
	const printBinOP = (left : Expression, right : Expression, op : Operator) =>
		`(${printExpressionAsString(left)} ${op} ${printExpressionAsString(right)})`
	switch(repEx.type){
		case "Variable":
			return repEx.name
		case "Constant":
			return repEx.value.toString()
		case "Negation":
			return `-${printExpressionAsString(repEx.subExpression)}`
		case "Addition":
			return printBinOP(repEx.left,repEx.right,"+")
		case "Subtraction":
			if(repEx.left.type === "Constant" && repEx.left.value === 0) 
				return `(-${printExpressionAsString(repEx.right)})`
			return printBinOP(repEx.left,repEx.right,"-")
		case "Multiplication":
			return printBinOP(repEx.left,repEx.right,"*")
		case "Division":
			return printBinOP(repEx.left,repEx.right,"/")
		case "Exponentiation":
			return printBinOP(repEx.left,repEx.right,"^")
		case "SigmaAddition": throw "todo"
		
	}
}

export function printExpressionAsMathML(ex : Expression) : MathMLElement {
	function helper(ex : Expression) : MathMLElement{
		const printBinOP = (subExpressions : [Expression, ...Expression[]], op? : string, ) =>{
			const combinedML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mrow")
			
			const leftBracketML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mo")
			leftBracketML.innerHTML = "("
			combinedML.append(leftBracketML)

			for(const subExp of subExpressions){
				combinedML.append(helper(subExp))
				if(op !== undefined){
					const opML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mo")
					opML.innerHTML = op
					combinedML.append(opML)
				}
			}
			combinedML.removeChild(combinedML.lastChild!)

			const rightBracketML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mo")
			rightBracketML.innerHTML = ")"
			combinedML.append(rightBracketML)
			return combinedML
		}
		function collectSubExpressions(ex : BinaryExpression) : [Expression, ...Expression[]]{
			const result : [Expression, ...Expression[]] = [ex.right]
			let left = ex.left
			while(left.type === ex.type){
				result.unshift(left.right)
				left = left.left
			}
			result.unshift(left)
			return result
		}
		switch(ex.type){
			case "Variable":{
				const varML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mi")
				varML.innerHTML = ex.name
				return varML
			}
			case "Constant":{
				const constML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mn")
				constML.innerHTML = ex.value.toString()
				return constML
			}
			case "Negation":{
				const minusML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mo")
				minusML.innerHTML = "-"
				const negationML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mrow")
				negationML.append(minusML,printExpressionAsMathML(ex.subExpression))
				return negationML
			}
			case "Addition":{
				return printBinOP(collectSubExpressions(ex), "+", )
			}
			case "Subtraction":{
				return printBinOP(collectSubExpressions(ex), "-", )
			}
			case "Multiplication":{
				return printBinOP(collectSubExpressions(ex), "·", )
			}
			case "Division":{
				const leftML = helper(ex.left)
				const rightML = helper(ex.right)
				const divisionML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mfrac")
				divisionML.append(
					leftML,
					rightML
				)
				return divisionML
			}
			case "Exponentiation":{
				const leftML = helper(ex.left)
				const rightML = helper(ex.right)
				const exponentiationML = document.createElementNS("http://www.w3.org/1998/Math/MathML","msup")
				exponentiationML.append(
					leftML,
					rightML
				)
				return exponentiationML
			}
			case "SigmaAddition":{
				const indexEndTermML = helper(ex.indexEndTerm)
				indexEndTermML.classList.add("IndexEndTerm")
				const indexVarML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mi")
				indexVarML.innerHTML = "i"
				const indexStartTermML = helper(ex.indexStartTerm)
				const sumTermML = helper(ex.sumTerm)

				const sigmaML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mo")
				sigmaML.innerHTML = "∑"
				const equalsML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mo")
				equalsML.innerHTML = "="
				
				const belowSigmaML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mrow")
				belowSigmaML.append(
					indexVarML,
					equalsML,
					indexStartTermML
				)
				const sigmaSumLeftML = document.createElementNS("http://www.w3.org/1998/Math/MathML","munderover")
				sigmaSumLeftML.append(
					sigmaML,
					belowSigmaML,
					indexEndTermML
				)
				const combinedML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mrow")
				combinedML.append(sigmaSumLeftML,sumTermML)
				return combinedML
			}
		}
	}

	const exML = helper(ex)
	removeOuterBracketsIfExistMathML(exML)
	return exML
}
export function printSequenceExpressionAsMathML(seqEx : SequenceExpression) : MathMLElement{
	const result = document.createElementNS("http://www.w3.org/1998/Math/MathML","mrow")

	for(const e of seqEx){
		switch(e.type){
			case "Digits":{
				const digitsML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mn")
				digitsML.classList.add("Digits")
				digitsML.innerHTML = printDigits(e.digits)
				result.append(digitsML)
				break
			}
			case "Repeater":{
				const repeateeML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mn")
				repeateeML.innerHTML = printDigits(e.repeatee)
				repeateeML.classList.add("Digits", "Repeatee")

				const repeaterExpressionML = printExpressionAsMathML(e.repeatExpression)
				repeaterExpressionML.classList.add("RepeaterExpression")

				const repeaterML = document.createElementNS("http://www.w3.org/1998/Math/MathML","msub")
				repeaterML.classList.add("Repeater")
				repeaterML.append(
					repeateeML,
					repeaterExpressionML,
				)
				result.append(repeaterML)
				break
			}
			case "Dot": {
				const dotML = document.createElementNS("http://www.w3.org/1998/Math/MathML","mn")
				dotML.innerHTML = "."
				dotML.classList.add("Dot")
				result.append(dotML)
				break
			} 
		}
	}

	return result
}
const letterToMathItalic = (letters : VariableText) => {
 return String.fromCharCode(...letters.split("").map(letter => letter.charCodeAt(0)))
}