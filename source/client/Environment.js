import {Executable} from './Executable.js';
import ExecutableWorker from './Executable/ExecutableWorker.js?worker';
import * as borsh from 'borsh';

import {isEqual} from './utilities/isEqual.js';

class Environment {
  get recordingLogs() {
    return false;
  }
  get modules() {
    /*
      (import "env" "read_register" (func $fimport$0 (param i64 i64)))
      (import "env" "register_len" (func $fimport$1 (param i64) (result i64)))
      (import "env" "input" (func $fimport$2 (param i64)))
      (import "env" "attached_deposit" (func $fimport$3 (param i64)))
      (import "env" "value_return" (func $fimport$4 (param i64 i64)))
      (import "env" "panic_utf8" (func $fimport$5 (param i64 i64)))
      (import "env" "log_utf8" (func $fimport$6 (param i64 i64)))
      (import "env" "storage_write" (func $fimport$7 (param i64 i64 i64 i64 i64) (result i64)))
      (import "env" "storage_read" (func $fimport$8 (param i64 i64 i64) (result i64)))
    */
    return {
      'env': {
        'read_register': this.read_register.bind(this),
        'register_len': this.register_len.bind(this),
        'attached_deposit': this.attached_deposit.bind(this),
        'storage_write': this.storage_write.bind(this),
        'storage_read': this.storage_read.bind(this),
        'value_return': this.value_return.bind(this),
        'panic_utf8': this.panic_utf8.bind(this),

        'input': this.input.bind(this),
        'sha256': this.stub.bind(this, 'sha256'),
        'panic': this.stub.bind(this, 'panic'),
        'abort': this.stub.bind(this, 'abort'),
        'log_utf8': this.stub.bind(this, 'log_utf8'),
        'storage_remove': this.stub.bind(this, 'storage_remove'),
        'storage_has_key': this.stub.bind(this, 'storage_has_key'),
        'used_gas': this.stub.bind(this, 'used_gas'),
        'prepaid_gas': this.stub.bind(this, 'prepaid_gas'),
        'validator_stake': this.stub.bind(this, 'validator_stake'),
        'block_index': this.stub.bind(this, 'block_index'),
        'random_seed': this.stub.bind(this, 'random_seed'),
        'current_account_id': this.stub.bind(this, 'current_account_id'),
        'promise_batch_create': this.stub.bind(this, 'promise_batch_create'),
        'promise_batch_action_function_call_weight': this.stub.bind(this, 'promise_batch_action_function_call_weight'),
        'promise_return': this.stub.bind(this, 'promise_return'),
        'promise_create': this.stub.bind(this, 'promise_create'),
        'promise_then': this.stub.bind(this, 'promise_then'),
        'promise_and': this.stub.bind(this, 'promise_and'),
        'promise_batch_then': this.stub.bind(this, 'promise_batch_then'),
        'promise_batch_action_create_account': this.stub.bind(this, 'promise_batch_action_create_account'),
        'promise_batch_action_deploy_contract': this.stub.bind(this, 'promise_batch_action_deploy_contract'),
        'promise_batch_action_function_call': this.stub.bind(this, 'promise_batch_action_function_call'),
        'promise_batch_action_transfer': this.stub.bind(this, 'promise_batch_action_transfer'),
        'promise_batch_action_stake': this.stub.bind(this, 'promise_batch_action_stake'),
        'promise_batch_action_add_key_with_full_access': this.stub.bind(this, 'promise_batch_action_add_key_with_full_access'),
        'promise_batch_action_add_key_with_function_call': this.stub.bind(this, 'promise_batch_action_add_key_with_function_call'),
        'promise_batch_action_delete_key': this.stub.bind(this, 'promise_batch_action_delete_key'),
        'promise_batch_action_delete_account': this.stub.bind(this, 'promise_batch_action_delete_account'),
        'gas': this.stub.bind(this, 'gas'),
        'ripemd160': this.stub.bind(this, 'ripemd160'),
        'signer_account_pk': this.stub.bind(this, 'signer_account_pk'),
        'signer_account_id': this.stub.bind(this, 'signer_account_id'),
        'predecessor_account_id': this.stub.bind(this, 'predecessor_account_id'),
        'block_timestamp': this.stub.bind(this, 'block_timestamp'),
        'epoch_height': this.stub.bind(this, 'epoch_height'),
        'storage_usage': this.stub.bind(this, 'storage_usage'),
        'account_balance': this.stub.bind(this, 'account_balance'),
        'log_utf16': this.stub.bind(this, 'log_utf16'),
        'validator_total_stake': this.stub.bind(this, 'validator_total_stake'),
        'alt_bn128_g1_multiexp': this.stub.bind(this, 'alt_bn128_g1_multiexp'),
        'alt_bn128_g1_sum': this.stub.bind(this, 'alt_bn128_g1_sum'),
        'alt_bn128_pairing_check': this.stub.bind(this, 'alt_bn128_pairing_check'),
        'promise_results_count': this.stub.bind(this, 'promise_results_count'),
        'promise_result': this.stub.bind(this, 'promise_result'),
      }
    };
  }
  constructor() {
    this.memory = null;
    this.context = {
      input: [],
      registers: {},
      storage: [],
      return_data: null,
    };
  }
  async instantiate(wasm) {
    // const worker = new ExecutableWorker();
    // worker.postMessage({
    //   method: 'instantiate',
    //   params: {
    //     wasm,
    //   },
    // });
    const executable = new Executable(wasm);
    return await executable.instantiate(this);
  }
  // NEAR Environment functions.
  stub(name, ...inputs) {
    console.log(`${name}(${inputs})`);
  }
  attached_deposit(balance_ptr) {
    /*
      /// The balance that was attached to the call that will be immediately deposited before the
      /// contract execution starts.
      ///
      /// # Errors
      ///
      /// If called as view function returns `ProhibitedInView``.
      ///
      /// # Cost
      ///
      /// `base + memory_write_base + memory_write_size * 16`
      pub fn attached_deposit(&mut self, balance_ptr: u64) -> Result<()> {
          self.gas_counter.pay_base(base)?;

          self.memory.set_u128(&mut self.gas_counter, balance_ptr, self.context.attached_deposit)
      }
    */
    if (Environment.recordingLogs) {
      console.log(`attached_deposit(balance_ptr: ${balance_ptr})`);
    }

    const memory = new Uint8Array(this.memory.buffer);
    const balancePointer = Number.parseInt(balance_ptr);
    const slice = memory.slice(balancePointer, balancePointer + 16);
  }
  input(register_id) {
    /*
      /// Reads input to the contract call into the register. Input is expected to be in JSON-format.
      /// If input is provided saves the bytes (potentially zero) of input into register. If input is
      /// not provided writes 0 bytes into the register.
      ///
      /// # Cost
      ///
      /// `base + write_register_base + write_register_byte * num_bytes`
      pub fn input(&mut self, register_id: u64) -> Result<()> {
          self.gas_counter.pay_base(base)?;

          self.registers.set(
              &mut self.gas_counter,
              &self.config.limit_config,
              register_id,
              self.context.input.as_slice(),
          )
      }
    */
    if (Environment.recordingLogs) {
      console.log(`input(register_id: ${register_id})`);
    }

    this.context.registers[register_id] = this.context.input;
  }
  register_len(register_id) {
    /*
      /// Returns the size of the blob stored in the given register.
      /// * If register is used, then returns the size, which can potentially be zero;
      /// * If register is not used, returns `u64::MAX`
      ///
      /// # Arguments
      ///
      /// * `register_id` -- a register id from where to read the data;
      ///
      /// # Cost
      ///
      /// `base`
      pub fn register_len(&mut self, register_id: u64) -> Result<u64> {
          self.gas_counter.pay_base(base)?;
          Ok(self.registers.get_len(register_id).unwrap_or(u64::MAX))
      }
    */
    if (Environment.recordingLogs) {
      console.log(`register_len(register_id: ${register_id})`);
    }

    if (this.context.registers[register_id]) {
      return BigInt(this.context.registers[register_id].length);
    } else {
      return 18446744073709551615n;
    }
  }
  read_register(register_id, ptr) {
    /*
      /// Writes the entire content from the register `register_id` into the memory of the guest starting with `ptr`.
      ///
      /// # Arguments
      ///
      /// * `register_id` -- a register id from where to read the data;
      /// * `ptr` -- location on guest memory where to copy the data.
      ///
      /// # Errors
      ///
      /// * If the content extends outside the memory allocated to the guest. In Wasmer, it returns `MemoryAccessViolation` error message;
      /// * If `register_id` is pointing to unused register returns `InvalidRegisterId` error message.
      ///
      /// # Undefined Behavior
      ///
      /// If the content of register extends outside the preallocated memory on the host side, or the pointer points to a
      /// wrong location this function will overwrite memory that it is not supposed to overwrite causing an undefined behavior.
      ///
      /// # Cost
      ///
      /// `base + read_register_base + read_register_byte * num_bytes + write_memory_base + write_memory_byte * num_bytes`
      pub fn read_register(&mut self, register_id: u64, ptr: u64) -> Result<()> {
          self.gas_counter.pay_base(base)?;
          let data = self.registers.get(&mut self.gas_counter, register_id)?;
          self.memory.set(&mut self.gas_counter, ptr, data)
      }
    */
    if (Environment.recordingLogs) {
      console.log(`read_register(register_id: ${register_id}, ptr: ${ptr})`);
    }
    const data = this.context.registers[register_id];
    const memory = new Uint8Array(this.memory.buffer);
    memory.set(data, Number.parseInt(ptr));
  }
  storage_write(key_len, key_ptr, value_len, value_ptr, register_id) {
    /*
      /// Writes key-value into storage.
      /// * If key is not in use it inserts the key-value pair and does not modify the register. Returns `0`;
      /// * If key is in use it inserts the key-value and copies the old value into the `register_id`. Returns `1`.
      ///
      /// # Errors
      ///
      /// * If `key_len + key_ptr` or `value_len + value_ptr` exceeds the memory container or points
      ///   to an unused register it returns `MemoryAccessViolation`;
      /// * If returning the preempted value into the registers exceed the memory container it returns
      ///   `MemoryAccessViolation`.
      /// * If the length of the key exceeds `max_length_storage_key` returns `KeyLengthExceeded`.
      /// * If the length of the value exceeds `max_length_storage_value` returns
      ///   `ValueLengthExceeded`.
      /// * If called as view function returns `ProhibitedInView``.
      ///
      /// # Cost
      ///
      /// `base + storage_write_base + storage_write_key_byte * num_key_bytes + storage_write_value_byte * num_value_bytes
      /// + get_vec_from_memory_or_register_cost x 2`.
      ///
      /// If a value was evicted it costs additional `storage_write_value_evicted_byte * num_evicted_bytes + internal_write_register_cost`.
    */
    if (Environment.recordingLogs) {
      console.log(`storage_write(${key_len}, ${key_ptr}, ${value_len}, ${value_ptr}, ${register_id})`);
    }
    const memory = new Uint8Array(this.memory.buffer);
    const key = memory.slice(Number.parseInt(key_ptr), Number.parseInt(key_ptr + key_len));
    const value = memory.slice(Number.parseInt(value_ptr), Number.parseInt(value_ptr + value_len));
    // console.log(value);
    const entry = this.context.storage.find((candidate) => isEqual(candidate[0], key));
    if (entry) {
      entry[1] = value;
    } else {
      this.context.storage.push([key, value]);
    }
    
    // console.log(this.context.storage);
    return 0n;
  }
  storage_read(key_len, key_ptr, register_id) {
    /*
      /// Reads the value stored under the given key.
      /// * If key is used copies the content of the value into the `register_id`, even if the content
      ///   is zero bytes. Returns `1`;
      /// * If key is not present then does not modify the register. Returns `0`;
      ///
      /// # Errors
      ///
      /// * If `key_len + key_ptr` exceeds the memory container or points to an unused register it
      ///   returns `MemoryAccessViolation`;
      /// * If returning the preempted value into the registers exceed the memory container it returns
      ///   `MemoryAccessViolation`.
      /// * If the length of the key exceeds `max_length_storage_key` returns `KeyLengthExceeded`.
      ///
      /// # Cost
      ///
      /// `base + storage_read_base + storage_read_key_byte * num_key_bytes + storage_read_value_byte + num_value_bytes
      ///  cost to read key from register + cost to write value into register`.
    */
    if (Environment.recordingLogs) {
      console.log(`storage_read(${key_len}, ${key_ptr}, ${register_id})`);
    }
    const memory = new Uint8Array(this.memory.buffer);
    const key = memory.slice(Number.parseInt(key_ptr), Number.parseInt(key_ptr + key_len));
    const entry = this.context.storage.find((candidate) => isEqual(candidate[0], key));
    // console.log(key);
    if (entry) {
      this.context.registers[register_id] = entry[1];
      return 1n;
    } else {
      return 0n;
    }
  }
  value_return(value_len, value_ptr) {
    /*
      /// Sets the blob of data as the return value of the contract.
      ///
      /// # Errors
      ///
      /// * If `value_len + value_ptr` exceeds the memory container or points to an unused register it
      ///   returns `MemoryAccessViolation`.
      /// * if the length of the returned data exceeds `max_length_returned_data` returns
      ///   `ReturnedValueLengthExceeded`.
      ///
      /// # Cost
      /// `base + cost of reading return value from memory or register + dispatch&exec cost per byte of the data sent * num data receivers`
    */
    if (Environment.recordingLogs) {
      console.log(`value_return(${value_len}, ${value_ptr})`);
    }
    const memory = new Uint8Array(this.memory.buffer);
    const value = memory.slice(Number.parseInt(value_ptr), Number.parseInt(value_ptr + value_len));

    this.context.return_data = value;
  }
  panic_utf8(len, ptr) {
    if (Environment.recordingLogs) {
      console.log(`panic_utf8(${len}, ${ptr})`);
    }

    const memory = new Uint8Array(this.memory.buffer);
    const message = new TextDecoder().decode(
      memory.slice(Number.parseInt(ptr), Number.parseInt(ptr + len))
    );

    // alert(message);
    console.log(message);
  }
}

export {Environment};