<h1 align="center">MIPS to Binary Converter</h1>

<p align="center">
  <b>A teaching assembler: type a MIPS instruction, get its machine encoding —<br>
  or get told exactly what is wrong with it and what the correct form looks like.</b>
</p>

<p align="center">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white">
  <img alt="deps" src="https://img.shields.io/badge/dependencies-none-2ea44f?style=flat-square">
  <img alt="instructions" src="https://img.shields.io/badge/instructions-30+-blue?style=flat-square">
</p>

---

## What it is

MIPS is the instruction set most computer-architecture courses teach on, because its encoding is
regular enough to work out by hand. "Regular enough" still means memorising three instruction
formats, thirty-two register names and aliases, and which opcode goes where.

This is an interactive assembler built for that moment. You type:

```
add $t0, $t1, $t2
```

and it prints the fields of the machine word — opcode, `rs`, `rt`, `rd`, shift amount, function
code — laid out separately so you can see the *structure* of the encoding rather than a 32-bit
blob.

## The design idea worth keeping

**Every error message names the instruction and shows the correct format.**

```python
print("Invalid number of operands for 'and' instruction. Expected format: and $rd, $rs, $rt")
print("The register should start with '$' sign.")
print("Invalid register '{}'. Please use one of the MIPS registers.".format(r))
```

Thirty-odd instructions, each with its own operand-count check and its own worked example in the
failure path. For a learning tool this is the entire value proposition — a bare *"syntax error"*
teaches nothing, while *"Expected format: `lw $rt, offset($rs)`"* teaches the format the moment it
is needed. The register validator lists all 32 names and rejects anything outside them, so a typo
like `$t10` is caught with an explanation rather than silently mis-encoded.

## What it covers

| Format | Instructions |
|---|---|
| **R-type** | `add` `addu` `sub` `subu` `and` `or` `xor` `nor` `slt` `sltu` `sll` `srl` `sra` `sllv` `srlv` `srav` `mult` `multu` `div` `divu` `mfhi` `mflo` `jr` `jalr` |
| **I-type** | `addi` `subi` `slti` `li` `lw` `sw` `beq` `bne` `bgt` `bge` `blt` `ble` |
| **J-type** | `j` `jlar` |

Immediates are parsed in decimal, hex (`0x…`) and binary (`0b…`). Labels resolve through a small
symbol table (`loop → 0x100`, `start → 0x200`).

The full register file is mapped by name: `$zero`, `$at`, `$v0–$v1`, `$a0–$a3`, `$t0–$t9`,
`$s0–$s7`, `$k0–$k1`, `$gp`, `$sp`, `$fp`, `$ra`.

## Running it

```bash
git clone https://github.com/Vishal-AS-0407/MIPS-to-Binary-converter.git
cd MIPS-to-Binary-converter
python main.py
```

```
Enter your MIPS instruction:
add $t0, $t1, $t2
Do you want to enter another instruction? (yes/no): no
Thanks!
```

Instructions must be lowercase — the input check is deliberate, since MIPS mnemonics are
case-sensitive in most assemblers.

---

## Known issues, with fixes

The structure is sound and the opcode/function tables are largely right. These are the things that
stop it doing what the README promises, in rough order of impact.

### 1. Registers print in decimal, not binary

This is the one that matters, because it is the program's whole purpose:

```python
print("000000 {:05d} {:05d} {:05d} {} {}".format(registerNumber(rs), registerNumber(rt), ...))
```

`{:05d}` zero-pads a **decimal** number to five characters. For `add $t0, $t1, $t2` that gives:

```
000000 00009 00010 00008 00000 100000        ← what it prints
000000 01001 01010 01000 00000 100000        ← what the README shows, and what is correct
```

The fix is one character in three places — `{:05d}` → `{:05b}` in `rType`, `iType` and
`iTypeLabel`.

### 2. `lw` and `sw` call a function that does not exist

```python
offset, base = parseLwSwOffset(data[1])       # NameError
```

The function is defined as `check_Offset`. Renaming it fixes the crash — but it will then still
return `(None, None)`, because it tries `int("8($t1)")` before extracting the parenthesised part.
The parse needs to split first:

```python
def check_Offset(operand):                    # "8($t1)"  or  "-4($sp)"
    try:
        i = operand.index("(")
        offset = int(operand[:i])
        base   = operand[i + 1: operand.index(")")]
        return offset, base
    except (ValueError, IndexError):
        return None, None
```

### 3. `sll`, `srl` and `sra` reject their own shift amount

```python
rType(data[0], "00000", data[1], data[2], "000000")
```

`rType`'s signature is `(rd, rs, rt, sa, fn)`, and it validates all three of `rd`, `rs`, `rt` with
`register_dollar_check`. The literal `"00000"` passed as `rs` fails that check immediately, so the
shift instructions always return early. They need a variant that validates only `rd` and `rt` and
formats `sa` as a 5-bit binary field.

### 4. `jType` prints the label instead of an address

```python
def jType(opc, label):
    print("{} {}".format(opc, label))
```

`j loop` prints `000010 loop`. It should look the label up in the symbol table and emit the 26-bit
word address — the same `parseLabel` the branch instructions already use.

### 5. Some opcodes are not the instructions they claim to be

- **`subi`** is not a real MIPS instruction. `001001` is `addiu`. (Assemblers implement `subi` as
  `addi` with a negated immediate.)
- **`li`** is a pseudo-instruction; `001111` is `lui`. Real `li` expands to `lui` + `ori`, or to a
  single `addiu $rt, $zero, imm` for small values.
- **`blt`, `ble`, `bgt`, `bge`** are pseudo-instructions too. They are given `beq`/`bne`/`bgtz`/
  `blez` opcodes here, which will not do what the mnemonic says. Real MIPS expands them to
  `slt` + `beq`/`bne`.

Not wrong for a teaching tool — assemblers *do* accept all of these — but they should be expanded
rather than given invented encodings, and it is worth a note in the output that they are pseudo-ops.

### 6. Duplicate branches

`and`, `sub` and `jr` each appear twice in the `if/elif` chain. The second copy is unreachable.
Harmless, and a sign that the chain has outgrown its shape: a dispatch dictionary would make the
duplication impossible.

```python
R_TYPE = {"add": "100000", "addu": "100001", "sub": "100010", ...}
if op in R_TYPE:
    rType(*data, "00000", R_TYPE[op])
```

That single change would cut `main.py` by more than half and remove an entire class of bug.

### 7. Smaller things

- **`main()` is called at module level**, so `import main` runs the interactive loop. Guard it with
  `if __name__ == "__main__":`.
- **The symbol table is hard-coded** to two labels. Reading a whole `.asm` file and building the
  label table in a first pass — a real two-pass assembler — is the natural next version, and this
  code is already most of the way to it.
- **`registerNumber` will raise `KeyError`** if reached with an unvalidated register. In practice
  `register_dollar_check` runs first everywhere, but `.get(r)` with an explicit error would be
  safer.
