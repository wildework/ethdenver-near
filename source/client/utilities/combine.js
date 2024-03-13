function combine(left, right) {
  const combined = new Uint8Array(left.length + right.length);
  combined.set(left);
  combined.set(right, left.length);

  return combined;
}

export {combine};