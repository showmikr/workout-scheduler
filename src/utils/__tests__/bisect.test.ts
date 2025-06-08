import { bisectLeft, bisectRight } from "../bisect";

describe("bisect", () => {
  const array1 = [1, 2, 3, 4, 5];
  const valueExtractor = (item: number) => item;

  test("should return the leftmost insertion point for x in the array", () => {
    expect(bisectLeft({ array: array1, value: 3, valueExtractor })).toBe(2);
  });

  test("should return the leftmost insertion point for x in the array", () => {
    expect(
      bisectLeft({
        array: array1,
        value: 3,
        valueExtractor,
        searchWindow: [0, 1],
      })
    ).toBe(1);
  });

  const array2 = [3, 3, 3, 3, 3];
  test("should return the leftmost insertion point for x in the array", () => {
    expect(bisectLeft({ array: array2, value: 3, valueExtractor })).toBe(0);
  });
  test("should return the rightmost insertion point for x in the array", () => {
    expect(bisectRight({ array: array2, value: 3, valueExtractor })).toBe(5);
  });

  const singleItemArray = [3];
  test("should assume the array (of one element) is ascending and return 0", () => {
    expect(
      bisectLeft({ array: singleItemArray, value: 3, valueExtractor })
    ).toBe(0);
  });
  test("should assume the array (of one element) is ascending and return 1", () => {
    expect(
      bisectRight({ array: singleItemArray, value: 3, valueExtractor })
    ).toBe(1);
  });

  const descendingArray = [5, 4, 3, 2, 1];
  test("should check if we can bisect left correctly in a descending array", () => {
    expect(
      bisectLeft({
        array: descendingArray,
        value: 2,
        valueExtractor,
        ascending: false,
      })
    ).toBe(3);
  });
  test("should check if we can bisect right correctly in a descending array", () => {
    expect(
      bisectRight({
        array: descendingArray,
        value: 2,
        valueExtractor,
        ascending: false,
      })
    ).toBe(4);
  });
});
