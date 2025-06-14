import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

// CodeEditor component using Monaco editor
const CodeEditor = ({ value, onChange, language = 'javascript', onSave, isDirty }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  
  // Initialize Monaco editor
  useEffect(() => {
    if (editorRef.current) {
      // Define options for Monaco editor
      const options = {
        value: value || '',
        language: language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
          enabled: true
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: 2,
        fontFamily: 'Consolas, "Courier New", monospace',
        wordWrap: 'on',
      };

      // Create editor
      monacoRef.current = monaco.editor.create(editorRef.current, options);

      // Add event listener for content changes
      monacoRef.current.onDidChangeModelContent(() => {
        onChange(monacoRef.current.getValue());
      });

      // Add keyboard shortcut for saving (Ctrl+S / Cmd+S)
      monacoRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        if (onSave) onSave();
      });
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
    };
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoRef.current) {
      const currentValue = monacoRef.current.getValue();
      if (value !== currentValue) {
        monacoRef.current.setValue(value || '');
      }
    }
  }, [value]);

  // Update editor language when prop changes
  useEffect(() => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, mapLanguage(language));
      }
    }
  }, [language]);

  // Map file extensions to Monaco languages
  const mapLanguage = (lang) => {
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      go: 'go',
      java: 'java',
      plaintext: 'plaintext',
    };
    return languageMap[lang] || 'plaintext';
  };

  return (
    <div className="h-full relative">
      {/* Editor controls */}
      <div className="absolute top-0 right-0 z-10 p-2 flex space-x-2">
        {isDirty && (
          <button
            className="bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-1 rounded"
            onClick={onSave}
          >
            Save
          </button>
        )}
        <div className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
          {language.toUpperCase()}
        </div>
      </div>
      
      {/* Monaco editor container */}
      <div ref={editorRef} className="h-full w-full"></div>
    </div>
  );
};

export default CodeEditor;