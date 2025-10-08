import { VariableText } from "../../Parsing/Parser.js";
import { Expression } from "../Expression.js";
import { SequenceExpression } from "../Sequence.js";

export function collectVariablesFromExpression(exp : Expression) : Set<VariableText>{

	switch(exp.type){
		case "Variable":
			return exp.name === "i" ? new Set() : new Set([exp.name])
		case "Constant": 
			return new Set()
		case "Negation":
			return collectVariablesFromExpression(exp.subterm)
		case "Addition":
		case "Multiplication":
		case "Subtraction":
		case "Division":
		case "Exponentiation":
			return exp.subterms.reduce((acc,cur) => acc.union(collectVariablesFromExpression(cur)), new Set<VariableText>())
				.union(collectVariablesFromExpression(exp.right))
		case "SigmaAddition":
			return collectVariablesFromExpression(exp.indexEndTerm)
				.union(collectVariablesFromExpression(exp.indexStartTerm))
				.union(collectVariablesFromExpression(exp.sumTerm))
	}
}
export function collectVariables(seq : SequenceExpression) : Set<VariableText>{
	const variables : Set<VariableText> = new Set()
	for(const seqPart of seq){
		if(seqPart.type !== "Repeater")continue
		variables.union(collectVariablesFromExpression(seqPart.repeatExpression))
	}
	return variables
}