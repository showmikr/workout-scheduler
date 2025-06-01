type Comparable = number | bigint | string | Date;

type BisectArgs<T> = {
  array: T[];
  value: Comparable;
  valueExtractor: (arrayItem: T) => Comparable;
  searchWindow?: [number, number];
};

/**
 *
 * @param array the sorted array to search within (the array can be in ascending or descending order)
 * @param value the value to insert into the array while maintaining order
 * @param searchWindow refers to the window of the array to search within, first-inclusive and last-exclusive
 * (i.e. [0, 10] means search from index 0 to index 9, inclusive of 0 and exclusive of 10)
 * @param valueExtractor a function that extracts the comparable value from each item in the array
 * @returns the index of the leftmost insertion point for x in the array (ex: x = 5, array = [7, 6, 4, 3, 2, 1] would return 2)
 */
function bisectLeft<T>({
  array,
  value,
  valueExtractor,
  searchWindow = [0, array.length],
}: BisectArgs<T>) {
  let [left, right] = searchWindow;
  const first = array.at(left);
  const last = array.at(right - 1);

  if (!first || !last) return left; // If the search window is empty, return the leftmost index

  if (first === last) {
    return value > valueExtractor(last) ? right : 0;
  }

  const isAscending = first < last;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = valueExtractor(array[mid]);
    const isValueRightOfMid = isAscending ? value > midValue : value < midValue;
    if (isValueRightOfMid) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

/**
 *
 * @param array the sorted array to search within (the array can be in ascending or descending order)
 * @param value the value to insert into the array while maintaining order
 * @param searchWindow refers to the window of the array to search within, first-inclusive and last-exclusive
 * (i.e. [0, 10] means search from index 0 to index 9, inclusive of 0 and exclusive of 10)
 * @param valueExtractor a function that extracts the comparable value from each item in the array
 * @returns the index of the rightmost insertion point for x in the array, in other words, it'll insert behind the index we return
 * (ex: x = 5, array = [7, 6, 4, 3, 2, 1] would return 2)
 */
function bisectRight<T>({
  array,
  value,
  valueExtractor,
  searchWindow = [0, array.length],
}: BisectArgs<T>) {
  let [left, right] = searchWindow;
  const first = array.at(0);
  const last = array.at(-1);

  if (!first || !last) return left; // If the search window is empty, return the leftmost index
  if (first === last) return value > valueExtractor(last) ? right : 0;

  const isAscending = first < last;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = valueExtractor(array[mid]);
    const isValueRightOfMid =
      isAscending ? value >= midValue : value <= midValue;
    if (isValueRightOfMid) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

function test() {
  const array = [1, 2, 3, 4, 5];
  const value = 3;
  const valueExtractor = (item: number) => item;

  console.log(
    bisectLeft({
      array,
      value,
      valueExtractor,
    })
  ); // Should return 2
  console.log(bisectRight({ array, value, valueExtractor })); // Should return 3

  const descendingArray = [5, 4, 3, 2, 1];
  console.log(
    bisectLeft({
      array: descendingArray,
      value,
      valueExtractor,
    })
  ); // Should return 2
}

export { bisectLeft, bisectRight };
