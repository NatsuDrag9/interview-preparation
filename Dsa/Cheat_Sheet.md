## Table of Contents

- [Order of Growth](#order-of-growth)
- [Notations](#notations)
  - [Big O](#big-o)
  - [Time Complexity](#time-complexity)
  - [Space Complexity](#space-complexity)

---

### Order of Growth

```
c < Log(Log(n)) < Log(n) < (n^1/3) < (n^1/2) < n < n Log(n) < n^2 < (n^2)*(Log(n)) < n^3 < n^4 < 2^n < n^n
```

### Notations

Used to categorize the analysis of the algorithms

#### Big O

Used to describe the time or space complexity of an algorithm. It expresses the upper bound of an algorithm's time or space complexity. Provides an **upper limit** on the time taken by an algorithm in terms of size of the input.

To find Big O of an expression:

- Ignore the lower order terms and consider only the highest order term
- Ignore the constant associated with the highest order term

**Linear Time Complexity: O(n)**
The running time of an algorithm grows linearly with the size of the input.

**Logarithmic Time Complexity: O(log n)**
Running time of an algorithm is proportional to the logarithm of the input size.

**Quadratic Time Complexity: O(n^2)**
Running time of an algorithm is proportional to the square of the input size.

**Cubing Time Complexity: O(n^3)**
Running time of algorithm is proportional to the cube of the input size.

**Polynomial Time Complexity: O(n^k)**
Time complexity of an algorithm that can be expressed as a polynomial function of the input size n.

**Exponential Time Complexity: O(2^n)**
Running time of an algorithm doubles with each addition to the input data set.

**Factorial Time Complexity: O(n!)**
Running time of an algorithm grows factorially with the size of the input.

#### Time Complexity

Time complexity is **not** equal to the actual time required to execute a particular code, but the number of times a statement executes.

#### Space Complexity

_Auxiliary Space_ is the extra space or temporary space used by an algorithm.

The _space complexity_ of an algorithm is the total space taken by the algorithm with respect to the input size. It includes both auxiliary space and space used by input.

Space complexity is a parallel concept to time complexity. If we need to create an array of size n, this will require O(n) space. If we create a two-dimensional array of size n\*n, this will require O(n2) space.
