"""Publish the rebuilt READMEs and repo "About" metadata to GitHub.

    python gh-readmes/publish.py --dry-run          # show what would change
    python gh-readmes/publish.py                    # push READMEs + set metadata
    python gh-readmes/publish.py --only WISP,Memora # a subset

Uses the GitHub token git already has (`git credential fill`). Each README is
committed through the contents API, so nothing is cloned. The profile README
(gh-profile/README.md) goes to the Vishal-AS-0407/Vishal-AS-0407 repo. The
`portfolio` folder is skipped: that README lives at this repo's root and ships
with a normal `git push`.
"""
import argparse, base64, json, pathlib, subprocess, sys, urllib.error, urllib.request

OWNER = "Vishal-AS-0407"
HERE = pathlib.Path(__file__).resolve().parent
API = "https://api.github.com"
MESSAGE = "docs: rebuild README"


def token():
    out = subprocess.run(["git", "credential", "fill"], input="protocol=https\nhost=github.com\n\n",
                         capture_output=True, text=True).stdout
    return dict(l.split("=", 1) for l in out.splitlines() if "=" in l)["password"]


def call(tok, method, path, body=None):
    req = urllib.request.Request(API + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": f"token {tok}",
                                          "Accept": "application/vnd.github+json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise SystemExit(f"{method} {path}: {e.code} {e.read()[:300]!r}")


def put_readme(tok, repo, text, dry):
    meta = call(tok, "GET", f"/repos/{OWNER}/{repo}/readme")
    path = meta["path"] if meta else "README.md"
    current = base64.b64decode(meta["content"]).decode("utf-8", "replace") if meta else ""
    if current.strip() == text.strip():
        return "unchanged"
    if dry:
        return f"would update {path}"
    body = {"message": MESSAGE, "content": base64.b64encode(text.encode()).decode()}
    if meta:
        body["sha"] = meta["sha"]
    call(tok, "PUT", f"/repos/{OWNER}/{repo}/contents/{path}", body)
    return f"updated {path}"


def set_about(tok, repo, m, dry):
    if dry:
        return "would set description + topics"
    patch = {"description": m["description"]}
    if m.get("homepage"):
        patch["homepage"] = m["homepage"]
    call(tok, "PATCH", f"/repos/{OWNER}/{repo}", patch)
    call(tok, "PUT", f"/repos/{OWNER}/{repo}/topics", {"names": m["topics"]})
    return "about set"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--only", default="")
    a = ap.parse_args()
    only = set(filter(None, a.only.split(",")))
    meta = json.loads((HERE / "repo-metadata.json").read_text(encoding="utf-8"))
    tok = token()

    jobs = [(d.name, d / "README.md") for d in sorted(HERE.iterdir())
            if (d / "README.md").exists() and d.name != "portfolio"]
    jobs.append((OWNER, HERE.parent / "gh-profile" / "README.md"))

    for repo, readme in jobs:
        if only and repo not in only:
            continue
        r = put_readme(tok, repo, readme.read_text(encoding="utf-8"), a.dry_run)
        m = set_about(tok, repo, meta[repo], a.dry_run) if repo in meta else ""
        print(f"{repo:<70} {r:<22} {m}")
    if "portfolio" in meta and (not only or "portfolio" in only):
        print(f"{'portfolio':<70} {'(README via git push)':<22} "
              f"{set_about(tok, 'portfolio', meta['portfolio'], a.dry_run)}")


if __name__ == "__main__":
    sys.exit(main())
