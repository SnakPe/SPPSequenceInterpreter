import { readSeqEx } from "./Parsing/Parser.js";
import { printExpressionAsMathML, printSequenceExpressionAsMathML } from "./Sequences/Functions/Printer.js";
import { interpretSeqEx } from "./Sequences/Functions/Semantics.js";
onload = () => {
    const sequenceInput = document.getElementById("SequenceInput");
    const sequenceInputButton = document.getElementById("SequenceInputButton");
    const parserOutput = document.getElementById("ParserOutput");
    const sequenceOutput = document.getElementById("SequenceOutput");
    function readUserInput(ev) {
        ev?.preventDefault();
        parserOutput.innerHTML = "";
        let seqEx = undefined;
        try {
            seqEx = readSeqEx(sequenceInput.value);
            parserOutput.append(printSequenceExpressionAsMathML(seqEx));
        }
        catch (e) {
            const error = document.createElement("div");
            error.classList.add("Error");
            if (Error.isError(e))
                error.innerHTML = `Error : ${e.message}`;
            parserOutput.append(error);
        }
        return seqEx;
    }
    function showSequence(seqEx) {
        sequenceOutput.innerHTML = "";
        sequenceOutput.append(printExpressionAsMathML(interpretSeqEx(seqEx)));
    }
    const handleInput = () => {
        const seqEx = readUserInput();
        if (seqEx !== undefined)
            showSequence(seqEx);
    };
    sequenceInput.onkeyup = handleInput;
    handleInput();
};
