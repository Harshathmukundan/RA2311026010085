cd /Users/harshath/Downloads/RA2311026010085

# Commit the pending changes first
git add .
git commit -m "add gitignore"

# Now rewrite history to remove node_modules
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --index-filter \
  'git rm -rf --cached --ignore-unmatch stage2/node_modules' \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin main --force