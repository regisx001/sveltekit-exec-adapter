for package in packages/*; do
    cd $package
    bun run build.ts
    cd ../..
done