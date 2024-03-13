import {useReducer} from 'react';
import {css, cx} from '@emotion/css';

import {Widget} from './components/Widget.jsx';
import {Button} from './components/Button.jsx';
import {Modal} from './components/Modal.jsx';

function reducer(state, action) {
  switch (action.type) {
    case 'abandonExecution': {
      return {
        ...state,
        promptedFunction: null,
      };
    }
    case 'promptFunction': {
      return {
        ...state,
        promptedFunction: action.payload,
      };
    }
    case 'mutateInput': {
      console.log(action);
      return {
        ...state,
        promptFunctionInputs: {
          ...state.promptFunctionInputs,
          [action.payload.name]: action.payload.value,
        },
      };
    }
    default: {
      return state;
    }
  }
}

const styles = {
  contract: css({
    flex: '0 0 250px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),
  metadata: css({
    display: 'grid',
    gridTemplateColumns: '1fr 4fr',
    rowGap: '8px',
    columnGap: '16px',
  }),
  actions: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
    padding: '24px 8px',
    borderRadius: '0 0 16px 16px',
    backgroundSize: '10px 10px',
    backgroundImage: 'radial-gradient(var(--color-grayscale-200) 1.0px, var(--color-grayscale-025) 1.0px)',
  }),
  action: css({
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
  }),
  isCode: css({
    fontFamily: 'monospace',
    fontSize: '14px',
  }),
  isView: css({
    backgroundColor: '#2ecc71',
  }),
  isCall: css({
    backgroundColor: '#f1c40f',
  }),
  isDull: css({
    color: '#7f8c8d',
  }),
};

function Contract(props) {
  const [state, dispatch] = useReducer(reducer, {
    promptedFunction: null,
    // {
    //   "name": "increment_by",
    //   "kind": "call",
    //   "params": {
    //     "serialization_type": "json",
    //     "args": [
    //       {
    //         "name": "amount",
    //         "type_schema": {
    //           "type": "integer",
    //           "format": "int64"
    //         }
    //       }
    //     ]
    //   },
    //   "result": {
    //     "serialization_type": "json",
    //     "type_schema": {
    //       "type": "integer",
    //       "format": "int64"
    //     }
    //   }
    // },
    promptFunctionInputs: {
      // amount: '33',
    },
  });

  const promptFunction = (functionInterface) => {
    dispatch({
      type: 'promptFunction',
      payload: functionInterface,
    });
  };
  const abandonExecution = () => {
    dispatch({type: 'abandonExecution'});
  };

  const execute = (functionInterface, inputs = []) => {
    const serializedResult = props.executable.execute(functionInterface.name, inputs, functionInterface);
    let result = null;

    if (functionInterface.result.serialization_type === 'json') {
      if (functionInterface.result.type_schema.type === 'integer') {
        result = new TextDecoder().decode(serializedResult);
      }
    }

    dispatch({type: 'abandonExecution'});
    props.onLog({
      type: 'result',
      message: result,
    });
  };

  const onFunctionInputMutation = (name, value) => {
    dispatch({
      type: 'mutateInput',
      payload: {
        name,
        value,
      },
    });
  };
  const onFunctionCall = () => {
    execute(state.promptedFunction, state.promptFunctionInputs);
  };
  const onExecute = (functionName) => {
    props.onLog({
      type: 'call',
      message: `${functionName}()`,
    });

    const functionInterface = props.abi.body.functions.find((candidate) => candidate.name === functionName);
    console.log(functionInterface)
    if (functionInterface.params?.args?.length > 0) {
      promptFunction(functionInterface);
    } else {
      execute(functionInterface);
    }
  };

  if (!props.executable || !props.abi) {
    return (
      <Widget
        title="Contract"
        style={{flex: '0 0 250px'}}
      >
        <div className={cx(styles.isDull)}>
          No executable...
        </div>
      </Widget>
    );
  }

  const functions = props.abi.body.functions.filter((fn) => fn.name !== 'contract_source_metadata');
  // console.log(state);

  return (
    <Widget
      title={`Contract ${props.wasm?.length}`}
      style={{flex: '0 0 250px'}}
    >
      {/* <div className={cx(styles.metadata)}>
        <div>Name</div>
        <div className={cx(styles.isCode)}>{props.abi.metadata.name}</div>
        <div>Version</div>
        <div className={cx(styles.isCode)}>{props.abi.metadata.version}</div>
        <div>Hash</div>
        <div className={cx(styles.isCode)}>{props.abi.metadata.wasm_hash}</div>
      </div> */}
      <div className={cx(styles.actions)}>
        {functions.map((fn) => {
          return (
            <div key={fn.name}>
              <Button
                isSecondary
                isCode
                className={cx({
                  [styles.action]: true,
                  [styles.isCode]: true,
                  [styles.isView]: fn.kind == 'view',
                  [styles.isCall]: fn.kind == 'call',
                })}
                title={fn.name}
                onClick={onExecute.bind(null, fn.name)}
              />
            </div>
          );
        })}
      </div>
      {state.promptedFunction &&
        <Modal
          {...state.promptedFunction}
          inputs={state.promptFunctionInputs}
          onChange={onFunctionInputMutation}
          onCall={onFunctionCall}
          onClose={abandonExecution}
        />
      }
    </Widget>
  );
}

export {Contract};