import { VariableText } from "../Parsing/Parser.js";
import { Var, Const, Add, Sub, Mult, Div, Exp, Neg } from "./Expression.js";

export type RepeaterExpression = 
	| Var	
	| Const
	| Neg
	| Add
	| Sub
	| Mult
	| Div
	| Exp