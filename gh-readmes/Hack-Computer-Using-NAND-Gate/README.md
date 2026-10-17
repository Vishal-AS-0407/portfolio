<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0D1117,55:14532D,100:22C55E&height=220&section=header&text=The%20Hack%20Computer&fontSize=56&fontColor=F0FDF4&fontAlignY=34&desc=A%2016-bit%20computer%2C%20built%20up%20from%20NAND%20gates&descSize=19&descAlignY=57&animation=fadeIn" width="100%" alt="The Hack Computer"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2600&pause=900&color=22C55E&center=true&vCenter=true&width=720&lines=NAND+%E2%86%92+gates+%E2%86%92+RAM16K+%E2%86%92+CPU+%E2%86%92+Computer;16+chips%2C+every+one+tested;factorial.asm+runs+on+it" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/Nand2Tetris-projects_03_+_05-22C55E?style=for-the-badge&labelColor=0D1117" alt="nand2tetris"/>
<img src="https://img.shields.io/badge/HDL-16_chips-2563EB?style=for-the-badge" alt="16 chips"/>
<img src="https://img.shields.io/badge/Tests-.tst_+_.cmp-8A2BE2?style=for-the-badge" alt="tested"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 What this is

The hardware half of *The Elements of Computing Systems* (Nisan & Schocken): start from one
primitive — **NAND** — and build every chip up to a CPU that runs machine code. Afterwards, nothing
in a processor is magic. You built the program counter. You know why `jmp` is three bits.

## 🧠 The build

```mermaid
flowchart TD
    N["🔲 NAND — the only primitive"] --> G["Not · And · Or · Mux · DMux · Inc16 · ALU"]
    G --> SEQ["Bit → Register → RAM8 → RAM64<br/>→ RAM512 → RAM4K → RAM16K"]
    G --> ROUTE["DMux4/8Way · Mux4/8Way16"]
    SEQ --> MEM["🗄️ Memory<br/>RAM + Screen + Keyboard"]
    ROUTE --> MEM
    SEQ --> CPU["🧠 CPU<br/>A · D · ALU · PC"]
    G --> CPU
    MEM --> COMP["💻 Computer"]
    CPU --> COMP
    COMP --> ASM["▶️ factorial.asm"]
    style CPU fill:#14532D,stroke:#22C55E,color:#F0FDF4
    style COMP fill:#22C55E,stroke:#0D1117,color:#0D1117
```

| ⏱️ Sequential | 🔀 Routing | 🏗️ Top level |
|---|---|---|
| `Bit` · `Register` · `PC` | `DMux4Way` · `DMux8Way` | `CPU` |
| `RAM8` · `RAM64` · `RAM512` | `Mux4Way16` · `Mux8Way16` | `Memory` |
| `RAM4K` · `RAM16K` | `Inc16` | `Computer` |

Each chip ships with its `.hdl`, a `.tst` script, a `.cmp` golden file and the `.out` result.

## 🔬 The chips worth reading

<details open>
<summary><b>🧠 <code>CPU.hdl</code> — the ALU control word <i>is</i> the instruction</b></summary>

```hdl
ALU(x=D, y=AM,
    zx=instruction[11], nx=instruction[10],
    zy=instruction[9],  ny=instruction[8],
    f=instruction[7],   no=instruction[6],
    out=outtM, out=outM, zr=zr, ng=ng);
```

Six control bits wired straight from the instruction — no decoder, no microcode. The encoding and
the datapath were designed together.

```hdl
And(a=instruction[15], b=instruction[0], out=jgt);
And(a=pos, b=nzr, out=posnzr);          // > 0 = not negative AND not zero
And(a=jgt, b=posnzr, out=ld1);
...
PC(in=A, load=ld, inc=true, reset=reset, out[0..14]=pc);
```

Three condition bits give all seven jumps (`JGT` … `JMP`), and `PC(load=ld, inc=true)` is the whole
fetch cycle: **jump if a condition fired, otherwise increment**. Every gate is ANDed with bit 15, so
an A-instruction can never jump or read memory.

</details>

<details>
<summary><b>🗄️ <code>Memory.hdl</code> — memory-mapped I/O in six lines</b></summary>

```hdl
DMux4Way(in=load, sel=address[13..14], a=loadram1, b=loadram2, c=loadscreen, d=loadkbd);
Or(a=loadram1, b=loadram2, out=loadram);
RAM16K(in=in, load=loadram, address=address[0..13], out=ramout);
Screen(in=in, load=loadscreen, address=address[0..12], out=scrout);
Keyboard(out=kbout);
Mux4Way16(a=ramout, b=ramout, c=scrout, d=kbout, sel=address[13..14], out=out);
```

RAM gets two quarters of the address space, Screen one, Keyboard one. Writing 16384 lights a pixel;
reading 24576 reads a key — with the same instructions as any memory access.

</details>

<details>
<summary><b>▶️ <code>factorial.asm</code> — multiply by repeated addition</b></summary>

```asm
(loop)
@f
D=M
@product
M=M+D      // Hack has no multiply instruction
@temp
M=M-1
D=M
@loop
D;JGT
```

The constraint is the lesson: what the hardware does vs what software must supply.

</details>

## 🚀 Running it

Needs the [Nand2Tetris software suite](https://www.nand2tetris.org/software) (Java, no install).

| Step | Action |
|:---:|---|
| 1️⃣ | Open the **Hardware Simulator** |
| 2️⃣ | *File → Load Chip* → `computer/<Chip>.hdl` |
| 3️⃣ | *File → Load Script* → `computer/<Chip>.tst` |
| 4️⃣ | **Run** — output is compared against `.cmp` automatically |

> 💡 **Tip:** load `Computer.hdl` and run `computerfactorial.tst` to execute the program on the
> machine you built.

<details>
<summary><b>📝 Notes</b></summary>

- 🔁 Memory is recursive: each RAM chip is eight of the one below plus three address bits —
  `RAM16K` is eight lines, not 16,384 flip-flops.
- 🧱 `Not`, `And`, `Or`, `Mux16`, `ALU`, `Screen`, `Keyboard` are projects 01–02 (simulator
  builtins); this repo holds **project 03 (sequential) and 05 (architecture)**.

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-0D1117?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:22C55E,45:14532D,100:0D1117&height=110&section=footer" width="100%" alt="footer"/>

</div>
