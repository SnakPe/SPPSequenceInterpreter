import { VariableText } from "../Parsing/Parser.js"
import { RepeaterExpression } from "./Repeater.js"


export type Expression<BoundVariables extends VariableText[] = VariableText[]>= Var | Const | Neg<BoundVariables> | BinaryExpression<BoundVariables> | SigmaSum<BoundVariables>
export type BinaryExpression<BoundVariables extends VariableText[] = VariableText[]>=Add<BoundVariables> | Sub<BoundVariables> | Mult<BoundVariables> | Div<BoundVariables> | Exp<BoundVariables>
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
		public value : number
	){

	}
}

export class Var{
	readonly type : "Variable" = "Variable"

	constructor(
		public name : VariableText
	){

	}
}

export class Neg<
	BoundVariables extends VariableText[] = VariableText[],
	SubExpression extends Expression<BoundVariables> = Expression<BoundVariables>,
>{
	readonly type : "Negation" = "Negation"
	constructor(
		public subExpression : SubExpression
	){

	}
}


export class Add<
	BoundVariables extends VariableText[] = VariableText[],
	Left extends Expression<BoundVariables> = Expression<BoundVariables>,
	Right extends Expression<BoundVariables> = Expression<BoundVariables>,
>{
	readonly type : "Addition" = "Addition"
	constructor(
		public left : Left,
		public right : Right,
	){

	}
}
export class Sub<
	BoundVariables extends VariableText[] = VariableText[],
	Left extends Expression<BoundVariables> = Expression<BoundVariables>,
	Right extends Expression<BoundVariables> = Expression<BoundVariables>,
>{
	readonly type : "Subtraction" = "Subtraction"
	constructor(
		public left : Left,
		public right : Right,
	){

	}
}
export class Div<
	BoundVariables extends VariableText[] = VariableText[],
	Left extends Expression<BoundVariables> = Expression<BoundVariables>,
	Right extends Expression<BoundVariables> = Expression<BoundVariables>,
>{
	readonly type : "Division" = "Division"
	constructor(
		public left : Left,
		public right : Right,
	){

	}
}
export class Mult<
	BoundVariables extends VariableText[] = VariableText[],
	Left extends Expression<BoundVariables> = Expression<BoundVariables>,
	Right extends Expression<BoundVariables> = Expression<BoundVariables>,
	>{
	readonly type : "Multiplication" = "Multiplication"
	constructor(
		public left : Left,
		public right : Right,
	){

	}
}
export class Exp<
	BoundVariables extends VariableText[] = VariableText[], 
	Left extends Expression<BoundVariables> = Expression<BoundVariables>, 
	Right extends Expression<BoundVariables> = Expression<BoundVariables>,
>{
	readonly type : "Exponentiation" = "Exponentiation"
	constructor(
		public left : Left,
		public right : Right,
	){

	}
}

export class SigmaSum<
	BoundVariables extends VariableText[] = VariableText[],
	// IndexVariable extends VariableText = VariableText,
>{
	readonly type : "SigmaAddition" = "SigmaAddition"

	constructor(
		public indexStartTerm : RepeaterExpression<BoundVariables>,
		public indexEndTerm : RepeaterExpression<BoundVariables>,
		public sumTerm : RepeaterExpression<BoundVariables>,
	){

	}
}