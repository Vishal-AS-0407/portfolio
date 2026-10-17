<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,55:7A1E3C,100:FF416C&height=220&section=header&text=Dijkstra's%20Shortest%20Path&fontSize=50&fontColor=FFF1F2&fontAlignY=34&desc=C%20%C2%B7%20adjacency%20matrix%20%C2%B7%20HTML%20result%20with%20the%20path%20highlighted&descSize=17&descAlignY=57&animation=fadeIn" width="100%" alt="Dijkstra's Shortest Path"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2600&pause=900&color=FF416C&center=true&vCenter=true&width=720&lines=1+%E2%86%92+3+%E2%86%92+5+%C2%B7+total+25.00;O(V%C2%B2)+%E2%80%94+right+for+a+dense+matrix;Results+exported+as+an+HTML+table" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/C-C99-A8B9CC?style=for-the-badge&logo=c&logoColor=white" alt="C"/>
<img src="https://img.shields.io/badge/Dependencies-libc_only-2EA44F?style=for-the-badge" alt="libc"/>
<img src="https://img.shields.io/badge/Time-O(V²)-FF416C?style=for-the-badge&labelColor=0F172A" alt="O(V^2)"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 What it is

Enter an undirected weighted graph of up to 20 nodes, a source and a target. The program prints
the adjacency matrix, runs Dijkstra, prints the path and its length — and writes
`dijkstra_result.html` with **the shortest-path edges highlighted**, opening it automatically on
Windows.

<div align="center">
<img src="https://github.com/user-attachments/assets/abfc5361-f894-41d5-a2c4-285926f7d15f" alt="HTML output" width="80%"/>
</div>

```
Enter the number of nodes in the graph (up to 20): 5
Enter the weight of the path between nodes 1 and 2 (or 6969 for no path): 10
...
Shortest path from 1 to 5:
1 -> 3 -> 5
Total distance: 25.00
```

## 🧠 The algorithm

```mermaid
flowchart TD
    A["📥 Read graph<br/>each pair once · i &lt; j · mirrored"] --> B["dist[] = ∞, dist[src] = 0<br/>prev[] = −1"]
    B --> C["🔍 Pick unvisited node<br/>with the smallest dist"]
    C --> D{"Reachable node left?"}
    D -->|no| G
    D -->|yes| E["Relax every edge<br/>dist[u] + w &lt; dist[v] → update, prev[v] = u"]
    E -->|"repeat V − 1 times"| C
    E --> G["🔙 Walk prev[] back from target"]
    G --> H["🖨️ Console + 🌐 HTML table"]
    style E fill:#7A1E3C,stroke:#FF416C,color:#FFF1F2
    style H fill:#FF416C,stroke:#0F172A,color:#0F172A
```

| Choice | Why |
|---|---|
| 📊 **Linear-scan minimum, O(V²)** | a heap only helps sparse graphs; on a 20-node matrix the scan is simpler and as fast |
| ↔️ **Undirected input** | each weight entered once, written to `cost[i][j]` and `cost[j][i]` |
| 🚫 **Negative weights rejected** | Dijkstra is incorrect on negative edges |
| ⏹️ **Early stop** | when no reachable unvisited node remains |

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/Dijkstra-Algorithm.git
cd Dijkstra-Algorithm
gcc -std=c99 -o dijkstra dijkstra.c
./dijkstra
```

> 💡 **Tip:** build from source rather than using the committed `dijkstra.exe`.

## 🧭 Known issues & roadmap

<details>
<summary><b>Fixes</b></summary>

- 🔢 **Range checks validate `scanf`'s return value, not the input** — read, then validate:
  ```c
  if (scanf("%d", &nodes) != 1 || !validateInput(nodes, 1, MAX_NODES, "Invalid number of nodes"))
      return EXIT_FAILURE;
  ```
- 📄 `exportToHTML` closes the file twice — delete the trailing `fprintf`/`fclose`.
- ♾️ `6969` doubles as "no edge" and initial distance, so totals ≥ 6969 read as "no path" — use
  `INFINITY` for `dist[]` and a separate sentinel for input.
- 🎨 Zero-weight edges render as `-`; `.path-info` styles are missing; `∞` is mojibake in the
  Windows console.

**Roadmap**
- [ ] Input validation fix
- [ ] Proper infinity
- [ ] Graph drawn as SVG in the HTML report

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-0F172A?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF416C,45:7A1E3C,100:0F172A&height=110&section=footer" width="100%" alt="footer"/>

</div>
