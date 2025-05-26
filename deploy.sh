#!/usr/bin/env sh

set -e

npm run build

cd dist

# Для SPA (Vue Router в history mode)
echo '/* /index.html 200' > _redirects 

echo > .nojekyll

git init
git checkout -b gh-pages
git add -A
git commit -m 'Deploy'

git push -f git@github.com:withapoll/doubleB-CRM.git gh-pages

cd -