import React from "react";


const OutputWindow = ({ output, setOutput, executeCode }) => {
    const handleInputChange = (e) => {
        setOutput(e.target.value); // Update output as input if needed
    };

    return (
        <div className="outputWindow">
            <h3>Output</h3>
            <textarea
                className="outputArea"
                value={output}
                readOnly // Output area should be read-only
            />
            <button className="runBtn" onClick={executeCode}>
                Run Code
            </button>
        </div>
    );
};

export default OutputWindow;
