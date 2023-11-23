npm pkg set scripts.prepare="husky install"
npm run prepare
Add a hook:

npx husky add .husky/pre-commit "npm test"
git add .husky/pre-commit
Make a commit:

git commit -m "Keep calm and commit"
# `npm test` will run