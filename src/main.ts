import { readSeqEx, VariableText } from "./Parsing/Parser.js"
import { printExpressionAsMathML, printSequenceExpressionAsMathML } from "./Sequences/Functions/Printer.js"
import { assignValue, interpretSeqEx } from "./Sequences/Functions/Semantics.js"
import { simplifyExpression } from "./Sequences/Functions/Simplifier.js"
import { collectVariablesFromExpression } from "./Sequences/Functions/VariableCollector.js"
import { Sequence, SequenceExpression } from "./Sequences/Sequence.js"

function createInputBorder(){
	const b = document.createElement("div")
	b.classList.add("inputBorder")
	return b
}


onload = () => {
	const sequenceInput = document.getElementById("SequenceInput") as HTMLInputElement
	const parserOutput = document.getElementById("ParserOutput") as HTMLDivElement
	const sequenceOutput = document.getElementById("SequenceOutput") as HTMLDivElement
	const simplifierOutput = document.getElementById("SimplifierOutput") as HTMLDivElement
	const variableAssigner = document.getElementById("VariableAssigner") as HTMLDivElement
	const valueOutput = document.getElementById("ValueOutput") as HTMLDivElement

	/* INPUT HANDLING */
	// Sequence Input
	function readUserInput<E extends Event>(ev? : E) : SequenceExpression | undefined{
		ev?.preventDefault()
		parserOutput.innerHTML = ""
		let seqEx : SequenceExpression | undefined = undefined
		try{
			seqEx = readSeqEx(sequenceInput.value)
			parserOutput.append(printSequenceExpressionAsMathML(seqEx))
		}catch(e){
			const error = document.createElement("div")
			error.classList.add("Error")
			if(Error.isError(e))error.innerHTML = `Error : ${e.message}`
			parserOutput.append(error)
		}
		return seqEx
	}
	function showSequence(seqEx : SequenceExpression){
		sequenceOutput.innerHTML = ""
		const seq = interpretSeqEx(seqEx)
		sequenceOutput.append(printExpressionAsMathML(seq))
		return seq
	}
	function showSimplification(seq : Sequence){
		simplifierOutput.innerHTML = ""
		const simplifiedExpression = simplifyExpression(seq)
		simplifierOutput.append(printExpressionAsMathML(simplifiedExpression))
		return simplifiedExpression
	}

	//Variable Assignment
	const handleVarInput = (seq : Sequence, varsToInputElems : [VariableText,HTMLInputElement][]) => () => {
		const interpretation : Map<VariableText,number> = new Map(varsToInputElems.map(([val,elem]) => [val,elem.valueAsNumber]))
		valueOutput.innerHTML = assignValue(interpretation,seq).toString()
	}
	const createVariableAssignmentInput = (seq : Sequence) => {
		const variables = collectVariablesFromExpression(seq)
		const varsToInputElems : [VariableText,HTMLInputElement][] = []
		variableAssigner.innerHTML = ""
		for(const variable of variables){
			const id = `VariableInput:${variable}`

			const varLabel = document.createElement("label")
			varLabel.innerText = `${variable}:`
			varLabel.htmlFor = id
			
			const varInputBorder = createInputBorder()
			const varInputField = document.createElement("input")
			varInputField.id = id
			varInputField.type = "number"
			varInputField.onchange = handleVarInput(seq, varsToInputElems)
			varInputField.onkeyup = handleVarInput(seq, varsToInputElems)
			varsToInputElems.push([variable,varInputField])
			varInputBorder.appendChild(varInputField)

			const varInput = document.createElement("div")
			varInput.append(varLabel,varInputBorder)

			variableAssigner.append(varInput)
		}
	}
	
	const handleSeqExInput = () => {
		
		const seqEx = readUserInput()
		if(seqEx === undefined) return
		const seq = showSequence(seqEx)
		showSimplification(seq)
		createVariableAssignmentInput(seq)
	}
	sequenceInput.onkeyup = handleSeqExInput
	handleSeqExInput()

}