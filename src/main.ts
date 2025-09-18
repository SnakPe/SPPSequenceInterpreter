import { readSeqEx } from "./Parsing/Parser.js"
import { printExpressionAsMathML, printSequenceExpressionAsMathML } from "./Sequences/Functions/Printer.js"
import { interpretSeqEx } from "./Sequences/Functions/Semantics.js"
import { SequenceExpression } from "./Sequences/Sequence.js"


onload = () => {
	const sequenceInput = document.getElementById("SequenceInput") as HTMLInputElement
	const sequenceInputButton = document.getElementById("SequenceInputButton") as HTMLButtonElement
	const parserOutput = document.getElementById("ParserOutput") as HTMLDivElement
	const sequenceOutput = document.getElementById("SequenceOutput") as HTMLDivElement

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
		sequenceOutput.append(printExpressionAsMathML(interpretSeqEx(seqEx)))
	}

	const handleInput = () => {
		const seqEx = readUserInput()
		if(seqEx !== undefined) showSequence(seqEx)
	}
	sequenceInput.onkeyup = handleInput
	handleInput()

}