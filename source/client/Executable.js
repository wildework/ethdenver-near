import {unsigned} from './utilities/integer.js';
import * as borsh from 'borsh';

import {combine} from './utilities/combine.js';

// Source: https://webassembly.github.io/spec/core/binary/modules.html#binary-section
const sectionNames = {
  0: 'custom',
  1: 'type',
  2: 'import',
  3: 'function',
  4: 'table',
  5: 'memory',
  6: 'global',
  7: 'export',
  8: 'start',
  9: 'element',
  10: 'code',
  11: 'data',
  12: 'dataCount'
};

class Executable {
  constructor(wasm) {
    this.environment = null;
    this.wasm = wasm;
    this.instance = null;
  }
  async instantiate(environment) {
    this.environment = environment;
    const executable = await WebAssembly.instantiate(this.wasm, this.environment.modules);
    // const executable = await WebAssembly.instantiateStreaming(this.wasm, this.environment.modules);
    this.instance = executable.instance;
    this.environment.memory = executable.instance.exports.memory;

    return this;
  }
  execute(name, inputs, abi) {
    console.log(name, inputs, abi);
    let combined = new Uint8Array();
    for (const inputName in inputs) {
      const input = inputs[inputName];
      const param = abi.params.args.find((candidate) => candidate.name === inputName);
      
      console.log(param.type_schema.declaration);
      switch (param.type_schema.declaration) {
        case 'i64': {
          const serialized = borsh.serialize('i64', Number.parseInt(input));
          combined = combine(combined, serialized);
          break;
        }
      }
    }
    console.log(combined);

    this.environment.context.input = combined;
    this.instance.exports[name]();
    const result = this.environment.context.return_data;
    this.environment.context.return_data = null;

    if (result !== null) {
      // const value = new TextDecoder().decode(result);
      return result;
      // return borsh.deserialize('u64', result);
    } else {
      return null;
    }
  }
  disassemble() {
    console.log('disassemble');
    let cursor = 0;
    // Move it past the preamble.
    cursor += 8;

    const sections = [];
    while (cursor < this.wasm.length) {
      const sectionType = this.wasm[cursor];
      const sectionName = sectionNames[sectionType];
      cursor += 1;
      const sectionLength = unsigned.decode(this.wasm, cursor);
      cursor = sectionLength.cursor;

      sections.push({
        name: sectionName,
        bytes: this.wasm.slice(cursor, cursor + sectionLength.value),
      });

      cursor += sectionLength.value;
    }

    // Find the number of bytes allocated in the memory.
    // const memorySection = sections.find((section) => section.name === 'memory');
    // cursor = 0;
    // if (memorySection.bytes[0] === 1) {
    //   cursor += 1;
    //   const min = unsigned.decode(memorySection.bytes, cursor);
    //   cursor = min.cursor;
    //   const max = unsigned.decode(memorySection.bytes, cursor);
    //   console.log(min, max);
    // }
    // cursor = 0;
    // const a = unsigned.decode(memorySection.bytes, cursor);
    // cursor = a.cursor;
    // console.log(memorySection.bytes);
    // console.log(a);

    const dataSection = sections.find((section) => section.name === 'data');
    console.log(dataSection);
    // const first = this.wasm.slice(0, 8);
    // console.log(new TextDecoder().decode(dataSection.bytes));
    // console.log(this.wasm[cursor]);
  }
}

export {Executable};