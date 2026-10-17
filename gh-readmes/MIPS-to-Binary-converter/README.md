<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1E1E1E,55:7C3A10,100:F97316&height=220&section=header&text=MIPS%20%E2%86%92%20Binary&fontSize=60&fontColor=FFF7ED&fontAlignY=34&desc=A%20teaching%20assembler%20that%20explains%20its%20errors&descSize=19&descAlignY=57&animation=fadeIn" width="100%" alt="MIPS to Binary Converter"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2600&pause=900&color=F97316&center=true&vCenter=true&width=720&lines=add+%24t0%2C+%24t1%2C+%24t2;000000+01001+01010+01000+00000+100000;R-type+%C2%B7+I-type+%C2%B7+J-type+%E2%80%94+30%2B+instructions" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
<img src="https://img.shields.io/badge/Dependencies-none-2EA44F?style=for-the-badge" alt="no deps"/>
<img src="https://img.shields.io/badge/Instructions-30+-F97316?style=for-the-badge&labelColor=1E1E1E" alt="30+"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 What it is

MIPS is what architecture courses teach on because its encoding is regular enough to work out by
hand — which still means memorising three formats, 32 registers and their aliases, and every
opcode. Type an instruction, and this prints the **fields of the machine word separately** —
opcode, `rs`, `rt`, `rd`, shift, function — so you see the encoding's *structure*, not a 32-bit
blob.

<div align="center">
<img src="https://github.com/user-attachments/assets/f1a07530-a1ef-4a2e-a678-9e5bbc9d6e7e" alt="Sample output" width="75%"/>
</div>

## 🧠 How an instruction becomes bits

```mermaid
flowchart TD
    IN["⌨️ add $t0, $t1, $t2"] --> P["Parse mnemonic + operands"]
    P --> V{"✅ Valid?<br/>operand count · $ prefix · register name"}
    V -->|no| E["💬 Named error + correct format<br/>'Expected format: add $rd, $rs, $rt'"]
    V -->|yes| F{"Format"}
    F --> R["R-type<br/>op · rs · rt · rd · sa · fn"]
    F --> I["I-type<br/>op · rs · rt · imm"]
    F --> J["J-type<br/>op · address"]
    R & I & J --> OUT["🔢 Machine word, field by field"]
    style E fill:#7C3A10,stroke:#F97316,color:#FFF7ED
    style OUT fill:#F97316,stroke:#1E1E1E,color:#1E1E1E
```

> 💬 **The idea worth keeping:** every error names the instruction and shows the correct form. A
> bare *"syntax error"* teaches nothing; *"Expected format: `lw $rt, offset($rs)`"* teaches it the
> moment it's needed. `$t10` is caught with an explanation, not silently mis-encoded.

## 📋 Coverage

| Format | Instructions |
|---|---|
| 🟧 **R-type** | `add` `addu` `sub` `subu` `and` `or` `xor` `nor` `slt` `sltu` `sll` `srl` `sra` `sllv` `srlv` `srav` `mult` `multu` `div` `divu` `mfhi` `mflo` `jr` `jalr` |
| 🟦 **I-type** | `addi` `subi` `slti` `li` `lw` `sw` `beq` `bne` `bgt` `bge` `blt` `ble` |
| 🟩 **J-type** | `j` `jlar` |

Immediates in decimal, hex (`0x…`) or binary (`0b…`); all 32 registers by name — `$zero`, `$at`,
`$v0–1`, `$a0–3`, `$t0–9`, `$s0–7`, `$k0–1`, `$gp`, `$sp`, `$fp`, `$ra`.

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/MIPS-to-Binary-converter.git
cd MIPS-to-Binary-converter
python main.py
```

> 💡 **Tip:** mnemonics are lowercase, as in most assemblers.

## 🧭 Known issues & roadmap

<details>
<summary><b>Fixes, in order of impact</b></summary>

| # | Issue | Fix |
|:---:|---|---|
| 1 | Register fields print in **decimal** (`{:05d}`) | `{:05b}` in `rType`, `iType`, `iTypeLabel` |
| 2 | `lw`/`sw` call `parseLwSwOffset` (undefined) | rename to `check_Offset` and split on `(` before `int()` |
| 3 | `sll`/`srl`/`sra` pass `"00000"` as a register | a shift variant validating only `rd`, `rt` |
| 4 | `j` prints the label, not an address | look it up like the branches do |
| 5 | `subi`, `li`, `blt`… are pseudo-ops with invented opcodes | expand them (`addi` with −imm, `lui`+`ori`, `slt`+`beq`) |
| 6 | Duplicate `and` / `sub` / `jr` branches | a dispatch dict — halves `main.py` |

```python
def check_Offset(operand):                    # "8($t1)" or "-4($sp)"
    i = operand.index("(")
    return int(operand[:i]), operand[i + 1: operand.index(")")]
```

**Roadmap**
- [ ] Binary field output
- [ ] Two-pass assembler over a whole `.asm` file
- [ ] `if __name__ == "__main__":` guard

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-1E1E1E?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:F97316,45:7C3A10,100:1E1E1E&height=110&section=footer" width="100%" alt="footer"/>

</div>
