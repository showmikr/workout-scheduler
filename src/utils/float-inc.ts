/**
 * Increments a float64 number by the smallest possible amount
 * @param n The number to increment
 * @returns The next representable float64 number
 */
function floatIncrement(n: number): number {
  // Handle special cases
  if (n === Infinity) return n;
  if (n === -Infinity) return -Number.MAX_VALUE;
  if (Number.isNaN(n)) return n;

  // Get the bits of the float64 number
  const buffer = new ArrayBuffer(8);
  const view = new Float64Array(buffer);
  const intView = new BigInt64Array(buffer);

  view[0] = n;
  let bits = intView[0];

  // Special handling for -0
  if (n === 0 && 1 / n < 0) {
    return Number.MIN_VALUE;
  }

  // For negative numbers, we need to decrease the bit pattern
  if (n < 0) {
    bits = bits - BigInt(1);
  } else {
    bits = bits + BigInt(1);
  }

  intView[0] = bits;
  return view[0];
}

function main() {
  // Example usage
  const num = 1.0;
  const incrementedNum = floatIncrement(num);
  const inc2 = floatIncrement(incrementedNum);
  console.log(`Incremented number: ${incrementedNum}`);
  console.log(`Incremented again: ${inc2}`);
}

main();
