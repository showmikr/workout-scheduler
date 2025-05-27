/**
 * Pretty prints a 4x4 transformation matrix
 * @param matrix A 4x4 transformation matrix as a flat array of 16 numbers
 * @returns A formatted string representation of the matrix
 */
export function prettyPrintMatrix(matrix: number[]): string {
  if (matrix.length !== 16) {
    throw new Error("Matrix must be a 4x4 transformation matrix (16 numbers)");
  }

  // Format each number to have consistent width
  const formattedNumbers = matrix.map((n) => n.toFixed(3).padStart(8));

  // Build the string representation with rows
  return [
    "⎡" + formattedNumbers.slice(0, 4).join(" ") + " ⎤",
    "⎢" + formattedNumbers.slice(4, 8).join(" ") + " ⎥",
    "⎢" + formattedNumbers.slice(8, 12).join(" ") + " ⎥",
    "⎣" + formattedNumbers.slice(12, 16).join(" ") + " ⎦",
  ].join("\n");
}

/**
 * Extracts and pretty prints the translation vector from a 4x4 transformation matrix
 * @param matrix A 4x4 transformation matrix as a flat array of 16 numbers
 * @returns A formatted string representation of the translation vector [x, y, z]
 */
export function prettyPrintTranslation(matrix: number[]): string {
  if (matrix.length !== 16) {
    throw new Error("Matrix must be a 4x4 transformation matrix (16 numbers)");
  }

  // Translation vector is in the last column (indices 12, 13, 14)
  const x = matrix[12].toFixed(3);
  const y = matrix[13].toFixed(3);
  const z = matrix[14].toFixed(3);

  return `[${x}, ${y}, ${z}]`;
}
