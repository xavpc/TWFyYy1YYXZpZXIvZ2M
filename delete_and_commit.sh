

# bash ./delete_and_commit.sh 1991-01-06 1991-01-07

#!/bin/bash

# Usage: ./delete_and_commit.sh <from-date> <to-date>
# Example: ./delete_and_commit.sh 1991-01-01 1997-12-30

FROM_DATE="${1:-1991-01-01}"
TO_DATE="${2:-1991-12-31}"
FILE="a.txt"

generate_random_msg() {
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 8
}

generate_random_time() {
    local base_date="$1"
    hour=$(printf "%02d" $((RANDOM % 24)))
    minute=$(printf "%02d" $((RANDOM % 60)))
    second=$(printf "%02d" $((RANDOM % 60)))
    echo "$base_date $hour:$minute:$second"
}

advance_date() {
    date -d "$1 + 1 day" +%Y-%m-%d
}

echo "========================================="
echo "File Add/Delete Commit Loop"
echo "========================================="
echo "File: $FILE"
echo "Date range: $FROM_DATE to $TO_DATE"
echo "Commit message: random 8-char alphanumeric"
echo "Press Ctrl+C to stop."
echo "========================================="
echo ""

# Ensure the file exists
touch "$FILE"

loop_count=0
CURRENT_DATE="$FROM_DATE"
to_epoch=$(date -d "$TO_DATE" +%s)

while true; do
    loop_count=$((loop_count + 1))
    echo "--- Loop #$loop_count | Date: $CURRENT_DATE ---"

    # --- Step 1: Delete a.txt ---
    COMMIT_DATE="$(generate_random_time "$CURRENT_DATE")"
    COMMIT_MSG="$(generate_random_msg)"
    rm -f "$FILE"
    git rm --cached "$FILE" > /dev/null 2>&1
    git add -A
    GIT_AUTHOR_DATE="$COMMIT_DATE" GIT_COMMITTER_DATE="$COMMIT_DATE" git commit -m "$COMMIT_MSG" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      
    else
        echo "  [!] Failed to commit after deleting $FILE"
    fi

    # --- Step 2: Add a.txt ---
    COMMIT_DATE="$(generate_random_time "$CURRENT_DATE")"
    COMMIT_MSG="$(generate_random_msg)"
    touch "$FILE"
    git add "$FILE"
    GIT_AUTHOR_DATE="$COMMIT_DATE" GIT_COMMITTER_DATE="$COMMIT_DATE" git commit -m "$COMMIT_MSG" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "  [+] Added $FILE and committed ($COMMIT_DATE)"
    else
        echo "  [!] Failed to commit after adding $FILE"
    fi

    # Advance date; reset to FROM_DATE when TO_DATE is reached
    CURRENT_DATE="$(advance_date "$CURRENT_DATE")"
    if [ "$(date -d "$CURRENT_DATE" +%s)" -gt "$to_epoch" ]; then
        echo "  [~] Reached end of range, resetting to $FROM_DATE"
        CURRENT_DATE="$FROM_DATE"
    fi

done
