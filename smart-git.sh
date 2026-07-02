#!/usr/bin/env bash
# smart-git.sh — commit + push ครั้งเดียวจบ (zero prompt)
#
# ใช้งาน:
#   ./smart-git.sh                          # auto commit message จากไฟล์ที่เปลี่ยน
#   ./smart-git.sh "ข้อความ commit"         # ระบุ message เอง
#   ./smart-git.sh -i                       # โหมดถาม message (ถ้าต้องการ)
#   COMMIT_MSG="..." ./smart-git.sh         # message ผ่าน env
#
# ตัวแปร (optional): BRANCH, REMOTE, WORKFLOW_NAME

set -euo pipefail

REMOTE="${REMOTE:-origin}"
WORKFLOW_NAME="${WORKFLOW_NAME:-hugo.yml}"
INTERACTIVE=0
MSG=""

for arg in "$@"; do
  case "$arg" in
    -i|--interactive) INTERACTIVE=1 ;;
    -h|--help)
      sed -n '2,10p' "$0"
      exit 0
      ;;
    *) [ -z "$MSG" ] && MSG="$arg" ;;
  esac
done

MSG="${COMMIT_MSG:-$MSG}"
BRANCH="${BRANCH:-$(git branch --show-current)}"

die() { echo "❌ $*" >&2; exit 1; }

git rev-parse --git-dir >/dev/null 2>&1 || die "ไม่ใช่ git repository"

echo "🚀 smart-git → $REMOTE/$BRANCH"

git fetch "$REMOTE"

conflicts=$(git diff --name-only --diff-filter=U || true)
[ -z "$conflicts" ] || die "พบ conflict:\n$conflicts"

if git rev-parse --verify "$REMOTE/$BRANCH" >/dev/null 2>&1; then
  behind=$(git rev-list --count "HEAD..$REMOTE/$BRANCH" 2>/dev/null || echo 0)
  [ "${behind:-0}" -eq 0 ] || git pull --rebase "$REMOTE" "$BRANCH"
fi

git diff --quiet && git diff --cached --quiet && { echo "✅ ไม่มีการเปลี่ยนแปลง"; exit 0; }

git add -A

if [ -z "$MSG" ] && [ "$INTERACTIVE" -eq 1 ]; then
  git diff --cached --stat
  read -r -p "Commit message: " MSG
fi

if [ -z "$MSG" ]; then
  files=$(git diff --cached --name-only | head -6 | paste -sd ', ' -)
  MSG="Update ${files:-project files}"
fi

git commit -m "$MSG"
git push -u "$REMOTE" "$BRANCH"

echo "✅ Push สำเร็จ — Actions จะ deploy อัตโนมัติ (push main)"
command -v gh >/dev/null && gh run list --workflow="$WORKFLOW_NAME" --limit 1 2>/dev/null || true
