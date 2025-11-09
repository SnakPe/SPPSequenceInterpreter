import { MonsterFloat } from "monsterfloat";
import { Digits, VariableText } from "../../Parsing/Parser.js";
import { Add, Const, Div, Exp, Expression, Mult, SigmaSum, Sub, Var } from "../Expression.js";
import { RepeaterExpression } from "../Repeater.js";
import { SequenceExpression } from "../Sequence.js";

export function interpretSeqEx(seqEx : SequenceExpression, base : MonsterFloat = new MonsterFloat(10n,1n)) : Expression{
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
	const digitsToMonsterFloat = (d : Digits) => MonsterFloat.from(d.reduce<number>((prev, curr) => 10*prev+curr, 0))
	const zero = new Const(new MonsterFloat(0n,1n))
	const one = new Const(new MonsterFloat(1n,1n))
	for(const e of seqEx.left.slice().reverse()){
		switch(e.type){
			case "Digits":{
				const eLength = MonsterFloat.from(e.digits.length)
				const oldCum : Expression = new Mult(new Const(digitsToMonsterFloat(e.digits)),new Exp(new Const(base),cummulativeReqEx??zero))
				cummulativeReqEx = addIfExistsReversed<RepeaterExpression|undefined>(cummulativeReqEx, new Const(eLength))
				result = addIfExistsReversed<Expression|undefined>(result, oldCum)
				break
			}
			case "Repeater":{
				const eLength = MonsterFloat.from(e.repeatee.length)
				// cummulativeReqEx = addIfExistsReversed<RepeaterExpression|undefined>(cummulativeReqEx,new Const(e.repeatee.length-1))
				result = addIfExistsReversed<Expression|undefined>(result, new SigmaSum(
					one,
					e.repeatExpression,
					//(digits)*(10^expr*10^(length*i-1))
					new Mult(
						new Const(digitsToMonsterFloat(e.repeatee)),
						new Mult(
							new Exp(new Const(base),cummulativeReqEx ?? zero), //10^expr
							new Exp(new Const(base), new Mult(new Const(eLength), new Sub(new Var("i"), one))) //10^(length*i-1)
						)
					)
				))
				cummulativeReqEx = addIfExistsReversed<RepeaterExpression|undefined>(cummulativeReqEx, new Mult(new Const(eLength),e.repeatExpression))
				break
			}
		}
	}
	// The same as above but instead of Mult we use Div. This needs to be written more cleanly
	cummulativeReqEx = undefined
	for(const e of seqEx.right){
		switch(e.type){
			case "Digits":{
				const eLength = MonsterFloat.from(e.digits.length)

				cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx, new Const(eLength))
				result = addIfExists<Expression|undefined>(result, new Div(new Const(digitsToMonsterFloat(e.digits)),new Exp(new Const(base),cummulativeReqEx)))
				break
			}
			case "Repeater":{
				const eLength = MonsterFloat.from(e.repeatee.length)
				// cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx,new Const(e.repeatee.length-1))
				result = addIfExists<Expression|undefined>(result, new SigmaSum(
					one,
					e.repeatExpression,
					//(digits)/(10^expr*10^(length*i))
					new Div(
						new Const(digitsToMonsterFloat(e.repeatee)), new Mult(new Exp(new Const(base),cummulativeReqEx ?? zero), new Exp(new Const(base), new Mult(new Const(eLength), new Var("i")))))
					
				))
				cummulativeReqEx = addIfExists<RepeaterExpression|undefined>(cummulativeReqEx, new Mult(new Const(eLength),e.repeatExpression))
				break
			}
		}
	}
	if(result === undefined){
		//Empty sequent
		return zero
	}
	return result
}
export function assignValue(interpretation : Map<VariableText,MonsterFloat>, expr : Expression) : MonsterFloat{
	function binTypeToOperator(binType : "Addition" | "Subtraction" | "Multiplication" | "Division" | "Exponentiation"){
		return (acc : MonsterFloat,cur : MonsterFloat) => {
			switch(binType){
				case "Addition":
					return acc.a(cur)
				case "Subtraction":
					return acc.s(cur)
				case "Multiplication":
					return acc.m(cur)
				case "Division":
					return acc.d(cur)
				case "Exponentiation":
					return acc.p(cur)
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
			return assignValue(interpretation, expr.subterm).multiply(-1)
		}
		case "Addition":
		case "Subtraction":
		case "Multiplication":
		case "Division":
		case "Exponentiation":{
			return expr.subterms.map(sub => assignValue(interpretation,sub)).reduce(binTypeToOperator(expr.type))
		}
		case "SigmaAddition":{
			let sum = new MonsterFloat(0n,1n)
			const endTerm = assignValue(interpretation,expr.indexEndTerm)
			const startTerm = assignValue(interpretation,expr.indexStartTerm)
			const one = new MonsterFloat(1n,1n)
			for(let i = startTerm; i.isLessThanOrEqual(endTerm); i = i.add(one)){
				interpretation.set("i",i)
				sum = sum.a(assignValue(interpretation,expr.sumTerm))
			}
			// interpretation.delete("i")
			return sum
			break
		}
	}
} 
