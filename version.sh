version_file=src/renderer/model/AppVersion.ts
> $version_file
echo "// This file was generated on $(date)
export const appVersion = '$1';" >> $version_file
git add $version_file
