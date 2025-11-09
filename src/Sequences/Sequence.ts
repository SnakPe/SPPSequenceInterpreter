import { Digits, VariableText } from "../Parsing/Parser.js"
import { Expression } from "./Expression.js"
import { RepeaterExpression } from "./Repeater.js"



export class SequenceExpression implements Iterable<DigitSeq|Repeater|{type : "Dot"}>{
	constructor(
		public readonly left : (DigitSeq|Repeater)[],
		public readonly right : (DigitSeq|Repeater)[],
	){

	}
	*[Symbol.iterator](): Iterator<DigitSeq | Repeater | {type : "Dot"}, any, any> {
		for(const e of this.left)yield e
		if(this.right.length !== 0)yield {type : "Dot"}
		for(const e of this.right)yield e
	}

};

export class DigitSeq{
	readonly type : "Digits" = "Digits"
	constructor(
		public readonly digits : Digits
	){

	}
}
export class Repeater{
	readonly type : "Repeater" = "Repeater"
	constructor(
		public readonly repeatee : Digits,
		public readonly repeatExpression : RepeaterExpression
	){

	}
}


export type Sequence = Expression







