import {useState, useEffect} from 'react';
import {css, cx} from '@emotion/css';

import {Widget} from './components/Widget.jsx';
import {Editor} from './components/Editor.jsx';
import {Button} from './components/Button.jsx';

const styles = {
  code: css({
    flex: '2',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),
  editor: css({
    flex: '1',
    overflow: 'auto',
  }),
  footer: css({
    boxSizing: 'border-box',
    flex: '0 0 60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
  }),
};

function Code(props) {
  const [code, setCode] = useState(props.project?.code || '');

  const compile = () => {
    console.log('here');
    props.onCompile({
      ...props.project,
      code,
    });
  };

  useEffect(() => {
    if (props.project) {
      setCode(props.project.code);
    }
  }, [props.project]);
  
  return (
    <Widget
      title="Code"
      style={{flex: '2'}}
    >
      <div className={cx(styles.editor)}>
        <Editor
          language="rust"
          code={code}
          codeHighlights={[]}
          onChange={(nextCode) => setCode(nextCode)}
        />
      </div>
      <div className={cx(styles.footer)}>
        <Button
          title={props.isCompiling ? 'Compiling...' : 'Compile'}
          isSecondary
          isDisabled={props.isCompiling}
          onClick={compile}
        />
      </div>
    </Widget>
  );
}

export {Code};