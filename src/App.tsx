import React from "react";
import "./App.css";
import { areMatricesEq, arrayRange } from "./helpers/index";

const createMatrix = (a: number) => {
  const mtrx: number[][] = [];
  for (let i = 0; i < a; i++) {
    mtrx[i] = new Array(a).fill(null);
  }
  return mtrx;
};

const findAndUpdateFibonaciSubarray = (
  array: (number | null)[]
): (number | null)[] => {
  let len: number = 2;
  const arraysOfIndexesIfFibonacci: number[][] = [];
  for (let i = 2; i < array.length; i++) {
    // If previous subarray can be extended
    if (
      array[i - 2] !== null &&
      array[i] === Number(array[i - 1]) + Number(array[i - 2])
    ) {
      // save the index
      len++;
      if (len >= 5) {
        arraysOfIndexesIfFibonacci.push([...arrayRange(i - len + 1, i)]);
      }
    }
    // Any 2 terms are Fibonacci-like
    else {
      len = 2;
    }
  }
  let maxLen = -1;
  let index = -1;
  arraysOfIndexesIfFibonacci.forEach((row, i) => {
    if (row.length > maxLen) {
      maxLen = row.length;
      index = i;
    }
  });
  if (arraysOfIndexesIfFibonacci[index]) {
    // Fill with null from position 2 until position 4

    return array.fill(
      null,
      arraysOfIndexesIfFibonacci?.[index]?.[0],
      arraysOfIndexesIfFibonacci?.[index]?.[
        arraysOfIndexesIfFibonacci?.[index]?.length
      ]
    );
  } else {
    return array;
  }
};

const updatedArray = (array: (number | null)[]): (number | null)[] => {
  return findAndUpdateFibonaciSubarray([...array]);
};

const generateEmptyCellsMatrix = (
  matrix: (number | null)[][]
): (number | null)[][] => {
  return matrix.map((row: (number | null)[]): (number | null)[] => {
    return updatedArray([...row]);
  });
};

const increaseColumnAndRow = (
  matrix: (number | null)[][],
  rowIndex: number,
  columnIndex: number
): (number | null)[][] => {
  return matrix.map((row, i): (number | null)[] => {
    if (i === rowIndex) {
      return row.map((element) => Number(element) + 1);
    }
    return row.map((element, j) => {
      if (j === columnIndex) {
        return Number(element) + 1;
      }
      return element;
    });
  });
};

const Cell = React.memo(
  ({
    onClick,
    active,
    children,
    rowIndex,
    green,
  }: {
    onClick: (rowIndex: number) => void;
    active: boolean;
    children: null | number;
    rowIndex: number;
    green: boolean;
  }) => {
    console.log("cell render");
    return (
      <button
        className="cell"
        style={
          green
            ? {
                backgroundColor: "green",
              }
            : active
            ? {
                backgroundColor: "yellow",
              }
            : {}
        }
        onClick={() => onClick(rowIndex)}
      >
        {children}
      </button>
    );
  }
);

const GenerateHorizontal = ({
  row,
  updateMatrix,
  columnIndex,
  greenArray = [],
}: {
  columnIndex: number;
  row: (number | null)[];
  updateMatrix: (columnIndex: number, rowIndex: number) => void;
  greenArray: boolean[];
}) => {
  const [cellStatus, setCellStatus] = React.useState<boolean>(false);
  const [activeCellCorrdinates, setActiveCellCorrdinates] = React.useState<
    | {
        x: number;
        y: number;
      }
    | undefined
  >();
  React.useEffect(() => {
    if (cellStatus && activeCellCorrdinates) {
      setTimeout(() => {
        setCellStatus(false);
        setActiveCellCorrdinates(undefined);
      }, 1000);
    }
  }, [cellStatus, activeCellCorrdinates]);

  const localUpdateMatrix = React.useCallback(updateMatrix, [updateMatrix]);
  const handleClick = React.useCallback(
    (rowIndex: number) => {
      localUpdateMatrix(columnIndex, rowIndex);
      setActiveCellCorrdinates({
        x: rowIndex,
        y: columnIndex,
      });
      setCellStatus(true);
    },
    [columnIndex, localUpdateMatrix]
  );

  return (
    <div className="row">
      {row.map((element, rowIndex) => (
        <Cell
          key={rowIndex + "i" + columnIndex}
          active={cellStatus && rowIndex === activeCellCorrdinates?.x}
          onClick={handleClick}
          rowIndex={rowIndex}
          green={greenArray[rowIndex] ?? false}
        >
          {element}
        </Cell>
      ))}
    </div>
  );
};

const Matrix = ({ amount }: { amount: number }) => {
  const [matrix, setMatrix] = React.useState<(number | null)[][]>(
    createMatrix(amount)
  );
  const [disabled, setDisabled] = React.useState(false);
  const [greenMatrix, setGreenMatrix] = React.useState<boolean[][]>([]);

  const checkGreenRow = React.useMemo(
    () =>
      (arr1: any[], arr2: any[]): boolean[] => {
        console.log("checkGreenRow() -- repeatable calculation calculated");
        return arr1.map((el1, i) => {
          if (arr2[i] === arr1[i]) {
            return false;
          } else {
            return true;
          }
        });
      },
    []
  );

  React.useEffect(() => {
    const newMatrix = generateEmptyCellsMatrix([...matrix]);
    setGreenMatrix(
      newMatrix.map((row, index) => checkGreenRow(row, matrix[index]))
    );
    if (!areMatricesEq(matrix, newMatrix)) {
      setDisabled(true);
      setTimeout(() => {
        setMatrix(newMatrix);
        setDisabled(false);
      }, 3000);
    }
  }, [matrix, checkGreenRow]);
  const updateMatrix = React.useCallback(
    (columnIndex: number, rowIndex: number) =>
      setMatrix((prev) => increaseColumnAndRow(prev, columnIndex, rowIndex)),
    [setMatrix]
  );
  if (amount < 5) {
    return <div>inclrease limit!</div>;
  }

  return (
    <div
      className={disabled ? "is-disabled column" : "column"}
      aria-disabled={disabled}
    >
      {matrix.map((row, columnIndex) => (
        <GenerateHorizontal
          key={columnIndex + "j"}
          row={row}
          columnIndex={columnIndex}
          updateMatrix={updateMatrix}
          greenArray={greenMatrix[columnIndex]}
        />
      ))}
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <Matrix amount={5} />
    </div>
  );
}
