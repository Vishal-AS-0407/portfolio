<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,55:0F5F58,100:14B8A6&height=220&section=header&text=Telephone%20Directory&fontSize=54&fontColor=F0FDFA&fontAlignY=34&desc=A%20contact%20book%20in%20C%2C%20stored%20as%20fixed-size%20binary%20records&descSize=18&descAlignY=57&animation=fadeIn" width="100%" alt="Telephone Directory"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2600&pause=900&color=14B8A6&center=true&vCenter=true&width=720&lines=%F0%9F%93%87+Add+%C2%B7+search+%C2%B7+modify+%C2%B7+delete+%C2%B7+tags;%F0%9F%94%A2+Count+%3D+file+size+%2F+sizeof(contact);%E2%8F%AA+Newest-first+by+seeking+backwards" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/C-Windows_(MinGW)-A8B9CC?style=for-the-badge&logo=c&logoColor=white" alt="C"/>
<img src="https://img.shields.io/badge/Storage-binary_file-14B8A6?style=for-the-badge&labelColor=0F172A" alt="binary file"/>
<img src="https://img.shields.io/badge/Dependencies-libc_+_conio-2EA44F?style=for-the-badge" alt="deps"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 What it is

A menu of operations over a single file called `PhoneBook`:

| # | Operation | How |
|:---:|---|---|
| 1 | ➕ **Create** | first/last name, 10-digit mobile, tag — duplicates rejected |
| 2 | 📋 **Display** | oldest first, or **newest first** by seeking backwards |
| 3 | 🏷️ **By tag** | `family`, `work`… case-insensitive |
| 4 | ✏️ **Modify** | find by name, change each field with y/n |
| 5 | 🔍 **Search** | by full name or mobile number |
| 6 | 🗑️ **Delete** | by mobile or name |
| 8 | 💣 **Delete all** | after confirmation |

<div align="center">
<img src="https://github.com/user-attachments/assets/08bd9a31-1ff9-454e-b9ad-ce72480b389b" alt="Main menu" width="70%"/>
</div>

## 🧠 The design

```mermaid
flowchart TD
    S["struct contact<br/>4 × 15-byte strings"] --> F[("📁 PhoneBook<br/>records back to back")]
    F --> C["🔢 Count = size / sizeof(contact)<br/>no header to keep in sync"]
    F --> R["⏪ Newest first<br/>seek −sizeof, step back"]
    F --> M["✏️ Modify / 🗑️ Delete<br/>stream → helper → copy back"]
    style F fill:#0F5F58,stroke:#14B8A6,color:#F0FDFA
```

> 💡 Fixed-size records make counting arithmetic and reverse listing a seek — nothing is loaded
> into memory. Edits use the classic copy-through, so the original is never edited in place.

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/Telephone-Directory.git
cd Telephone-Directory
gcc -o directory telephone-directory.c
directory.exe
```

> 💡 **Tip:** it uses `getch()`, `strlwr()` and `system("cls")`, so build on **Windows** (MinGW
> or MSVC).

## 🧭 Known issues & roadmap

<details>
<summary><b>Fix these first — they can corrupt saved contacts</b></summary>

| # | Issue | Fix |
|:---:|---|---|
| 1 | `strlwr` lowercases names **in place** during compare, then writes them back | `_stricmp` / `strcasecmp` |
| 2 | Uninitialised `flag` in delete can copy an empty file over the book | `int flag = 0;` |
| 3 | Binary structs in text-mode files (`"r"`, `"w"`) misalign on Windows | `"rb"`, `"wb"`, `"ab"` |
| 4 | Unbounded `scanf("%s")`; `char phone[10]` for 10 digits + `\0` | `%14s`; `phone[11]` |
| 5 | `fopen` results unchecked on an empty book | check for `NULL` |

Also: close handles once, include `<ctype.h>`/`<conio.h>`, replace `fflush(stdin)` with
`scanf(" %c", ...)`, exit with `0` on a normal quit.

**Roadmap**
- [ ] Data-safety fixes above
- [ ] Portable build (no `conio.h`)
- [ ] Sorted listing and partial-name search

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-0F172A?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:14B8A6,45:0F5F58,100:0F172A&height=110&section=footer" width="100%" alt="footer"/>

</div>
