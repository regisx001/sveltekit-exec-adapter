# Asset Validation

## Quick Reference

The SvelteKit Exec Adapter includes comprehensive asset validation to ensure build reliability and optimize binary size.

## Configuration

```javascript
// svelte.config.js
import adapter from "sveltekit-exec-adapter";

export default {
  kit: {
    adapter: adapter({
      validation: {
        maxAssetSize: 50 * 1024 * 1024, // 50MB per asset
        maxTotalSize: 500 * 1024 * 1024, // 500MB total
        warnThreshold: 10 * 1024 * 1024, // Warn at 10MB
        blockedExtensions: [".exe", ".dll"], // Block dangerous files
        warnExtensions: [".zip", ".tar"], // Warn about archives
        skip: false, // Set to true to disable
      },
    }),
  },
};
```

## What Gets Validated

- ✅ **File Existence**: Ensures all referenced assets exist
- ✅ **File Size**: Prevents oversized assets from bloating binaries
- ✅ **File Types**: Blocks potentially dangerous or problematic files
- ✅ **File Names**: Detects temporary/system files that shouldn't be embedded
- ✅ **Total Size**: Ensures combined assets don't exceed limits

## Default Limits

| Setting         | Default Value | Purpose                            |
| --------------- | ------------- | ---------------------------------- |
| `maxAssetSize`  | 50 MB         | Maximum individual asset size      |
| `maxTotalSize`  | 500 MB        | Maximum total embedded asset size  |
| `warnThreshold` | 10 MB         | Warning threshold for large assets |

## Blocked Extensions

By default, these file types are blocked:

- `.exe`, `.dll`, `.so`, `.dylib` (Executables)
- `.app`, `.deb`, `.rpm` (Installers)

## Warning Extensions

These file types trigger warnings:

- `.zip`, `.tar`, `.gz`, `.rar` (Archives)
- `.7z`, `.iso`, `.dmg` (Disk images)

## Common Issues

### "Asset too large" Error

```bash
❌ Asset too large: /images/video.mp4 (78.5MB, max: 50.0MB)
```

**Solutions:**

- Compress the asset
- Use external hosting
- Increase `maxAssetSize` limit

### "Blocked file type" Error

```bash
❌ Blocked file type: /downloads/app.exe (.exe)
```

**Solutions:**

- Remove the file from static assets
- Add to `allowedExtensions` if necessary
- Use external download links

### "Total size exceeds limit" Error

```bash
❌ Total asset size exceeds limit: 523.4 MB (max: 500.0 MB)
```

**Solutions:**

- Set `embedStatic: false`
- Remove unnecessary assets
- Increase `maxTotalSize`

## Disable Validation

For development or when validation is not needed:

```javascript
adapter({
  validation: {
    skip: true,
  },
});
```

⚠️ **Warning**: Skipping validation removes important safety checks.

## See Also

- [Full Asset Validation Documentation](../../ASSET_VALIDATION.md)
- [Adapter Configuration Options](./README.md#configuration)
- [Asset Optimization Guide](./docs/optimization.md)
