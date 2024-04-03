// const MOD = 10 ** 9 + 7; // Large prime number for modulo operation

// function minimumCost(A) {
//   A.sort((a, b) => a - b);
//   console.log(A);
//   let cost = 0;
//   for (let i = 0; i < A.length - 1; i++) {
//     cost += A[i] + A[i + 1];
//   }
//   return cost;
// }

// // Example usage:
// const A = [36, 26, 22, 24];
// const result = minimumCost(A);
// console.log(result); // Output: 216

// class MinHeap {
//   constructor() {
//     this.heap = [];
//   }

//   getParentIndex(index) {
//     return Math.floor((index - 1) / 2);
//   }

//   getLeftChildIndex(index) {
//     return index * 2 + 1;
//   }

//   getRightChildIndex(index) {
//     return index * 2 + 2;
//   }

//   swap(index1, index2) {
//     const temp = this.heap[index1];
//     this.heap[index1] = this.heap[index2];
//     this.heap[index2] = temp;
//   }

//   push(value) {
//     this.heap.push(value);
//     this.heapifyUp();
//   }

//   pop() {
//     if (this.isEmpty()) return null;

//     if (this.size() === 1) {
//       return this.heap.pop();
//     }

//     const minValue = this.heap[0];
//     this.heap[0] = this.heap.pop();
//     this.heapifyDown();
//     return minValue;
//   }

//   heapifyUp() {
//     let currentIndex = this.heap.length - 1;
//     while (currentIndex > 0) {
//       const parentIndex = this.getParentIndex(currentIndex);
//       if (this.heap[currentIndex] < this.heap[parentIndex]) {
//         this.swap(currentIndex, parentIndex);
//         currentIndex = parentIndex;
//       } else {
//         break;
//       }
//     }
//   }

//   heapifyDown() {
//     let currentIndex = 0;
//     while (this.getLeftChildIndex(currentIndex) < this.heap.length) {
//       const leftChildIndex = this.getLeftChildIndex(currentIndex);
//       const rightChildIndex = this.getRightChildIndex(currentIndex);
//       let smallerChildIndex = leftChildIndex;
//       if (rightChildIndex < this.heap.length && this.heap[rightChildIndex] < this.heap[leftChildIndex]) {
//         smallerChildIndex = rightChildIndex;
//       }
//       if (this.heap[currentIndex] > this.heap[smallerChildIndex]) {
//         this.swap(currentIndex, smallerChildIndex);
//         currentIndex = smallerChildIndex;
//       } else {
//         break;
//       }
//     }
//   }

//   peek() {
//     if (this.isEmpty()) return null;
//     return this.heap[0];
//   }

//   size() {
//     return this.heap.length;
//   }

//   isEmpty() {
//     return this.size() === 0;
//   }
// }

// function minCostToJoinBoards(A) {
//   const heap = new MinHeap();

//   // Add all board lengths to the heap
//   for (const length of A) {
//     heap.push(length);
//   }

//   let totalCost = 0;

//   // Keep joining until only one board remains
//   while (heap.size() > 1) {
//     const firstBoard = heap.pop();
//     const secondBoard = heap.pop();
//     const cost = firstBoard + secondBoard;
//     totalCost += cost;
//     heap.push(cost); // Push the joined board back into the heap
//   }

//   return totalCost;
// }

function minCostToJoinBoards(A) {
  // Sort the array of board lengths
  A.sort((a, b) => a - b);

  let totalCost = 0;

  // Keep combining the two smallest boards until only one board remains
  while (A.length > 1) {
    // Combine the two smallest boards
    const combinedLength = A[0] + A[1];
    totalCost += combinedLength;

    // Remove the two smallest boards and add the combined board length
    A.splice(0, 2, combinedLength);

    // Re-sort the array (not efficient but simpler for this case)
    A.sort((a, b) => a - b);
  }

  return totalCost;
}

// Test cases
console.log(minCostToJoinBoards([2, 4, 3])); // Output: 14
console.log(minCostToJoinBoards([36, 26, 22, 24])); // Output: 0 (Only one board, no cost)
