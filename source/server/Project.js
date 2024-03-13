import fs from 'node:fs';
import {spawn} from 'node:child_process';

class Project {
  static get paths() {
    return {
      root: './rust/projects',
      products: './rust/projects/target/wasm32-unknown-unknown/release',
    };
  }
  static fetch(identifier) {
    const project = new Project(identifier);

    return project;
  }
  get paths() {
    return {
      source: `${Project.paths.root}/project-${this.identifier}`,
      products: `${Project.paths.root}/target/near/project_${this.identifier}`,
    };
  }
  constructor(identifier) {
    this.identifier = identifier;
    this.code = null;
    this.wasm = null;
    this.abi = null;
  }
  hydrate() {
    // Source code.
    this.code = fs.readFileSync(`${this.paths.source}/lib.rs`, 'utf-8');
    // Executable.
    const wasmPath = `${this.paths.products}/project_${this.identifier}.wasm`;
    const isCompiled = fs.existsSync(wasmPath);
    console.log(wasmPath);
    if (isCompiled) {
      this.wasm = fs.readFileSync(wasmPath);
      this.abi = JSON.parse(
        fs.readFileSync(`${this.paths.products}/project_${this.identifier}_abi.json`)
      );
    }
  }
  serialize() {
    return {
      code: this.code,
      identifier: this.identifier,
      wasm: this.wasm?.toString('base64'),
      abi: this.abi,
    };
  }
  mutateFile(filename, contents) {
    fs.writeFileSync(`${this.paths.source}/${filename}`, contents, 'utf-8');
  }
  async compile() {
    const didCompile = await new Promise((resolve) => {
      // TODO: Find a way to directly generate the NEAR ABI, then we can use this.
      // const compiler = spawn(
      //   'cargo',
      //   [
      //     'build',
      //     '-p',
      //     `project-${this.identifier}`,
      //     '--target',
      //     'wasm32-unknown-unknown',
      //     '--profile',
      //     'release',
      //     '--features',
      //     'near-sdk/__abi-generate',
      //     '--message-format=json'
      //   ],
      //   {
      //     cwd: Project.paths.root,
      //   }
      // );
      const compiler = spawn(
        'cargo',
        [
          'near',
          'build',
        ],
        {
          cwd: this.paths.source,
        }
      );
  
      const messages = [];
      let buffer = '';
  
      compiler.stdout.on('data', (data) => {
        // buffer += data.toString();
        // const lines = buffer.split('\n');
        // buffer = lines.pop();

        // for (const line of lines) {
        //   const message = JSON.parse(line);
        //   messages.push(message);
        // }
      });
      // compiler.stderr.on('data', (data) => {
      //   buffer += data.toString();
      // });
      compiler.on('error', (error) => {
        // console.log('error');
        // console.log(error);
        resolve(false);
      });
      compiler.on('close', (code) => {
        // console.log(messages);
        resolve(true);
      });
    });
  }
}

export {Project};