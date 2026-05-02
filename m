Remove the lock file first, then fix it:

```bash
# Remove the lock file
rm /Users/harshath/Downloads/RA2311026010085/.git/index.lock

# Now remove node_modules from git tracking
cd /Users/harshath/Downloads/RA2311026010085
git rm -r --cached stage2/node_modules
git rm -r --cached stage2/.next 2>/dev/null || true

# Add gitignore
cat << 'EOF' > stage2/.gitignore
node_modules/
.next/
EOF

# Commit and push
git add .
git commit -m "Stage 2: remove node_modules from git"
git push
```