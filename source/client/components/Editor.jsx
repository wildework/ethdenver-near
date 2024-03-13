import {useState, useCallback, useEffect, useRef} from 'react';
import {css, cx} from '@emotion/css';
import {EditorState, StateField, StateEffect} from '@codemirror/state';
import {EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, Decoration} from '@codemirror/view';
import {defaultKeymap, indentWithTab, history, historyKeymap} from '@codemirror/commands';
import {HighlightStyle, syntaxHighlighting, indentUnit, foldGutter, indentOnInput, bracketMatching, foldKeymap} from '@codemirror/language';
import {autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap} from '@codemirror/autocomplete';
import {rust} from "@codemirror/lang-rust";
import {wast} from '@codemirror/lang-wast';
import {tags} from '@lezer/highlight';

// Taken from a code sample of a highlightable editor.
// Source: https://github.com/pamelafox/dis-this/blob/main/src/highlightable-editor.js
const addLineHighlight = StateEffect.define();
const removeLineHighlight = StateEffect.define();
const lineHighlightMark = Decoration.line({
  attributes: {style: 'background-color: var(--color-grayscale-100);'},
});
const lineHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(lines, tr) {
    lines = lines.map(tr.changes);
    for (let effect of tr.effects) {
      if (effect.is(removeLineHighlight)) {
        lines = Decoration.none;
      } else if (effect.is(addLineHighlight)) {
        // lines = Decoration.none;
        lines = lines.update({add: [lineHighlightMark.range(effect.value)]});
      }
    }
    return lines;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const styles = {
  container: css({
    padding: '16px',
    '& > .cm-editor': {
      outline: 'none',
    }
  }),
  isPadded: css({
    padding: '0',
  }),
};

function Editor(props) {
  // This CodeMirror 6 integration with React is taken from a tutorial.
  // Source: https://www.codiga.io/blog/implement-codemirror-6-in-react/
  const [element, setElement] = useState();
  const [view, setView] = useState();

  const ref = useCallback((node) => {
    if (!node) {
      return;
    }

    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) {
      return;
    }

    const highlightTags = [
      {tag: tags.keyword, color: 'var(--color-grayscale-300)'},
      {tag: tags.comment, color: "var(--color-grayscale-300)"},
      {tag: tags.literal, color: "rgba(var(--color-rainbow-purple), 1)"},
      {tag: tags.macroName, color: 'var(--color-accent)'},
      // #[contract]
      {tag: tags.meta, color: 'var(--color-accent)'},
      // .storage(), .persistent()
      {tag: tags.propertyName, color: 'var(--color-accent)'},
      // env
      {tag: tags.variableName, color: 'var(--color-grayscale-350)'},
      // {tag: tags.definition(tags.variableName), color: 'orange'},
      {tag: tags.definition(tags.variableName), color: 'var(--color-accent)'},
      {tag: tags.typeName, color: 'var(--color-grayscale-300)'},
      {tag: tags.namespace, color: 'rgba(var(--color-rainbow-pink), 1)'},
    ];

    if (props.language === 'wat') {
      highlightTags.push(
        {tag: tags.lineComment, color: 'rgba(var(--color-rainbow-pink), 1)'},
      );
    } else {
      highlightTags.push(
        {tag: tags.lineComment, color: 'var(--color-grayscale-300)'},
      );
    }

    const highlightStyle = HighlightStyle.define(highlightTags);

    const extensions = [
      EditorState.readOnly.of(!!props.isReadOnly),
      EditorView.lineWrapping,
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter({
        openText: '-',
        closedText: '+'
      }),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap
      ]),
      keymap.of([indentWithTab]),
      syntaxHighlighting(highlightStyle),
      lineHighlightField,
      EditorView.theme({
        '.cm-editor': {
          padding: '16px',
        },
        '.cm-content': {
          color: 'var(--color-grayscale-350)',
          lineHeight: '18px',
          fontFamily: `'DM Mono', monospace`,
          fontSize: '14px',
          caretColor: 'red',
        },
        '.cm-gutters': {
          borderRight: 'none',
          backgroundColor: 'initial',
          color: 'var(--color-grayscale-250)',
          fontFamily: `'DM Mono', monospace`,
          fontSize: '14px',
        },
        '.cm-activeLine': {
          backgroundColor: 'inherit',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'inherit',
          color: 'var(--color-grayscale-300)',
        },
        '.cm-cursor': {
          borderLeftColor: 'var(--color-grayscale-350)',
        },
        '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
          backgroundColor: 'var(--color-grayscale-100)',
        },
        '.cm-selectionBackground': {
          backgroundColor: 'var(--color-grayscale-100) !important',
        },
        '.cm-selectionMatch': {
          backgroundColor: 'var(--color-grayscale-100)',
        },
      }),
      EditorView.updateListener.of((view) => {
        if (view.docChanged) {
          props.onChange(view.state.doc.toString());
        }
      })
    ];
    
    if (props.language === 'rust') {
      extensions.push(
        rust(),
        indentUnit.of('    '),
      );
    } else if (props.language === 'wat') {
      extensions.push(
        wast(),
        indentUnit.of('  '),
      );
    }
    const view = new EditorView({
      state: EditorState.create({
        doc: props.code,
        extensions
      }),
      parent: element
    });
    setView(view);

    return () => {
      view?.destroy();
      setView(null);
    }
  }, [element, props.isReadOnly, props.language]);

  useEffect(() => {
    // Only update the CodeMirror view if the code value from the props is different from the one in state.
    // The only time when this is the case is when you call "undo".
    // This solves the issue of double drawing the same edit and losing the cursor in the process.
    if (view && view.state.doc.toString() !== props.code) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.toString().length,
          insert: props.code
        }
      });
    }
  }, [view, props.code]);

  const highlightsReference = useRef();

  useEffect(() => {
    if (view) {
      if (highlightsReference.current) {
        for (const highlight of highlightsReference.current) {
          const docPosition = view.state.doc.line(highlight.location.line).from;
          view.dispatch({
            effects: removeLineHighlight.of(docPosition)
          });
        }
      }
      
      for (const highlight of props.codeHighlights) {
        const docPosition = view.state.doc.line(highlight.location.line).from;
        view.dispatch({effects: addLineHighlight.of(docPosition)});
      }

      highlightsReference.current = props.codeHighlights;
    }
  }, [view, props.codeHighlights]);

  return (
    <div
      ref={ref}
      className={cx({
        [styles.container]: true,
        [styles.isPadded]: props.isPadded,
      })}
    />
  );
}

export {Editor};