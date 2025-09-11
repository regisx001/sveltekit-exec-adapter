#!/usr/bin/env bun

/**
 * Windows Metadata Testing Script for SvelteKit Exec Adapter
 * Tests if Windows executable metadata and icons are properly embedded
 *
 * Usage: bun run test-metadata.js <path-to-exe>
 * Example: bun run test-metadata.js ./dist/my-app.exe
 */

import { $ } from 'bun';
import { existsSync, statSync } from 'fs';
import { join, resolve, extname } from 'path';

// Color codes for terminal output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m'
};

/**
 * Check if running on Windows platform
 */
function checkWindowsPlatform() {
	if (process.platform !== 'win32') {
		console.log(`${colors.red}❌ This test must be run on Windows platform${colors.reset}`);
		console.log(`${colors.yellow}Current platform: ${process.platform}${colors.reset}`);
		console.log(
			`${colors.blue}💡 Windows metadata can only be tested on Windows systems${colors.reset}`
		);
		process.exit(1);
	}

	console.log(`${colors.green}✅ Running on Windows platform${colors.reset}`);
}

/**
 * Validate executable file
 */
function validateExecutable(exePath) {
	const resolvedPath = resolve(exePath);

	console.log(`${colors.cyan}🔍 Validating executable: ${resolvedPath}${colors.reset}`);

	if (!existsSync(resolvedPath)) {
		console.log(`${colors.red}❌ File not found: ${resolvedPath}${colors.reset}`);
		console.log(
			`${colors.yellow}💡 Make sure to build your app first with: npm run build${colors.reset}`
		);
		process.exit(1);
	}

	const ext = extname(resolvedPath).toLowerCase();
	if (ext !== '.exe') {
		console.log(`${colors.red}❌ File is not a Windows executable (.exe)${colors.reset}`);
		console.log(`${colors.yellow}Current extension: ${ext}${colors.reset}`);
		process.exit(1);
	}

	const stats = statSync(resolvedPath);
	const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

	console.log(`${colors.green}✅ Valid executable found${colors.reset}`);
	console.log(`${colors.blue}   Size: ${sizeMB}MB${colors.reset}`);
	console.log(`${colors.blue}   Modified: ${stats.mtime.toISOString()}${colors.reset}`);

	return resolvedPath;
}

/**
 * Extract metadata using PowerShell
 */
async function extractMetadata(exePath) {
	console.log(`\n${colors.cyan}📋 Extracting Windows metadata...${colors.reset}`);

	try {
		// PowerShell script to extract file version information
		const psScript = `
      $ErrorActionPreference = 'Stop'
      try {
        $info = [System.Diagnostics.FileVersionInfo]::GetVersionInfo('${exePath}')
        
        $metadata = @{
          'ProductName' = $info.ProductName
          'FileDescription' = $info.FileDescription
          'ProductVersion' = $info.ProductVersion
          'FileVersion' = $info.FileVersion
          'CompanyName' = $info.CompanyName
          'LegalCopyright' = $info.LegalCopyright
          'OriginalFilename' = $info.OriginalFilename
          'InternalName' = $info.InternalName
        }
        
        # Output as JSON for easier parsing
        $metadata | ConvertTo-Json -Compress
      }
      catch {
        Write-Error "Failed to extract metadata: $($_.Exception.Message)"
        exit 1
      }
    `;

		const result = await $`powershell -NoProfile -Command ${psScript}`.text();

		const metadata = JSON.parse(result.trim());

		console.log(`${colors.green}✅ Metadata extracted successfully${colors.reset}`);
		return metadata;
	} catch (error) {
		console.log(`${colors.red}❌ Failed to extract metadata${colors.reset}`);
		console.log(`${colors.red}Error: ${error.message}${colors.reset}`);

		// Fallback: try basic file properties
		try {
			console.log(`${colors.yellow}🔄 Trying fallback method...${colors.reset}`);
			const fallbackResult =
				await $`powershell -Command "Get-ItemProperty '${exePath}' | Select-Object Name, VersionInfo | ConvertTo-Json"`.text();
			console.log(`${colors.blue}Fallback result: ${fallbackResult}${colors.reset}`);
		} catch (fallbackError) {
			console.log(
				`${colors.red}❌ Fallback method also failed: ${fallbackError.message}${colors.reset}`
			);
		}

		process.exit(1);
	}
}

