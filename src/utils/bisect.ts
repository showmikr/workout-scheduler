type Comparable = number | bigint | string | Date;

type BisectArgs<T, U extends Comparable> = {
  array: T[];
  value: U;
  valueExtractor: (arrayItem: T) => U;
  searchWindow?: [number, number];
  ascending?: boolean;
};

/**
 *
 * Locate the insertion point for `value` in `array` to maintain sorted order.
 * If `value` is already present in `array`, the insertion point will be before (to the left of) any existing entries.
 * Assumes the array is in ascending order (least to greatest) unless `ascending` property is changed to `false`.
 * @param array the sorted array to search within (the array can be in ascending or descending order)
 * @param value the value to insert into the array while maintaining order
 * @param searchWindow refers to the window of the array to search within, first-inclusive and last-exclusive
 * (i.e. [0, 10] means search from index 0 to index 9, inclusive of 0 and exclusive of 10)
 * @param valueExtractor a function that extracts the comparable value from each item in the array
 * @param ascending determines if the array is sorted in ascending order (when true) or descending order (when false). Defaults to true
 * @returns the index of the leftmost insertion point for x in the array (ex: x = 5, array = [7, 6, 4, 3, 2, 1] would return 2)
 */
function bisectLeft<T, U extends Comparable>({
  array,
  value,
  valueExtractor,
  searchWindow = [0, array.length],
  ascending = true,
}: BisectArgs<T, U>) {
  let [left, right] = searchWindow;

  const windowLength = right - left;
  if (windowLength <= 0) {
    if (windowLength < 0) {
      console.warn(
        `search window has invalid bounds that are out of order: left: ${left}, right: ${right}`
      );
    }
    return left;
  }

  const first = array.at(left);
  const last = array.at(right - 1);

  if (first === undefined || last === undefined) {
    console.warn(
      "search window's first and last values are undefined or null, returning left index of search window"
    );
    return left;
  }

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = valueExtractor(array[mid]);
    const isValueRightOfMid = ascending ? value > midValue : value < midValue;
    if (isValueRightOfMid) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

/**
 * Locate the insertion point for `value` in `array` to maintain sorted order.
 * If `value` is already present in `array`, the insertion point will be after (to the right of) any existing entries.
 * Assumes the array is in ascending order (least to greatest) unless `ascending` property is changed to `false`.
 *
 * @param array the sorted array to search within (the array can be in ascending or descending order)
 * @param value the value to insert into the array while maintaining order
 * @param searchWindow refers to the window of the array to search within, first-inclusive and last-exclusive
 * (i.e. [0, 10] means search from index 0 to index 9, inclusive of 0 and exclusive of 10)
 * @param valueExtractor a function that extracts the comparable value from each item in the array
 * @returns the index of the rightmost insertion point for x in the array, in other words, it'll insert behind the index we return
 * (ex: x = 5, array = [7, 6, 4, 3, 2, 1] would return 2)
 */
function bisectRight<T, U extends Comparable>({
  array,
  value,
  valueExtractor,
  searchWindow = [0, array.length],
  ascending = true,
}: BisectArgs<T, U>) {
  let [left, right] = searchWindow;

  const windowLength = right - left;
  if (windowLength <= 0) {
    if (windowLength < 0) {
      console.warn(
        `search window has invalid bounds that are out of order: left: ${left}, right: ${right}`
      );
    }
    return left;
  }

  const first = array.at(left);
  const last = array.at(right - 1);

  if (first === undefined || last === undefined) {
    console.warn(
      `search window first and or last values are undefined: first: ${first}, last: ${last}`
    );
    return left;
  }

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = valueExtractor(array[mid]);
    const isValueRightOfMid = ascending ? value >= midValue : value <= midValue;
    if (isValueRightOfMid) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

export { bisectLeft, bisectRight };
