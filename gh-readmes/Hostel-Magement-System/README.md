<h1 align="center">Hostel Management System</h1>

<p align="center">
  <b>A console application for one hostel block: student records, room allocation<br>
  at four to a room, and attendance, kept in flat text files between runs.</b>
</p>

<p align="center">
  <img alt="Java" src="https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white">
  <img alt="deps" src="https://img.shields.io/badge/dependencies-none-2ea44f?style=flat-square">
  <img alt="interface" src="https://img.shields.io/badge/interface-console-555?style=flat-square">
</p>

---

## What it is

A menu-driven program for the warden of a hostel annex. Twelve operations over three kinds of
record:

| Area | Operations |
|---|---|
| **Students** | add · display all · search by name or roll number · modify · remove · group by department |
| **Rooms** | allocate a student to a room · remove a student from a room · show every room with its occupants |
| **Attendance** | mark a student present or absent · show it alongside room occupancy |
| **Housekeeping** | delete all data |

The model is three small classes. `Student` holds name, roll number, department and a present
flag. `Room` holds up to **four** students, and `isFull()` enforces the cap. `HostelManagementSystem`
owns the lists and the file I/O. Departments are a closed `enum` (`AIE`, `CSE`, `CYS`), so a typo
in a department is rejected at entry rather than creating a fourth department nobody meant.

## The parts done well

- **Validation at the door.** A roll number must match `\d{5}` and must not already exist. A name
  must be alphabetic. A department must parse as the enum. Each check loops until the input is
  right instead of failing the whole operation.
- **Capacity is a property of the room**, not a check scattered through the menu code. Allocation
  asks the room whether it is full and asks it whether the student is already there.
- **Persistence survives a restart.** Students go to `student_data.txt` as CSV, attendance to
  `attendance.txt` as `roll,P|A`, and both load in the constructor.

## Running it

The public class is `Main`, so the file has to be compiled under that name (see issue 1):

```bash
git clone https://github.com/Vishal-AS-0407/Hostel-Magement-System.git
cd Hostel-Magement-System
cp HostelManagementSystem.java Main.java
javac Main.java
java Main
```

Run it in an interactive terminal. Piped input does not work (see issue 4).

---

## Known issues, with fixes

Verified by compiling with JDK 17 and driving the menu.

### 1. It does not compile as committed

```
HostelManagementSystem.java:596: error: class Main is public, should be declared in a file named Main.java
```

Java requires a `public` class to live in a file of the same name. Either rename the file to
`Main.java`, or drop `public` from `class Main`. Either way the program then starts with
`java Main`, not `java HostelManagementSystem` as the old README said, because
`HostelManagementSystem` has no `main` method.

### 2. Searching by name crashes the program

```java
if (student.getName().equalsIgnoreCase(searchTerm) || student.getRollNumber() == Integer.parseInt(searchTerm))
```

If the first student in the list is not the one being searched for, the right-hand side runs
`Integer.parseInt("bob")` and throws. Nothing catches it, so the whole program exits:

```
Exception in thread "main" java.lang.NumberFormatException: For input string: "bob"
    at HostelManagementSystem.searchStudent(...)
```

Decide which kind of search term it is once, before the loop:

```java
Integer roll = searchTerm.matches("\\d+") ? Integer.valueOf(searchTerm) : null;
for (Student s : students) {
    if (s.getName().equalsIgnoreCase(searchTerm) || (roll != null && s.getRollNumber() == roll)) { ... }
}
```

### 3. Changes are not saved, so removed students come back

`student_data.txt` is only ever **appended** to, in `addStudent`. `removeStudent` and
`modifyStudent` change the in-memory list and never touch the file, so after a restart a removed
student is back and a renamed student has their old name. Room allocations are never written
anywhere, so every room is empty on the next run. (The old README listed a `rooms.txt` that the
code never creates.)

The fix is a single `saveAll()` that rewrites the students file, plus a rooms file of
`room,roll` lines. Call it after every operation that mutates state.

### 4. A new `Scanner(System.in)` in every method

`Main` has a `Scanner` on stdin, and every operation opens another one. Each `Scanner` buffers
ahead, so the first one can take input meant for the second. In an interactive terminal this
mostly works because input arrives one line at a time. Piped input fails at the first prompt:

```
Exception in thread "main" java.util.NoSuchElementException: No line found
```

Pass the single `Scanner` from `Main` into `HostelManagementSystem` and use it everywhere.

### 5. Room integrity

- **Removing a student does not remove them from their room**, so the room listing keeps showing
  someone who no longer exists.
- **A student can be allocated to several rooms.** `containsStudent` checks only the target room.
- **"Room number (1-10)" is not enforced.** Any integer, including negative ones, creates a room.
- **`modifyStudent` skips the validation** that `addStudent` applies, so a modified department
  can be any string. That student then disappears from the by-department report, which matches
  only `AIE`, `CSE` and `CYS`.

### 6. Smaller things

- The name check `[a-zA-Z]+` rejects names with a space or an initial, such as "Vishal A S".
- Attendance is a single boolean with no date. Marking someone present overwrites yesterday.
- One malformed line in `student_data.txt` throws `NumberFormatException` and stops the load
  at that point, silently dropping every student after it.
- The repo name is misspelled "Magement". Renaming the repo is free, and GitHub redirects the
  old URL.
