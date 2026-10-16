<h1 align="center">Telephone Directory</h1>

<p align="center">
  <b>A contact book in C: fixed-size records in a binary file, with add, search,<br>
  modify, delete, tag filters and newest-first listing.</b>
</p>

<p align="center">
  <img alt="C" src="https://img.shields.io/badge/C-Windows_(MinGW)-A8B9CC?style=flat-square&logo=c&logoColor=white">
  <img alt="storage" src="https://img.shields.io/badge/storage-binary_file-555?style=flat-square">
  <img alt="deps" src="https://img.shields.io/badge/dependencies-libc_+_conio-2ea44f?style=flat-square">
</p>

---

## What it is

A menu of eight operations over a single file called `PhoneBook`:

| # | Operation | How it works |
|---|---|---|
| 1 | **Create contact** | first name, last name, 10-digit mobile, tag. Rejects a duplicate number |
| 2 | **Display directory** | oldest first, or **newest first** by seeking backwards through the file |
| 3 | **Display by tag** | all contacts with a tag such as `family` or `work`, case-insensitive |
| 4 | **Modify contact** | find by name, then change each field with a y/n prompt |
| 5 | **Search** | by full name or by mobile number |
| 6 | **Delete contact** | by mobile number or by name |
| 8 | **Delete all** | removes the file after a confirmation |

## The design

Every contact is a `struct` of four 15-byte strings, and the file is just those structs back to
back, written with `fwrite`. That buys three things:

- **Counting is arithmetic.** The number of contacts is `file size / sizeof(contact)`. There is
  no header to keep in sync.
- **Reverse order is a seek.** Newest-first starts at `-sizeof(contact)` from the end and steps
  back two records after each read. Nothing is loaded into memory.
- **Delete and modify use the classic copy-through.** Stream every record into a `helper` file,
  dropping or changing the matching one, then copy `helper` back over `PhoneBook`. The original
  is never edited in place.

Input is validated before anything is written: names must be alphabetic, the mobile number must
be exactly ten digits, and it must not already exist in the file.

## Running it

The program uses `getch()`, `strlwr()` and `system("cls")`, so it builds on **Windows** with
MinGW or MSVC:

```bash
git clone https://github.com/Vishal-AS-0407/Telephone-Directory.git
cd Telephone-Directory
gcc -o directory telephone-directory.c
directory.exe
```

---

## Known issues, with fixes

These come from reading the source. Issues 1 to 3 can lose or corrupt saved contacts, so fix
them first.

### 1. Modify and delete-by-name lowercase every name in the file

```c
if (strcmp(strlwr(cn.fname), strlwr(fname)) == 0 && ...)
...
fwrite(&cn, sizeof(contact), 1, fptr1);
```

`strlwr` lowercases its argument **in place**. The comparison runs on every record, which then
gets written to `helper` and copied back. So one modify, or one delete by name, permanently turns
"Vishal" into "vishal" for **every contact in the book**. Display-by-tag does the same to tags,
though only in memory.

Compare without mutating. Use `_stricmp` on Windows or `strcasecmp` on POSIX, or lowercase into
a temporary buffer.

### 2. A wrong menu choice in Delete can wipe the phone book

`delete_contact` declares `int flag;` without initialising it. On an invalid choice nothing is
copied to `helper`. If `flag` happens to hold `1`, the empty `helper` is copied over `PhoneBook`,
and every contact is gone. Initialise it: `int flag = 0;`.

### 3. Binary records in text-mode files

The files are opened with `"r"`, `"w"` and `"a"`. On Windows, text mode turns every `0x0A` byte
into `0x0D 0x0A` on write and back on read. A struct is binary: the bytes after each string's
terminator are uninitialised and can be anything, including `0x0A`. When one is, the record grows
by a byte, and every record after it is read misaligned. Text mode also makes the `fseek`/`ftell`
arithmetic in the record count and reverse listing unreliable. Use `"rb"`, `"wb"`, `"ab"`.

### 4. Buffer overflows on input

- Every `scanf("%s", ...)` is unbounded. A 15-character name overruns `fname[15]`. Use `%14s`.
- Search by phone reads into `char phone[10]`. A valid 10-digit number needs **11** bytes with
  its terminator, so every correct search writes one byte past the buffer.

### 5. Crashes on an empty phone book

`modify_contact`, `directory_info` and `tag_info` call `fopen` and use the result without checking
for `NULL`, and `search_contact` calls `exit(1)` when there is no file. Before the first contact
is added, options 4 and 5 either crash or quit the program.

### 6. Smaller things

- **File handles leak or are closed twice.** `directory_info` and `tag_info` never close.
  `search_contact` closes only when nothing is found. `modify_contact` closes both files twice
  when the contact is not found.
- **Missing headers.** `isdigit` and `isalpha` need `<ctype.h>`, and `getch` needs `<conio.h>`.
  Older compilers warn about the implicit declarations, and C99 and later compilers reject them.
- **`fflush(stdin)` is undefined behaviour** outside MSVC. On Linux the leftover newline is read
  as the answer to the next `<y/n>` prompt, which skips it. Use `scanf(" %c", &modify)`, with a
  leading space.
- **Exit uses `exit(1)`**, which reports failure for a normal quit. Use `exit(0)`, or just
  `return 0` from `main`.
- `typedef struct contact contact;` and `#include <stdio.h>` each appear twice.
