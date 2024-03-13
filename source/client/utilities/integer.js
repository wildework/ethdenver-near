const unsigned = {
  decode: (bytes, cursor) => {
    let integer = 0n;
    let shift = 0n;
    let index = 0;
  
    while (cursor + index < bytes.length) {
      const byte = bytes[cursor + index];
      const highOrderBit = byte >> 7;
      integer = integer | (BigInt(byte & 0b0111_1111) << shift);
      if (highOrderBit === 0) {
        break;
      }
  
      shift += 7n;
      index += 1;
    }
  
    return {
      value: Number.parseInt(integer.toString()),
      cursor: cursor + index + 1
    };
  },
  encode: (number) => {
    // Source: https://en.wikipedia.org/wiki/LEB128#Encode_unsigned_integer
    let integer = BigInt(number);
    const bytes = [];

    do {
      let byte = Number.parseInt(
        `${integer & 0b0111_1111n}`
      );

      integer >>= 7n;
      if (integer !== 0n) {
        byte = byte | 0b1000_0000;
      }

      bytes.push(byte);
    } while (integer !== 0n);

    return new Uint8Array(bytes);
  }
};

export {
  unsigned
};