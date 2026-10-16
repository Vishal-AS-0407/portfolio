<h1 align="center">Dijkstra's Shortest Path</h1>

<p align="center">
  <b>Dijkstra's algorithm in C over an adjacency matrix, with the answer exported<br>
  as an HTML table that highlights the edges on the shortest path.</b>
</p>

<p align="center">
  <img alt="C" src="https://img.shields.io/badge/C-C99-A8B9CC?style=flat-square&logo=c&logoColor=white">
  <img alt="deps" src="https://img.shields.io/badge/dependencies-libc_only-2ea44f?style=flat-square">
  <img alt="complexity" src="https://img.shields.io/badge/time-O(V²)-blue?style=flat-square">
</p>

---

## What it is

You enter an undirected weighted graph of up to 20 nodes, one edge weight at a time, then a
source and a target. The program prints the adjacency matrix, runs Dijkstra, prints the path and
its length, and writes `dijkstra_result.html`, opening it automatically on Windows.

```
Enter the number of nodes in the graph (up to 20): 5
Enter the weight of the path between nodes 1 and 2 (or 6969 for no path): 10
...
Enter the source node (1-5): 1
Enter the target node (1-5): 5

Shortest path from 1 to 5:
1 -> 3 -> 5
Total distance: 25.00
```

![HTML output](https://github.com/user-attachments/assets/abfc5361-f894-41d5-a2c4-285926f7d15f)

## How it works

The textbook array version of the algorithm, which is the right choice for a dense matrix:

1. `dist[]` starts at infinity everywhere except the source, and `prev[]` at `-1`.
2. Repeat V−1 times. Pick the unvisited node with the smallest `dist`, mark it visited, and
   relax every edge out of it. If `dist[u] + w < dist[v]`, update `dist[v]` and set
   `prev[v] = u`.
3. Stop early if no reachable unvisited node is left, which means the rest of the graph is
   disconnected from the source.
4. Rebuild the path by following `prev[]` back from the target.

Selecting the minimum with a linear scan makes it O(V²). With a binary heap it would be
O((V+E) log V), which helps only on sparse graphs. On a full matrix of 20 nodes the scan is
simpler and just as fast.

The graph is **undirected**: each weight is entered once for the pair `(i, j)` with `i < j`, and
written to both `cost[i][j]` and `cost[j][i]`. That halves the typing, and it means the program
never asks for a weight twice. Negative weights are rejected and re-asked, which matters because
Dijkstra is incorrect on negative edges.

## Running it

```bash
git clone https://github.com/Vishal-AS-0407/Dijkstra-Algorithm.git
cd Dijkstra-Algorithm
gcc -std=c99 -o dijkstra dijkstra.c
./dijkstra
```

The repo also contains a prebuilt `dijkstra.exe`. Build from source instead. A committed binary
cannot be reviewed, and it goes stale the moment the `.c` file changes.

---

## Known issues, with fixes

### 1. The range checks check the wrong number

```c
if (!validateInput(scanf("%d", &nodes), 1, MAX_NODES, "Invalid number of nodes"))
```

`validateInput` receives the **return value of `scanf`**, which is the count of items read: `1`
on success. It never sees `nodes`. So every numeric input passes, and the bounds are never
enforced:

- `nodes = 25` passes, and the initialisation loop writes past the end of the 20×20 `cost`
  matrix on the stack.
- `source = 99` passes, and `dist[source - 1] = 0` writes outside `dist[]`.

Read first, then validate the value:

```c
if (scanf("%d", &nodes) != 1 || !validateInput(nodes, 1, MAX_NODES, "Invalid number of nodes"))
    return EXIT_FAILURE;
```

The same change is needed for `source` and `target`.

### 2. The HTML file is closed twice

`exportToHTML` writes the closing tags and calls `fclose(file)`. Then, after a leftover comment
(`// Rest of the function remains the same...`), it calls `fprintf(file, ...)` and
`fclose(file)` again on the handle it has already closed. Both calls are undefined behaviour. On
some C runtimes they crash, and on others they silently do nothing. Delete the last two lines
before the `#ifdef`.

### 3. `6969` is both "no edge" and a real distance

`INF` is a number a user can legitimately type, and it is also the starting value of `dist[]`. The
second use is the real problem. Relaxation only accepts a path if it is shorter than the current
`dist`, so **any path whose total is 6969 or more is reported as "No path exists"**. For example,
edges of 4000 and 4000 between 1, 2 and 3 give no route from 1 to 3.

Use `INFINITY` from `<math.h>` (or `DBL_MAX`) for `dist[]`, and ask the user for a negative number
or a letter to mean "no edge".

### 4. Smaller things

- **Zero-weight edges show as "no path" in the HTML.** The `cost[i][j] == 0 && i != j` branch
  prints `-`, the same as the diagonal. A zero-weight edge is valid.
- **`∞` in `printGraph` is UTF-8**, which shows as mojibake in a default Windows console. The HTML
  side uses `&infin;` correctly.
- **The `.path-info` and `.total-distance` classes have no styles.** The `<style>` block ends at a
  `// ... rest of the styles remain the same ...` comment, so the summary under the table renders
  unstyled.
- **The HTML total is recomputed** from the path's edges instead of using `dist[target]`. They
  agree, but it is a second source of truth for the same number.
