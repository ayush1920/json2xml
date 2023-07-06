import React, { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import Navbar, { linkList } from '../components/Navbar'
import HighlightButton from '../components/HighlightButton';
import { notifyError } from '../redux/actions/errorNotifier'
import dicttoxml from '../js/dict2xml';
import customdict2xml from '../js/customXML';

import Prism from "prismjs";
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import '../prism-dark-atom.css';
import indentjs from '../js/indentjs';

import heartIcon from '../media/love.png'
import coffeeIcode from '../media/coffee.png'
import githubLogo from '../media/github-logo.png'
import { FILE_SIZE_LIMIT, REPO_URL } from '../js/constants';

const sampleJSON = '{"employees":{"employee":[{"id":"1","firstName":"Tom","lastName":"Cruise","photo":"https://pbs.twimg.com/profile_images/735509975649378305/B81JwLT7.jpg"},{"id":"2","firstName":"Maria","lastName":"Sharapova","photo":"https://pbs.twimg.com/profile_images/786423002820784128/cjLHfMMJ_400x400.jpg"},{"id":"3","firstName":"James","lastName":"Bond","photo":"https://pbs.twimg.com/profile_images/664886718559076352/M00cOLrh.jpg"}]}}'
const indent = indentjs();

const Home = () => {
    const [inputContainerExpanded, setInputContainerExpanded] = useState(false);
    const [outputContainerExpanded, setOutputContainerExpanded] = useState(false);

    const previousJSON = useRef([]);
    const codeContainer = useRef();
    const preContainer = useRef();
    const outputCodeContainer = useRef();
    const inputTextArea = useRef();
    const fileSelector = useRef();
    const outputData = useRef({ value: '' });
    const lastConversionCustom = useRef(false);
    const codeContainerValue = useRef(false);

    const [rerenderInput, updateRerenderInput] = useState(false);
    const [rerenderOutput, updateRerenderOutput] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        if (outputCodeContainer.current)
            Prism.highlightElement(outputCodeContainer.current)
    }, [rerenderOutput])


    useEffect(() => {
        if (outputCodeContainer.current)
            Prism.highlightElement(codeContainer.current);
    }, [rerenderInput]);

    const updateInputCodePanel = (text) => {
        codeContainerValue.current = text;
        updateRerenderInput(!rerenderInput);

    }

    const handleTextAreaChange = (e) => {
        updateInputCodePanel(e.target.value.replace(/([\n])$/gm, "\n "));
    }

    const handleScroll = (e) => {
        preContainer.current.scrollTop = e.target.scrollTop;
    }

    const insertAtCursor = (myField, myValue) => {
        //IE support
        if (document.selection) {
            myField.focus();
            let sel = document.selection.createRange();
            sel.text = myValue;
        }
        //MOZILLA and others
        else if (myField.selectionStart || myField.selectionStart === '0') {
            var startPos = myField.selectionStart;
            var endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos)
                + myValue
                + myField.value.substring(endPos, myField.value.length);
            myField.selectionStart = startPos + myValue.length;
            myField.selectionEnd = startPos + myValue.length;
        } else {
            myField.value += myValue;
        }
    }

    const handleKeyDown = (e) => {
        let TABKEY = 9;
        if (e.keyCode === TABKEY) {
            insertAtCursor(e.target, "\t");
            if (e.preventDefault) {
                e.preventDefault();
            }
            handleTextAreaChange(e)
            return false;
        }
    }

    const validateJSON = (value) => {
        try {
            const JSONText = JSON.parse(value);
            if (JSONText.constructor !== Object)
                return false;
            return JSONText;
        }
        catch (e) {
            return false;
        }
    }

    const beautifyJSON = (text) => {
        let jsonText = validateJSON(text);
        if (!jsonText)
            return dispatch(notifyError('The file is not of JSON format.'))
        jsonText = JSON.stringify(jsonText, null, 2);
        return jsonText
    }

    const alignJSON = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const prettyText = beautifyJSON(inputTextArea.current.value);
        if (!prettyText)
            return
        inputTextArea.current.value = prettyText;
        updateInputCodePanel(prettyText.replace(/([\n])$/gm, "\n "));
        Prism.highlightElement(codeContainer.current);
    }



    const compressJSON = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const textArea = inputTextArea.current;
        const jsonData = validateJSON(textArea.value);
        if (!jsonData)
            return
        const compressedText = JSON.stringify(jsonData)
        textArea.value = compressedText;
        updateInputCodePanel(compressedText.replace(/([\n])$/gm, "\n "));
    }

    const loadSampleJSON = (e) => {
        inputTextArea.current.value = JSON.stringify(JSON.parse(sampleJSON), null, 2);
        updateInputCodePanel(inputTextArea.current.value.replace(/([\n])$/gm, "\n "));
        addTextToHistory(inputTextArea.current.value);
    }

    const restorePreviousJSON = () => {
        if (previousJSON.current.length < 2)
            return dispatch(notifyError('No Previous JSON text found.', 'Warning'))

        const [oldJSON, newJSON] = previousJSON.current;

        // Update Text Area
        inputTextArea.current.value = oldJSON;
        updateInputCodePanel(inputTextArea.current.value.replace(/([\n])$/gm, "\n "));
        previousJSON.current = [newJSON, oldJSON];

    }

    const openFileDialog = (e) => {
        fileSelector.current.click();
    }

    const loadJSONFile = (e) => {
        var fr = new FileReader();
        fr.onload = function () {
            try {
                JSON.parse(fr.result)
            }
            catch {
                return dispatch(notifyError('The file is not of JSON format.'));
            }

            inputTextArea.current.value = fr.result;
            updateInputCodePanel(inputTextArea.current.value.replace(/([\n])$/gm, "\n "))
            addTextToHistory(fr.result);
        };
        const file = fileSelector.current.files[0];

        if (!file)
            return dispatch(notifyError('No file selected.'))
        const fileSize = file.size;
        if (fileSize > FILE_SIZE_LIMIT)
            return dispatch(notifyError('Please upload a file with size less than 1 MB.'))
        fr.readAsText(file);
    }

    const downloadInputFile = (textArea, extension) => {
        const jsonText = textArea.current.value;

        if (jsonText === 0)
            return
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([jsonText], {
            type: "application/json"
        }));
        a.setAttribute("download", `json_${+ new Date()}.${extension}`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }


    const clearInputWindow = () => {
        inputTextArea.current.value = "";
        updateInputCodePanel('');
    }

    const copyToClipboard = (textArea) => {
        const value = textArea.current.value;
        if (value)
            navigator.clipboard.writeText(value);
    }


    const addTextToHistory = (jsonText) => {
        if (previousJSON.current.length === 0) {
            previousJSON.current = [jsonText]
        }

        else {
            previousJSON.current = [previousJSON.current[previousJSON.current.length - 1], jsonText]
        }
    }

    const handleTextPaste = () => {
        // Copy the code to 
        setTimeout(function () {
            const jsonText = inputTextArea.current.value;
            try {
                JSON.parse(jsonText);
                addTextToHistory(jsonText);
            }
            catch {
                return dispatch(notifyError('Not a valid JSON.'))
            }
        }, 1000);
    }

    const clearOutputWindow = () => {
        updateOutputWindow('')
    }

    const updateOutputWindow = (text) => {
        outputData.current = { value: text };
        updateRerenderOutput(!rerenderOutput);
    }

    const alignXML = () => {
        if (!(previousJSON.current && previousJSON.current.length))
            return dispatch(notifyError('Cannot find text to align.'))

        const transformFunction = (lastConversionCustom.current) ? customdict2xml : dicttoxml;
        const newText = indent.html(transformFunction(JSON.parse(previousJSON.current[previousJSON.current.length - 1]), { enable_new_line: true, root: false, xml_declaration: false, attr_type: false }));
        updateOutputWindow(newText);
    };

    const compressXML = () => {
        if (!(previousJSON.current && previousJSON.current.length))
            return dispatch(notifyError('Cannot find text to align.'));

        const transformFunction = (lastConversionCustom.current) ? customdict2xml : dicttoxml;
        const newText = transformFunction(JSON.parse(previousJSON.current[previousJSON.current.length - 1]), { enable_new_line: false, root: false, xml_declaration: false, attr_type: false });
        updateOutputWindow(newText);
    }

    const convertToXML = (customConversion = false) => {
        if (!validateJSON(inputTextArea.current.value))
            return dispatch(notifyError('Not a valid JSON Format'));
        const jsonText = inputTextArea.current.value
        const jsonObject = JSON.parse(jsonText);
        const transformFunction = (customConversion) ? customdict2xml : dicttoxml;
        let xmlData = transformFunction(jsonObject, { enable_new_line: true, root: false, xml_declaration: false, attr_type: false });

        // Add json to histry if it was modified and the new json is valid.
        if (previousJSON.current.length === 0)
            addTextToHistory(jsonText);
        else if (previousJSON.current[previousJSON.current.length - 1] !== jsonText)
            addTextToHistory(jsonText)

        lastConversionCustom.current = customConversion;
        return updateOutputWindow(indent.html(xmlData));
    }


    const handleOutputKeyDown = (e) => {
        // Select only the contents of output window.

        if (e.ctrlKey && e.keyCode == 65) {
            e.preventDefault();
            e.stopPropagation();

            window.getSelection().selectAllChildren(
                outputCodeContainer.current
            );
        }
    }

    const redirectToGithub = () => {
        window.open(REPO_URL, "_blank");
    }

    return (
        <div className="page-fill-screen">
            <Navbar pageName={linkList.HOME} />
            <div className='page-container-div'>
                <div className='home-container-div'>
                    <div className="home-left-panel">
                        <div className='text-panels-container'>
                            <div className={`text-panel${inputContainerExpanded ? ' expanded' : ''}`}>
                                <div className='static-toolbar'>
                                    <div className='left-toolbar'>
                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={alignJSON}>{'\uf036'}</div>
                                            <div className='icon-button-name'>Beautify</div>
                                        </div>
                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={compressJSON}>{'\ue0a5'}</div>
                                            <div className='icon-button-name'>Compress</div>
                                        </div>
                                    </div>

                                    <div className='right-toolbar'>
                                        <div className='icon-button-container'>
                                            <div className='icon-button' style={{ fontFamily: 'sans-serif', fontStyle: 'italic' }} onClick={loadSampleJSON}>Sample</div>
                                            <div className='icon-button-name'>Sample JSON</div>
                                        </div>

                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={restorePreviousJSON}>{'\uf1da'}</div>
                                            <div className='icon-button-name'>Previous</div>
                                        </div>


                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={openFileDialog}>{'\uf07c'}</div>
                                            <div className='icon-button-name'>Open File</div>
                                        </div>

                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={() => { downloadInputFile(inputTextArea, 'json') }}>{'\uf019'}</div>
                                            <div className='icon-button-name'>Download JSON</div>
                                        </div>

                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={clearInputWindow}>{'\uf1f8'}</div>
                                            <div className='icon-button-name'>Clear</div>
                                        </div>

                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={() => { copyToClipboard(inputTextArea) }}>{'\uf0c5'}</div>
                                            <div className='icon-button-name'>Copy</div>
                                        </div>

                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={() => { setInputContainerExpanded(!inputContainerExpanded) }}>{'\ue0a0'}</div>
                                            <div className='icon-button-name left'>Resize Window</div>
                                        </div>
                                    </div>


                                    <input type='file' accept='text/plain, application/json' style={{ display: 'none' }} ref={fileSelector} onChange={loadJSONFile} />
                                </div>


                                <div className='text-area-container'>
                                    <textarea className='text-area-code' ref={inputTextArea} onPaste={handleTextPaste}
                                        onChange={handleTextAreaChange} onScroll={handleScroll} onKeyDown={handleKeyDown} />
                                    <div className='code-container'>
                                        <pre ref={preContainer}
                                        ><code className='language-json' ref={codeContainer}>{codeContainerValue.current}</code></pre>
                                    </div>
                                </div>
                            </div>

                            <div className={`text-panel${outputContainerExpanded ? ' expanded' : ''}`}>
                                <div className='static-toolbar'>
                                    <div className='left-toolbar'>
                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={alignXML}>{'\uf036'}</div>
                                            <div className='icon-button-name'>Beautify</div>
                                        </div>
                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={compressXML}>{'\ue0a5'}</div>
                                            <div className='icon-button-name'>Compress</div>
                                        </div>
                                        <span style={{ fontWeight: 600, color: 'rgb(180,180,180)' }}>Output</span>
                                    </div>

                                    <div className='right-toolbar'>

                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={() => { downloadInputFile(outputData, 'xml') }}>{'\uf019'}</div>
                                            <div className='icon-button-name'>Download JSON</div>
                                        </div>

                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={clearOutputWindow}>{'\uf1f8'}</div>
                                            <div className='icon-button-name'>Clear</div>
                                        </div>

                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={() => { copyToClipboard(outputData) }}>{'\uf0c5'}</div>
                                            <div className='icon-button-name'>Copy</div>
                                        </div>

                                        <div className='icon-button-container'>
                                            <div className='icon-button' onClick={() => { setOutputContainerExpanded(!outputContainerExpanded) }}>{'\ue0a0'}</div>
                                            <div className='icon-button-name left'>Resize Window</div>
                                        </div>
                                    </div>


                                    <input type='file' accept='text/plain, application/json' style={{ display: 'none' }} ref={fileSelector} onChange={loadJSONFile} />
                                </div>

                                <div className='text-area-container'>
                                    <div className='code-container' onKeyDown={handleOutputKeyDown}>
                                        <pre><code className='language-markup' ref={outputCodeContainer}>
                                            {outputData.current.value}
                                        </code>
                                        </pre>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className='convert-controls'>
                            <HighlightButton highlightColor={'rgb(52, 186, 150)'}
                                style={{ width: '200px', zIndex: 0 }} name={'Convert to XML'} onClick={() => { convertToXML(false) }} />

                            <HighlightButton highlightColor={'rgb(252, 194, 28)'}
                                style={{ width: '200px', zIndex: 0 }} name={'Custom XML'} onClick={() => { convertToXML(true) }} />
                        </div>
                        <div className='footer'>
                            <span>
                                Build with
                            </span>
                            <img src={coffeeIcode} style={{ position: 'relative', width: '36px' }} />
                            <span> and </span>
                            <img src={heartIcon} style={{ position: 'relative', width: '30px' }} />
                            <span> from Ayush</span>

                            <div className='branding-container' style={{ cursor: 'pointer' }} onClick={redirectToGithub}>
                                <text> View on Github</text>
                                <img src={githubLogo} style={{ width: '32px' }} />
                            </div>
                        </div>

                    </div>
                </div>
            </div >
        </div >
    )
}

export default Home