import { splitByFilter } from "../../helper.js";
import { Add, Const, Div, Exp, Expression, Mult, Neg, SigmaSum } from "../Expression.js";
import { RepeaterExpression } from "../Repeater.js";
import { assignValue } from "./Semantics.js";
import { collectVariablesFromExpression } from "./VariableCollector.js";



export function simplifyExpression<E extends Expression>(ex : E) : Expression{
	
	function associativeCommutativeBinHelper(ex : Add | Mult){
		let neutralElement : 0 | 1
		let AssBinOp : typeof Add | typeof Mult
		let op : (acc : number, cur : Const) => number

		switch(ex.type){
			case "Addition":
				neutralElement = 0
				AssBinOp = Add
				op = (a,c) => a+c.value
				break
			case "Multiplication":
				neutralElement = 1
				AssBinOp = Mult
				op = (a,c) => a*c.value
		}

		const simplifiedSubterms = ex.subterms.map(subEx => simplifyExpression(subEx))
		// const [constants,nonconstants] = simplifiedSubterms.reduce<[Const[],Expression[]]>(([consts,nonconsts], cur) => cur.type === "Constant" ? [consts.concat(cur),nonconsts] : [consts,nonconsts.concat(cur)],[[],[]])
		const [constants,nonconstants] = splitByFilter(simplifiedSubterms, (sub) => sub.type === "Constant")

		const constantPart = new Const(constants.reduce(op,neutralElement))
		if(nonconstants.length === 0) return constantPart
		if(constantPart.value === neutralElement){ 
			if(nonconstants.length === 1) return nonconstants[0]
			return new AssBinOp(...nonconstants)
		}
		if(ex.type === "Multiplication" && constantPart.value === 0){
			return constantPart
		}
		return new AssBinOp(constantPart,...nonconstants)
	} 

	switch (ex.type) {
		case "Constant":
		case "Variable":{
			return ex
		}
		case "Negation":{
			const sub = simplifyExpression(ex.subterm)
			if(sub.type === "Constant") return new Const(-sub.value)
			if(sub.type === "Negation") return sub.subterm
			return new Neg(sub)
		}
		case "Addition":
		case "Multiplication":
			return associativeCommutativeBinHelper(ex)
		case "Subtraction":{
			// const l = simplifyExpression(ex.left)
			// const r = simplifyExpression(ex.right)
			// if(l.type === "Constant" && r.type === "Constant") return new Const(l.value-r.value)
			// if(l.type === "Constant" && l.value === 0) return new Neg(r)
			// if(r.type === "Constant" && r.value === 0) return l
			// if(r.type === "Negation") return new Add(l,r.subterm)
			// return new Sub(l,r)

			// a-b-...-z = a+(-b)+...+(-z)
			const firstSub = simplifyExpression(ex.subterms[0])
			const [negatedConstants, negatedNonconstants] = splitByFilter(ex.subterms.slice(1).map(sub => simplifyExpression(new Neg(sub))),(t) => t.type==="Constant")
			const constantPart = new Const(negatedConstants.reduce((acc,cur) => acc+cur.value,0))
			if(firstSub.type==="Constant") constantPart.value += firstSub.value
			else negatedNonconstants.push(firstSub)
			if(negatedNonconstants.length === 0) return constantPart
			if(constantPart.value === 0){ 
				if(negatedNonconstants.length === 1) return negatedNonconstants[0]
				return new Add(...negatedNonconstants)
			}
			return new Add(constantPart, ...negatedNonconstants)

		}
		case "Division":{
			const l = simplifyExpression(ex.left)
			const r = simplifyExpression(ex.right)
			if(l.type === "Constant" && r.type === "Constant") return new Const(l.value/r.value)
			if(l.type === "Constant" && l.value === 0) return new Const(0)
			if(r.type === "Constant" && r.value === 1) return l
			return new Div(l,r)
		}
		case "Exponentiation":{
			const l = simplifyExpression(ex.left)
			const r = simplifyExpression(ex.right)
			if(l.type === "Constant" && r.type === "Constant") return new Const(l.value**r.value)
			if(l.type === "Constant" && l.value === 0) return new Const(0)
			if(r.type === "Constant" && r.value === 0) return new Const(1)
			if(r.type === "Constant" && r.value === 1) return l
			if(l.type === "Constant" && l.value === 1) return new Const(1)
			return new Exp(l,r)
		}
		case "SigmaAddition":{
			// the start term should always by Const(1). We simplify anyways...
			const startTerm = simplifyExpression(ex.indexStartTerm) as RepeaterExpression
			const endTerm = simplifyExpression(ex.indexEndTerm) as RepeaterExpression
			const sumTerm = simplifyExpression(ex.sumTerm) as RepeaterExpression

			const varsInSumTerm = collectVariablesFromExpression(sumTerm)

			if(startTerm.type !== "Constant" || endTerm.type !== "Constant" || (varsInSumTerm.size === 1 && !varsInSumTerm.has("i") || varsInSumTerm.size > 1))
				return new SigmaSum(startTerm, endTerm, sumTerm)
			
			let sum = 0
			for(let i = startTerm.value; i <= endTerm.value; i++)
				sum += assignValue(new Map([["i",i]]), sumTerm)
			return new Const(sum)
		}
	}
}