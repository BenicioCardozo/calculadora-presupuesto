# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:BenicioCardozo/calculadora-presupuesto.git master:gh-pages

cd -