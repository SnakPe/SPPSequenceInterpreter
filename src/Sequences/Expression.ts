import { MonsterFloat } from "monsterfloat"
import { VariableText } from "../Parsing/Parser.js"
import { RepeaterExpression } from "./Repeater.js"


export type Expression = Var | Const | Neg | BinaryExpression | SigmaSum
export type BinaryExpression = Add | Sub | Mult | Div | Exp
export type NewVar<OldVars extends VariableText[],Var extends VariableText> = 
	OldVars extends [infer OldVar extends VariableText, ...(infer Rest extends VariableText[])] ? 
		OldVar extends Var ? 
			never
		: NewVar<Rest,Var>
	: OldVars extends [] ? 
		Var 
	: never

export class Const{
	readonly type : "Constant" = "Constant"

	constructor(
		public readonly value : MonsterFloat
	){

	}
}

export class Var{
	readonly type : "Variable" = "Variable"

	constructor(
		public readonly name : VariableText
	){

	}
}

export class Neg{
	readonly type : "Negation" = "Negation"
	constructor(
		public readonly subterm : Expression
	){

	}
}


type Associativity<
	Operator extends AbstractBinaryOperator = AbstractBinaryOperator,
> = {
	left : (subterms : Expression[]) => Expression
	right : (subterms : Expression[]) => Expression
}
function leftAssociativity<
	Operator extends AbstractBinaryOperator["thisConstructor"] = AbstractBinaryOperator["thisConstructor"],
>(op : Operator) : Associativity{
	return{
		left : (subterms) => subterms.length === 2 ? subterms[0] : op(...subterms.slice(0,-1)) as Expression,
		right: (subterms) => subterms.at(-1)!,
	}
}
function rightAssociativity<
	Operator extends AbstractBinaryOperator = AbstractBinaryOperator,
>(op : Operator["thisConstructor"]) : Associativity{
	return{
		left : (subterms) => subterms.at(0)!,
		right: (subterms) => subterms.length === 2 ? subterms[1] : op(...subterms.slice(1)) as Expression,
	}
}

export abstract class AbstractBinaryOperator{
	abstract readonly type : string 
	readonly subterms: Expression[]
	constructor(
		...subterms : Expression[]
	){
		if(subterms.length < 2) throw Error("Binary operator needs at least two subterms")
		this.subterms = subterms
	}
	abstract thisConstructor(...subs : Expression[]) : this
	protected readonly ass : Associativity<this> = rightAssociativity(this.thisConstructor)

	get left() : Expression{
		return this.ass.left(this.subterms)
	}
	get right() : Expression{
		return this.ass.right(this.subterms)
	}
}



export class Add extends AbstractBinaryOperator{
	readonly type : "Addition" = "Addition"
	override thisConstructor(...subs: Expression[]): this {
		return new Add(...subs) as this
	}
}
export class Sub extends AbstractBinaryOperator{
	readonly type : "Subtraction" = "Subtraction"
	override thisConstructor(...subs: Expression[]): this {
		return new Sub(...subs) as this
	}
	protected override ass : Associativity<Sub> = leftAssociativity(this.thisConstructor)
}
export class Div extends AbstractBinaryOperator{
	readonly type : "Division" = "Division"
	override thisConstructor(...subs: Expression[]): this {
		return new Div(...subs) as this
	}
}
export class Mult extends AbstractBinaryOperator{
	readonly type : "Multiplication" = "Multiplication"
	override thisConstructor(...subs: Expression[]) : this {
		return new Mult(...subs) as this
	}
}
export class Exp extends AbstractBinaryOperator{
	readonly type : "Exponentiation" = "Exponentiation"
	override thisConstructor(...subs: Expression[]): this {
		return new Exp(...subs) as this
	}
}

export class SigmaSum{
	readonly type : "SigmaAddition" = "SigmaAddition"

	constructor(
		public readonly indexStartTerm : RepeaterExpression,
		public readonly indexEndTerm : RepeaterExpression,
		public readonly sumTerm : RepeaterExpression,
	){

	}
}
export type BinaryOperatorConstructor = typeof Add | typeof Mult | typeof Sub | typeof Div | typeof Exp