/**
 * Test icon embedding
 */
async function testIcon(exePath) {
	console.log(`\n${colors.cyan}🎨 Testing icon embedding...${colors.reset}`);

	try {
		// PowerShell script to check if icon is embedded
		const iconScript = `
      $ErrorActionPreference = 'Stop'
      try {
        Add-Type -AssemblyName System.Drawing
        $icon = [System.Drawing.Icon]::ExtractAssociatedIcon('${exePath}')
        
        if ($icon) {
          $iconInfo = @{
            'HasIcon' = $true
            'Width' = $icon.Width
            'Height' = $icon.Height
            'Size' = "$($icon.Width)x$($icon.Height)"
          }
        } else {
          $iconInfo = @{
            'HasIcon' = $false
            'Width' = 0
            'Height' = 0
            'Size' = 'No icon'
          }
        }
        
        $iconInfo | ConvertTo-Json -Compress
      }
      catch {
        @{
          'HasIcon' = $false
          'Error' = $_.Exception.Message
        } | ConvertTo-Json -Compress
      }
    `;

		const result = await $`powershell -NoProfile -Command ${iconScript}`.text();
		const iconInfo = JSON.parse(result.trim());

		if (iconInfo.HasIcon) {
			console.log(`${colors.green}✅ Custom icon detected${colors.reset}`);
			console.log(`${colors.blue}   Size: ${iconInfo.Size}${colors.reset}`);
		} else {
			console.log(
				`${colors.yellow}⚠️  No custom icon detected or using default icon${colors.reset}`
			);
			if (iconInfo.Error) {
				console.log(`${colors.red}   Error: ${iconInfo.Error}${colors.reset}`);
			}
		}

		return iconInfo;
	} catch (error) {
		console.log(`${colors.red}❌ Failed to test icon${colors.reset}`);
		console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
		return { HasIcon: false, Error: error.message };
	}
}

/**
 * Display metadata results in a formatted table
 */
function displayResults(metadata, iconInfo) {
	console.log(`\n${colors.cyan}${colors.bright}📊 METADATA TEST RESULTS${colors.reset}`);
	console.log('='.repeat(60));

	const fields = [
		{ key: 'ProductName', label: 'Application Title', expected: 'Your app title' },
		{ key: 'FileDescription', label: 'Description', expected: 'Your app description' },
		{ key: 'ProductVersion', label: 'Product Version', expected: 'Semantic version (e.g., 1.0.0)' },
		{ key: 'CompanyName', label: 'Publisher/Company', expected: 'Your company name' },
		{ key: 'LegalCopyright', label: 'Copyright', expected: 'Copyright notice' },
		{ key: 'OriginalFilename', label: 'Original Filename', expected: 'yourapp.exe' }
	];

	fields.forEach((field) => {
		const value = metadata[field.key] || '(not set)';
		const hasValue = value && value !== '(not set)' && value.trim() !== '';
		const status = hasValue ? `${colors.green}✅` : `${colors.yellow}⚠️ `;

		console.log(`${status} ${colors.bright}${field.label}:${colors.reset}`);
		console.log(`   Value: ${colors.blue}${value}${colors.reset}`);
		if (!hasValue) {
			console.log(`   Expected: ${colors.yellow}${field.expected}${colors.reset}`);
		}
		console.log();
	});

	// Icon results
	console.log(
		`${iconInfo.HasIcon ? `${colors.green}✅` : `${colors.yellow}⚠️ `} ${colors.bright}Custom Icon:${colors.reset}`
	);
	if (iconInfo.HasIcon) {
		console.log(`   Status: ${colors.green}Embedded successfully${colors.reset}`);
		console.log(`   Size: ${colors.blue}${iconInfo.Size}${colors.reset}`);
	} else {
		console.log(`   Status: ${colors.yellow}No custom icon detected${colors.reset}`);
		console.log(`   Note: ${colors.yellow}Using default Windows executable icon${colors.reset}`);
	}
}

/**
 * Generate test summary and recommendations
 */
