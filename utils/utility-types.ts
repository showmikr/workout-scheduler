/**
 * Make all properties of object T both non-optional and non-nullable
 *
 * @example if T = { a?: number, b: string | null },
 * then Mandatory<T> = { a: number, b: string }
 */
type Mandatory<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

export type { Mandatory };
