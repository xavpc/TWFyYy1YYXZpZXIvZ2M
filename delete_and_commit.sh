

# bash ./delete_and_commit.sh ./api-prisma 2026-06-28 2026-07-13 40 "."

# Usage: ./delete_and_commit.sh <folder> <start-date> <end-date> <min-commits-per-day> <commit-msg>


# Parameters
FOLDER="${1:-.}"
START_DATE="${2:-2026-02-26}"
END_DATE="${3:-2026-02-28}"
MIN_PER_DAY="${4:-150}"
COMMIT_MSG="${5:-.}"

echo "========================================="
echo "Parameterized Delete & Commit Script"
echo "========================================="
echo "Folder: $FOLDER"
echo "Date Range: $START_DATE to $END_DATE"
echo "Min commits/day: $MIN_PER_DAY"
echo "Commit message: '$COMMIT_MSG'"
echo "========================================="
echo ""

# Generate array of dates between start and end
generate_dates() {
    local start=$1
    local end=$2
    local current=$start
    local dates=()

    while [[ "$current" < "$end" ]] || [[ "$current" == "$end" ]]; do
        dates+=("$current")
        current=$(date -d "$current + 1 day" +%Y-%m-%d 2>/dev/null || date -v+1d -j -f "%Y-%m-%d" "$current" +%Y-%m-%d 2>/dev/null)
    done

    echo "${dates[@]}"
}

# Get all dates in range
IFS=' ' read -r -a dates <<< "$(generate_dates "$START_DATE" "$END_DATE")"
num_dates=${#dates[@]}

echo "Number of dates: $num_dates"
echo "Dates: ${dates[@]}"
echo ""

# Read all files and shuffle them
echo "Finding all files in $FOLDER..."
mapfile -t all_files < <(find "$FOLDER" -type f 2>/dev/null | shuf)
total=${#all_files[@]}

if [ $total -eq 0 ]; then
    echo "ERROR: No files found in $FOLDER"
    exit 1
fi

echo "Total files to process: $total"
echo ""

# Calculate distribution
declare -a distribution
remaining=$total
min_required=$((MIN_PER_DAY * num_dates))

if [ $total -lt $min_required ]; then
    echo "WARNING: Not enough files ($total) for minimum $MIN_PER_DAY per day across $num_dates days"
    echo "Adjusting to distribute evenly..."
    MIN_PER_DAY=$((total / num_dates))
fi

echo "Calculating random distribution..."
# First, give each day the minimum
for ((i=0; i<num_dates; i++)); do
    distribution[$i]=$MIN_PER_DAY
done

# Calculate extra files to distribute randomly
extra_files=$((total - MIN_PER_DAY * num_dates))

# Randomly distribute extra files across all days
for ((i=0; i<extra_files; i++)); do
    random_day=$((RANDOM % num_dates))
    distribution[$random_day]=$((distribution[$random_day] + 1))
done

# Display distribution
for ((i=0; i<num_dates; i++)); do
    echo "  ${dates[$i]}: ${distribution[$i]} files"
done
echo ""

# Confirm before proceeding
echo "========================================="
echo "Ready to process $total files"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read -r

# Process files
file_index=0
total_commits=0

for date_idx in $(seq 0 $((num_dates-1))); do
    date="${dates[$date_idx]}"
    count="${distribution[$date_idx]}"

    echo ""
    echo "========================================="
    echo "Processing date: $date ($count files)"
    echo "========================================="

    for ((i=0; i<count; i++)); do
        file="${all_files[$file_index]}"

        if [ ! -e "$file" ]; then
            echo "  WARNING: File not found: $file"
            file_index=$((file_index + 1))
            continue
        fi

        # Add random time to spread commits throughout the day
        hour=$((RANDOM % 24))
        minute=$((RANDOM % 60))
        second=$((RANDOM % 60))
        commit_datetime="${date}T$(printf '%02d:%02d:%02d' $hour $minute $second)"

        # Delete the file
        git rm -f "$file" > /dev/null 2>&1

        if [ $? -ne 0 ]; then
            echo "  ERROR: Failed to remove $file"
            file_index=$((file_index + 1))
            continue
        fi

        # Commit with specific date
        GIT_AUTHOR_DATE="$commit_datetime" GIT_COMMITTER_DATE="$commit_datetime" git commit -m "$COMMIT_MSG" > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            total_commits=$((total_commits + 1))
        else
            echo "  ERROR: Failed to commit deletion of $file"
        fi

        # Progress indicator every 10 files
        if (( (i + 1) % 10 == 0 )); then
            echo "  Progress: $((i + 1))/$count files"
        fi

        file_index=$((file_index + 1))
    done

    echo "Completed $date: $count files processed"
done

echo ""
echo "========================================="
echo "SUMMARY"
echo "========================================="
echo "Total files processed: $file_index"
echo "Total commits created: $total_commits"
echo "Date range: $START_DATE to $END_DATE"
echo "========================================="
echo "Done!"
