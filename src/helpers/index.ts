export const arrayRange = (start: number, stop: number) =>
  Array.from({ length: stop - start + 1 }, (value, index) => start + index);
export const areMatricesEq = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};
