# Publishing the repo READMEs

There are 27 READMEs in this folder, one per repo, each in a folder named exactly after the repo.
None of them are pushed, because I have no write access to your GitHub account.

## One repo

```bash
git clone https://github.com/Vishal-AS-0407/<repo>.git
cp gh-readmes/<repo>/README.md <repo>/README.md
cd <repo>
git add README.md
git commit -m "Rewrite README from the source"
git push
```

## All of them at once

From the root of this portfolio repo, in Git Bash:

```bash
mkdir -p ../readme-push && cd ../readme-push
for dir in ../portfolio/gh-readmes/*/; do
  repo=$(basename "$dir")
  git clone -q "https://github.com/Vishal-AS-0407/$repo.git" || { echo "skip $repo"; continue; }
  cp "$dir/README.md" "$repo/README.md"
  git -C "$repo" add README.md
  git -C "$repo" commit -q -m "Rewrite README from the source" && echo "ready  $repo"
done
# look at a few with `git -C <repo> show`, then:
for repo in */; do git -C "$repo" push -q && echo "pushed $repo"; done
```

Two exceptions:

- **`portfolio/`** describes *this* codebase, the two sites in one deployment. Its local remote is
  `Vishal-AS-0407/temp`, but a `Vishal-AS-0407/portfolio` repo also exists. Put the README in
  whichever repo your Vercel project deploys from, and consider archiving the other one so there
  is a single source.
- **The profile README** is not here. It lives in `gh-profile/`, with its own
  `HOW-TO-PUBLISH.md`.

## Before you push — read the "Known issues" sections

Most READMEs end with a **Known issues, with fixes** section. These are real defects found by
reading or running the code, and each one comes with its fix. Publishing them is a choice. They
show you know where your own code is weak, and reviewers tend to respect that. But a few are
quick enough that fixing the code first is the better move:

| Repo | Fix | Effort |
|---|---|---|
| `Quiz-Website` | Question 4's answer key is wrong (head, not body). Restore the deleted background image and `thankyou.html` | 5 min |
| `Hostel-Magement-System` | Drop `public` from `class Main` so it compiles. Guard `Integer.parseInt` in search | 5 min |
| `Dijkstra-Algorithm` | Validate the value read, not `scanf`'s return. Delete the second `fclose` | 5 min |
| `MIPS-to-Binary-converter` | `{:05d}` → `{:05b}` in three places | 2 min |
| `Telephone-Directory` | `int flag = 0;` in `delete_contact`. Open files with `"rb"`/`"wb"`/`"ab"` | 5 min |

If you fix one, delete its entry from the README's issue list before you push.

## Exposed credentials — do this first

See the table at the bottom of `TASK-TRACKER.md`. Ten repos have live API keys or passwords in
their public history. Rotating them is the one step on this page that protects you, and a README
does not. Revoke and reissue each key first, then publish.

## While you are in each repo

Set a **description** and **topics** (the gear icon next to *About*). Suggested text for every
repo is in `gh-profile/REPO-METADATA.md`. 27 of 29 repos have neither, and it is the first thing
a visitor sees.