function generateSummary(metadata, iconInfo) {
	console.log(`\n${colors.cyan}${colors.bright}📋 TEST SUMMARY${colors.reset}`);
	console.log('='.repeat(40));

	const hasTitle = metadata.ProductName && metadata.ProductName.trim() !== '';
	const hasDescription = metadata.FileDescription && metadata.FileDescription.trim() !== '';
	const hasVersion = metadata.ProductVersion && metadata.ProductVersion.trim() !== '';
	const hasCompany = metadata.CompanyName && metadata.CompanyName.trim() !== '';
	const hasCopyright = metadata.LegalCopyright && metadata.LegalCopyright.trim() !== '';
	const hasIcon = iconInfo.HasIcon;

	const metadataScore = [hasTitle, hasDescription, hasVersion, hasCompany, hasCopyright].filter(
		Boolean
	).length;
	const totalTests = 6; // 5 metadata fields + 1 icon
	const passedTests = metadataScore + (hasIcon ? 1 : 0);

	console.log(`${colors.bright}Results: ${passedTests}/${totalTests} tests passed${colors.reset}`);
	console.log(`${colors.blue}Metadata fields: ${metadataScore}/5 configured${colors.reset}`);
	console.log(`${colors.blue}Custom icon: ${hasIcon ? 'Yes' : 'No'}${colors.reset}`);

	if (passedTests === totalTests) {
		console.log(
			`\n${colors.green}🎉 All tests passed! Your executable has complete metadata.${colors.reset}`
		);
	} else {
		console.log(`\n${colors.yellow}⚠️  Some metadata is missing. Consider adding:${colors.reset}`);

		if (!hasTitle) console.log(`${colors.yellow}   • windows.meta.title${colors.reset}`);
		if (!hasDescription)
			console.log(`${colors.yellow}   • windows.meta.description${colors.reset}`);
		if (!hasVersion) console.log(`${colors.yellow}   • windows.meta.version${colors.reset}`);
		if (!hasCompany) console.log(`${colors.yellow}   • windows.meta.publisher${colors.reset}`);
		if (!hasCopyright) console.log(`${colors.yellow}   • windows.meta.copyright${colors.reset}`);
		if (!hasIcon) console.log(`${colors.yellow}   • windows.iconPath${colors.reset}`);

		console.log(`\n${colors.blue}Example configuration:${colors.reset}`);
		console.log(`${colors.blue}adapter({
  windows: {
    meta: {
      title: 'My App',
      description: 'My awesome application',
      version: '1.0.0',
      publisher: 'My Company',
      copyright: '© 2025 My Company'
    },
    iconPath: './static/app-icon.ico'
  }
})${colors.reset}`);
	}
}

/**
 * Main test function
 */
async function runMetadataTest() {
	console.log(`${colors.cyan}${colors.bright}🧪 Windows Metadata Testing Tool${colors.reset}`);
	console.log(`${colors.blue}SvelteKit Exec Adapter - Metadata Verification${colors.reset}`);
	console.log('='.repeat(60));

	// Check command line arguments
	const exePath = process.argv[2];
	if (!exePath) {
		console.log(`${colors.red}❌ Missing executable path${colors.reset}`);
		console.log(`${colors.yellow}Usage: bun run test-metadata.js <path-to-exe>${colors.reset}`);
		console.log(
			`${colors.yellow}Example: bun run test-metadata.js ./dist/my-app.exe${colors.reset}`
		);
		process.exit(1);
	}

	try {
		// Step 1: Platform check
		checkWindowsPlatform();

		// Step 2: Validate executable
		const validatedPath = validateExecutable(exePath);

		// Step 3: Extract metadata
		const metadata = await extractMetadata(validatedPath);

		// Step 4: Test icon
		const iconInfo = await testIcon(validatedPath);

		// Step 5: Display results
		displayResults(metadata, iconInfo);

		// Step 6: Generate summary
		generateSummary(metadata, iconInfo);

		console.log(`\n${colors.green}✅ Metadata testing completed successfully!${colors.reset}`);
	} catch (error) {
		console.log(`\n${colors.red}❌ Test failed with error:${colors.reset}`);
		console.log(`${colors.red}${error.message}${colors.reset}`);
		console.log(`${colors.red}${error.stack}${colors.reset}`);
		process.exit(1);
	}
}

// Run the test
await runMetadataTest();
