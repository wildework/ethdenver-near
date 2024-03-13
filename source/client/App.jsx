import {useEffect, useState} from 'react';
import {utilities} from '@usesoroban/sdk';
import {css, cx} from '@emotion/css';

import {Environment} from './Environment.js';
// import ExecutableWorker from './ExecutableWorker.js';

import {combine} from './utilities/combine.js';

import {Code} from './Code.jsx';
import {Contract} from './Contract.jsx';
import {Console} from './Console.jsx';

import * as colors from './utilities/colors/index.js';

const styles = {
  app: css({
    boxSizing: 'border-box',
    // display: 'grid',
    // gridTemplateRows: 'auto 1fr',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
    padding: '16px',
    backgroundColor: '#bdc3c7',
    fontFamily: 'verdana, sans-serif',
    fontSize: '14px',
    overflow: 'auto',
    backgroundColor: 'var(--color-grayscale-000)',
    colorScheme: 'dark',
    '--color-accent': colors.brand.accent,
    '--color-result': colors.brand.result,
    '--color-signal-error': colors.brand.signal.error,
    '--color-signal-warning': colors.brand.signal.warning,
    '--color-rainbow-blue': colors.brand.rainbow.blue,
    '--color-rainbow-purple': colors.brand.rainbow.purple,
    '--color-rainbow-turquoise': colors.brand.rainbow.turquoise,
    '--color-rainbow-pink': colors.brand.rainbow.pink,
    '--color-rainbow-lime': colors.brand.rainbow.lime,
    '--color-rainbow-earth': colors.brand.rainbow.earth,
    '--color-rainbow-green': colors.brand.rainbow.green,
    '--color-rainbow-orange': colors.brand.rainbow.orange,
    '--color-grayscale-000': colors.brand.grayscale.dark['000'],
    '--color-grayscale-025': colors.brand.grayscale.dark['025'],
    '--color-grayscale-050': colors.brand.grayscale.dark['050'],
    '--color-grayscale-100': colors.brand.grayscale.dark['100'],
    '--color-grayscale-200': colors.brand.grayscale.dark['200'],
    '--color-grayscale-250': colors.brand.grayscale.dark['250'],
    '--color-grayscale-300': colors.brand.grayscale.dark['300'],
    '--color-grayscale-325': colors.brand.grayscale.dark['325'],
    '--color-grayscale-350': colors.brand.grayscale.dark['350'],
    '--color-grayscale-veil': colors.brand.grayscale.dark['veil'],
    '--color-grayscale-intense': colors.brand.grayscale.dark['intense'],
  }),
  header: css({
    fontSize: '28px',
  }),
  workspace: css({
    flex: '1',
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    overflow: 'hidden',
  }),
};

function App() {
  const [project, setProject] = useState(null);
  const [executable, setExecutable] = useState(null);
  const [abi, setAbi] = useState(null);
  const [wasm, setWasm] = useState(null);
  const [logs, setLogs] = useState([
    // {type: 'call', message: 'increment()'},
    // {type: 'result', message: '1'},
    // {type: 'note', message: 'compiled'},
  ]);
  const [isWaiting, setWaiting] = useState(false);

  const log = (entry) => {
    setLogs((logs) => [
      ...logs,
      entry
    ]);
  }

  const fetchProject = async () => {
    const response = await fetch(`http://localhost:3000/project/aemfingsyojrhwlkqawbxqgicsqz`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseJson = await response.json();
    
    setProject(responseJson);

    const wasm = utilities.base64.decode(responseJson.wasm);
    console.log(wasm.length);
    setWasm(wasm);

    // const worker = new ExecutableWorker();
    // console.log(worker);

    // Instantiate the WASM
    const environment = new Environment();
    const executable = await environment.instantiate(wasm);

    setExecutable(executable);
    setAbi(responseJson.abi);
  };
  const compileProject = async (project) => {
    setWaiting(true);
    const response = await fetch('http://localhost:3000/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: project.code,
      }),
    });
    const responseJson = await response.json();

    const wasm = utilities.base64.decode(responseJson.wasm);

    // Instantiate the WASM
    const environment = new Environment();
    const executable = await environment.instantiate(wasm);

    setExecutable(executable);
    setAbi(responseJson.abi);
    setWaiting(false);
    log({type: 'note', message: 'compiled'})
    // executable.disassemble();

    // Uses the test_contract_rs.wasm contract
    // const writeResult = executable.execute('write_key_value', [10, 20]);
    // console.log(writeResult);
    // const readResult = executable.execute('read_value', [20]);
    // console.log(readResult);

    // const result = executable.execute('increment', []);
    // This is because the numbers are being encoded as ASCII '0' is 48 and that's why 10 needs two bytes, because it's two digit characters.
    // 48 = 0011_0000
    // 49 = 0011_0001
    // 50 = 0011_0010
    // 51 = 0011_0011
    // 52 = 0011_0100
    // 53 = 0011_0101
    // 54 = 0011_0110
    // 55 = 0011_0111
    // 56 = 0011_1000
    // 57 = 0011_1001
  }
  useEffect(() => {
    fetchProject();
  }, []);

  return (
    <div className={cx(styles.app)}>
      <div className={cx(styles.workspace)}>
        <Code
          project={project}
          onCompile={compileProject}
          isCompiling={isWaiting}
        />
        <Contract
          executable={executable}
          wasm={wasm}
          abi={abi}
          onLog={log}
        />
        <Console logs={logs} />
      </div>
    </div>
  )
}

export {App};