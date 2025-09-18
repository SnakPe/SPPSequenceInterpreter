import { Digits, VariableText } from "../../Parsing/Parser.js";
import { Add, Const, Div, Exp, Expression, Mult, SigmaSum, Var } from "../Expression.js";
import { RepeaterExpression } from "../Repeater.js";
import { SequenceExpression } from "../Sequence.js";

export function interpretSeqEx(seqEx : SequenceExpression, base : number = 10) : Expression{
	let cummulativeReqEx : RepeaterExpression|undefined = undefined
	let result : Expression|undefined = undefined
	function addIfExists<E extends Expression|undefined>(original : E, toAdd : Exclude<E,undefined>) : Add | Exclude<E,undefined>{
		return original === undefined ? toAdd : new Add(original,toAdd)
	}
	const digitsToNumber = (d : Digits) => d.reduce<number>((prev, curr) => 10*prev+curr, 0) 
	for(const e of seqEx.left.slice().reverse()){
		switch(e.type){
			case "Digits":{
				const cum : Expression = new Mult(new Const(digitsToNumber(e.digits)),new Exp(new Const(base),cummulativeReqEx??new Const(0)))
				cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx, new Const(e.digits.length-1))
				result = addIfExists<Expression|undefined>(result, cum)
				break
			}
			case "Repeater":{
				// cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx,new Const(e.repeatee.length-1))
				result = addIfExists<Expression|undefined>(result, new SigmaSum(
					new Const(1),
					e.repeatExpression,
					new Mult(new Const(digitsToNumber(e.repeatee)), new Mult(new Exp(new Const(base),cummulativeReqEx ?? new Const(0)), new Exp(new Const(base), new Mult(new Const(e.repeatee.length), new Var("i")))))
					//Sum((digits)*(10^expr*10^i))
				))
				cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx, new Mult(new Const(e.repeatee.length),e.repeatExpression))
				break
			}
		}
	}
	// The same as above but instead of Mult we use Div. This needs to be written more cleanly
	cummulativeReqEx = undefined
	for(const e of seqEx.right){
		switch(e.type){
			case "Digits":{
				cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx, new Const(e.digits.length))
				result = addIfExists<Expression|undefined>(result, new Div(new Const(digitsToNumber(e.digits)),new Exp(new Const(base),cummulativeReqEx)))
				break
			}
			case "Repeater":{
				// cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx,new Const(e.repeatee.length-1))
				result = addIfExists<Expression|undefined>(result, new SigmaSum(
					new Const(1),
					e.repeatExpression,
					new Div(new Const(digitsToNumber(e.repeatee)), new Mult(new Exp(new Const(base),cummulativeReqEx ?? new Const(0)), new Exp(new Const(base), new Mult(new Const(e.repeatee.length), new Var("i")))))
					//Sum((digits)/(10^expr*10^i))
				))
				cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx, new Mult(new Const(e.repeatee.length),e.repeatExpression))
				break
			}
		}
	}
	if(result === undefined) throw Error("Found empty Sequent")
	return result
}
export function assignValue(interpretation : Map<VariableText,number>, expr : Expression) : number{
	switch (expr.type) {
		case "Variable":{
			if(!interpretation.has(expr.name))throw Error(`Found variable ${expr.name} in expression, but not in interpretation`)
			return interpretation.get(expr.name)!
			break
		}
		case "Constant":{
			return expr.value
			break
		}
		case "Negation":{
			return -assignValue(interpretation, expr.subExpression)
		}
		case "Addition":{
			return assignValue(interpretation,expr.left) + assignValue(interpretation,expr.right)
			break
		}
		case "Subtraction":{
			return assignValue(interpretation,expr.left) - assignValue(interpretation,expr.right)
			
			break
		}
		case "Multiplication":{
			return assignValue(interpretation,expr.left) * assignValue(interpretation,expr.right)
			
			break
		}
		case "Division":{
			return (assignValue(interpretation,expr.left) / assignValue(interpretation,expr.right))
			
			break
		}
		case "Exponentiation":{
			return assignValue(interpretation,expr.left) ** assignValue(interpretation,expr.right)
			break
		}
		case "SigmaAddition":{
			let sum = 0
			const endTerm = assignValue(interpretation,expr.indexEndTerm)
			const startTerm = assignValue(interpretation,expr.indexStartTerm)
			for(let i = startTerm; i <= endTerm; i++){
				interpretation.set("i",i)
				sum += assignValue(interpretation,expr.sumTerm)
			}
			// interpretation.delete("i")
			return sum
			break
		}
	}
} 
