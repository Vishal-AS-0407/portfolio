<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1E293B,55:7A4A0E,100:F59E0B&height=220&section=header&text=Hostel%20Management%20System&fontSize=46&fontColor=FFFBEB&fontAlignY=34&desc=Students%20%C2%B7%20rooms%20of%20four%20%C2%B7%20attendance%20%E2%80%94%20in%20Java&descSize=18&descAlignY=57&animation=fadeIn" width="100%" alt="Hostel Management System"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=2600&pause=900&color=F59E0B&center=true&vCenter=true&width=720&lines=%F0%9F%8F%A0+12+operations+for+a+hostel+warden;%F0%9F%9B%8F%EF%B8%8F+Rooms+cap+at+four+%E2%80%94+the+room+enforces+it;%F0%9F%92%BE+Data+survives+a+restart" alt="typing summary"/>

<br/>

<img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java"/>
<img src="https://img.shields.io/badge/Dependencies-none-2EA44F?style=for-the-badge" alt="no deps"/>
<img src="https://img.shields.io/badge/Interface-console-F59E0B?style=for-the-badge&labelColor=1E293B" alt="console"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

## 📌 What it is

A menu-driven program for the warden of a hostel annex — twelve operations over three kinds of
record.

| Area | Operations |
|---|---|
| 🎓 **Students** | add · display · search by name/roll · modify · remove · group by department |
| 🛏️ **Rooms** | allocate · remove from room · show every room with occupants |
| ✅ **Attendance** | mark present/absent · show alongside occupancy |
| 🧹 **Housekeeping** | delete all data |

## 🧠 Design

<div align="center">
<table>
<tr>
<td align="center" width="50%"><b>📐 UML</b><br/><img src="https://github.com/user-attachments/assets/bbc68042-85d0-479f-a5cd-cf1e768ae82b" alt="UML diagram"/></td>
<td align="center" width="50%"><b>🖥️ Interface</b><br/><img src="https://github.com/user-attachments/assets/da4f0c9c-8bf5-4a5a-9a7b-3a18ad1c3ef3" alt="Console interface"/></td>
</tr>
</table>
</div>


## ✨ Done well

<table>
<tr>
<td width="33%" valign="top">

### 🚪 Validation at the door
Roll numbers match `\d{5}` and must be unique; names alphabetic; departments parse as an enum —
each check loops until right.

</td>
<td width="33%" valign="top">

### 🛏️ Capacity lives in the room
Allocation asks the room if it's full and if the student is already there.

</td>
<td width="33%" valign="top">

### 💾 Persistence
Students in `student_data.txt` (CSV), attendance in `attendance.txt` (`roll,P|A`), loaded on start.

</td>
</tr>
</table>

## 🚀 Getting started

```bash
git clone https://github.com/Vishal-AS-0407/Hostel-Magement-System.git
cd Hostel-Magement-System
cp HostelManagementSystem.java Main.java      # the public class is Main
javac Main.java
java Main
```

> 💡 **Tip:** run it in an interactive terminal — piped input trips the per-method `Scanner`s.

## 🧭 Known issues & roadmap

<details>
<summary><b>Fixes (verified with JDK 17)</b></summary>

| # | Issue | Fix |
|:---:|---|---|
| 1 | `public class Main` in `HostelManagementSystem.java` won't compile | rename the file to `Main.java` |
| 2 | Searching by name calls `Integer.parseInt("bob")` and crashes | decide roll-vs-name once, before the loop |
| 3 | Remove/modify never touch the file; rooms are never saved | one `saveAll()` after every mutation |
| 4 | A new `Scanner(System.in)` per method | pass one `Scanner` through |
| 5 | Removed students stay in rooms; a student can be in several rooms | update rooms on remove; check all rooms |

```java
Integer roll = searchTerm.matches("\\d+") ? Integer.valueOf(searchTerm) : null;
for (Student s : students) {
    if (s.getName().equalsIgnoreCase(searchTerm) || (roll != null && s.getRollNumber() == roll)) { ... }
}
```

**Roadmap**
- [ ] Compile fix + single `Scanner`
- [ ] Full persistence including rooms
- [ ] Dated attendance
- [ ] Names with spaces ("Vishal A S")

</details>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" alt="divider"/>

<div align="center">

<a href="https://portfolio-sigma-blond-57.vercel.app"><img src="https://img.shields.io/badge/Portfolio-1E293B?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
<a href="https://www.linkedin.com/in/vishal-a-s04/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="https://github.com/Vishal-AS-0407"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>

⭐ **If this helped you, star the repo!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:F59E0B,45:7A4A0E,100:1E293B&height=110&section=footer" width="100%" alt="footer"/>

</div>
