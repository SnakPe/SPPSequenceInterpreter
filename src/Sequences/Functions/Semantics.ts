import { Digits, VariableText } from "../../Parsing/Parser.js";
import { Add, Const, Div, Exp, Expression, Mult, SigmaSum, Sub, Var } from "../Expression.js";
import { RepeaterExpression } from "../Repeater.js";
import { SequenceExpression } from "../Sequence.js";

export function interpretSeqEx(seqEx : SequenceExpression, base : number = 10) : Expression{
	let cummulativeReqEx : RepeaterExpression|undefined = undefined
	let result : Expression|undefined = undefined
	function addIfExists<E extends Expression|undefined>(original : E, toAdd : Exclude<E,undefined>) : Add | Exclude<E,undefined>{
		if(original === undefined) return toAdd 
		if(original.type === "Addition") return new Add(...original.subterms, toAdd)
		return new Add(original,toAdd)
	}
	function addIfExistsReversed<E extends Expression|undefined>(original : E, toAdd : Exclude<E,undefined>) : Add | Exclude<E,undefined>{
		if(original === undefined) return toAdd 
		if(original.type === "Addition") return new Add(toAdd, ...original.subterms)
		return new Add(toAdd,original)
	}
	const digitsToNumber = (d : Digits) => d.reduce<number>((prev, curr) => 10*prev+curr, 0)
	for(const e of seqEx.left.slice().reverse()){
		switch(e.type){
			case "Digits":{
				const oldCum : Expression = new Mult(new Const(digitsToNumber(e.digits)),new Exp(new Const(base),cummulativeReqEx??new Const(0)))
				cummulativeReqEx = addIfExistsReversed<RepeaterExpression|undefined>(cummulativeReqEx, new Const(e.digits.length))
				result = addIfExistsReversed<Expression|undefined>(result, oldCum)
				break
			}
			case "Repeater":{
				// cummulativeReqEx = addIfExistsReversed<RepeaterExpression|undefined>(cummulativeReqEx,new Const(e.repeatee.length-1))
				result = addIfExistsReversed<Expression|undefined>(result, new SigmaSum(
					new Const(1),
					e.repeatExpression,
					//(digits)*(10^expr*10^(length*i-1))
					new Mult(
						new Const(digitsToNumber(e.repeatee)),
						new Mult(
							new Exp(new Const(base),cummulativeReqEx ?? new Const(0)), //10^expr
							new Exp(new Const(base), new Mult(new Const(e.repeatee.length), new Sub(new Var("i"), new Const(1)))) //10^(length*i-1)
						)
					)
				))
				cummulativeReqEx = addIfExistsReversed<RepeaterExpression|undefined>(cummulativeReqEx, new Mult(new Const(e.repeatee.length),e.repeatExpression))
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
					//(digits)/(10^expr*10^(length*i))
					new Div(
						new Const(digitsToNumber(e.repeatee)), new Mult(new Exp(new Const(base),cummulativeReqEx ?? new Const(0)), new Exp(new Const(base), new Mult(new Const(e.repeatee.length), new Var("i")))))
					
				))
				cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx, new Mult(new Const(e.repeatee.length),e.repeatExpression))
				break
			}
		}
	}
	if(result === undefined){
		//Empty sequent
		return new Const(0)
	}
	return result
}
export function assignValue(interpretation : Map<VariableText,number>, expr : Expression) : number{
	function binTypeToOperator(binType : "Addition" | "Subtraction" | "Multiplication" | "Division" | "Exponentiation"){
		return (acc : number,cur : number) => {
			switch(binType){
				case "Addition":
					return acc + cur
				case "Subtraction":
					return acc - cur
				case "Multiplication":
					return acc * cur
				case "Division":
					return acc / cur
				case "Exponentiation":
					return acc ** cur
			}
		}
	}
	switch (expr.type) {
		case "Variable":{
			if(!interpretation.has(expr.name))throw Error(`Found variable ${expr.name} in expression, but not in interpretation`)
			return interpretation.get(expr.name)!
		}
		case "Constant":{
			return expr.value
		}
		case "Negation":{
			return -assignValue(interpretation, expr.subterm)
		}
		case "Addition":
		case "Subtraction":
		case "Multiplication":
		case "Division":
		case "Exponentiation":{
			return expr.subterms.map(sub => assignValue(interpretation,sub)).reduce(binTypeToOperator(expr.type))
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
