

# bash ./delete_and_commit.sh ./api-prisma 2026-06-28 2026-07-13 40 "."

#!/bin/bash

# Usage: ./dot_commit_loop.sh <date> <commit-msg>
# Example: ./delete_and_commit.sh "1987-01-14 10:30:00" "commit"

COMMIT_DATE="${1:-1991-02-26 00:00:00}"
COMMIT_MSG="${2:-.}"
FILE="a.txt"

echo "========================================="
echo "File Add/Delete Commit Loop"
echo "========================================="
echo "File: $FILE"
echo "Commit date: $COMMIT_DATE"
echo "Commit message: '$COMMIT_MSG'"
echo "Press Ctrl+C to stop."
echo "========================================="
echo ""

# Ensure the file exists
touch "$FILE"

loop_count=0

while true; do
    loop_count=$((loop_count + 1))
    echo "--- Loop #$loop_count ---"

    # --- Step 1: Delete a.txt ---
    rm -f "$FILE"
    git rm --cached "$FILE" > /dev/null 2>&1
    git add -A
    GIT_AUTHOR_DATE="$COMMIT_DATE" GIT_COMMITTER_DATE="$COMMIT_DATE" git commit -m "$COMMIT_MSG" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "  [-] Deleted $FILE and committed"
    else
        echo "  [!] Failed to commit after deleting $FILE"
    fi

    # --- Step 2: Add a.txt ---
    touch "$FILE"
    git add "$FILE"
    GIT_AUTHOR_DATE="$COMMIT_DATE" GIT_COMMITTER_DATE="$COMMIT_DATE" git commit -m "$COMMIT_MSG" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "  [+] Added $FILE and committed"
    else
        echo "  [!] Failed to commit after adding $FILE"
    fi

done
