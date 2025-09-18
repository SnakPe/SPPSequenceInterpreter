import { Digits, VariableText } from "../Parsing/Parser.js"
import { Expression } from "./Expression.js"
import { RepeaterExpression } from "./Repeater.js"



export class SequenceExpression implements Iterable<DigitSeq|Repeater|{type : "Dot"}>{
	constructor(
		public left : (DigitSeq|Repeater)[],
		public right : (DigitSeq|Repeater)[],
	){

	}
	*[Symbol.iterator](): Iterator<DigitSeq | Repeater | {type : "Dot"}, any, any> {
		for(const e of this.left)yield e
		if(this.right.length !== 0)yield {type : "Dot"}
		for(const e of this.right)yield e
	}

};

export class DigitSeq{
	type : "Digits" = "Digits"
	constructor(
		public digits : Digits
	){

	}
}
export class Repeater{
	type : "Repeater" = "Repeater"
	constructor(
		public repeatee : Digits,
		public repeatExpression : RepeaterExpression
	){

	}
}


export type Sequence<BoundVariables extends VariableText[] = []> = Expression<BoundVariables>







