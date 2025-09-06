---
applyTo: "**"
---

# SvelteKit Exec Adapter Documentation Site Guidelines

## Project Context

The **SvelteKit Exec Adapter** is an experimental adapter that builds full-stack SvelteKit applications as single executable binaries with zero runtime dependencies. Unlike traditional static builds that strip away server capabilities, this adapter preserves all server-side features including SSR, API endpoints, and server middleware.

This documentation site serves as the primary resource for developers who want to:

- Build standalone software without losing SvelteKit functionality
- Create portable applications that run without Docker/Node.js installation
- Develop privacy-focused apps with local data ownership
- Package commercial software for self-hosting

## Core Technical Guidelines

### 1. Svelte 5 Runes Architecture

- **ALWAYS** use Svelte 5 runes syntax for state management
- Use `$state()` for reactive variables instead of `let` declarations
- Use `$derived()` for computed values instead of reactive statements
- Use `$effect()` for side effects instead of `onMount` and reactive statements
- Prefer `$props()` for component props with proper TypeScript typing

```svelte
<script lang="ts">
  // ✅ Correct - Svelte 5 runes
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log(`Count is now ${count}`);
  });

  // ❌ Avoid - Svelte 4 syntax
  let count = 0;
  $: doubled = count * 2;
  onMount(() => { ... });
</script>
```

### 2. Static Adapter Configuration

- **MANDATORY**: Use `@sveltejs/adapter-static` for 100% client-side rendering
- **NO SERVER CODE**: All functionality must run in the browser
- Configure prerendering for all routes in `svelte.config.js`
- Handle dynamic content through client-side data fetching only

```javascript
// svelte.config.js
import adapter from "@sveltejs/adapter-static";

const config = {
  kit: {
    adapter: adapter(),
    prerender: {
      entries: ["*"],
    },
  },
};
```

### 3. shadcn-svelte Component Library

#### Component Paths

- **UI Components**: `$lib/components/ui/[component-name]/index.js`
- **Custom Components**: `$lib/components/[ComponentName].svelte`
- **Utils**: `$lib/utils.ts`
- **Hooks**: `$lib/hooks/`

#### Standard Import Pattern

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Alert, AlertDescription } from '$lib/components/ui/alert/index.js';
</script>
```

#### Card Component Usage

**IMPORTANT**: shadcn-svelte uses namespace imports for Card components:

```svelte
<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
</script>

<Card.Root class="w-full max-w-sm">
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card description text</Card.Description>
    <Card.Action>
      <Button variant="link">Action Button</Button>
    </Card.Action>
  </Card.Header>
  <Card.Content>
    <!-- Card content here -->
  </Card.Content>
  <Card.Footer class="flex-col gap-2">
    <Button type="submit" class="w-full">Primary Action</Button>
    <Button variant="outline" class="w-full">Secondary Action</Button>
  </Card.Footer>
</Card.Root>
```

#### Available UI Components

Always use these pre-configured shadcn-svelte components:

- `alert-dialog`, `badge`, `breadcrumb`, `button`, `card`, `carousel`
- `dialog`, `drawer`, `dropdown-menu`, `input`, `label`, `menubar`
- `popover`, `progress`, `select`, `separator`, and more

### 4. Color System & Design Tokens

#### Predefined Color Variables

**ALWAYS** use CSS custom properties from the design system:

- `hsl(var(--background))` - Main background
- `hsl(var(--foreground))` - Main text
- `hsl(var(--primary))` - Primary brand color
- `hsl(var(--primary-foreground))` - Primary text
- `hsl(var(--secondary))` - Secondary elements
- `hsl(var(--muted))` - Muted backgrounds
- `hsl(var(--muted-foreground))` - Muted text
- `hsl(var(--border))` - Border colors
- `hsl(var(--destructive))` - Error states

#### Color Usage Rules

```css
/* ✅ Correct - Use design tokens */
.my-component {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
}

/* ❌ Avoid - Hardcoded colors */
.my-component {
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #e5e7eb;
}
```

#### TailwindCSS Classes

Prefer Tailwind utility classes that map to design tokens:

- `bg-background`, `text-foreground`, `border-border`
- `bg-primary`, `text-primary-foreground`
- `bg-muted`, `text-muted-foreground`

### 5. Icon System

#### Lucide Svelte Icons

- **Pre-installed**: `@lucide/svelte` is available in the project
- **Import Pattern**: Import specific icons, not the entire library
- **Consistent Sizing**: Use consistent size props (16, 20, 24px)
- **Accessibility**: Always include appropriate `aria-label` or `aria-hidden`

```svelte
<script lang="ts">
  import { Download, Github, ExternalLink, ChevronRight } from '@lucide/svelte';
</script>

<Button>
  <Download size={16} aria-hidden="true" />
  Download Binary
</Button>

<Badge variant="secondary">
  <Github size={14} aria-hidden="true" />
  Open Source
</Badge>
```

#### Common Icon Patterns

- Navigation: `ChevronRight`, `ArrowLeft`, `Menu`, `X`
- Actions: `Download`, `Upload`, `Copy`, `Check`, `Plus`
- External: `ExternalLink`, `Github`, `Globe`
- Status: `AlertCircle`, `CheckCircle`, `Info`, `XCircle`

### 6. TypeScript Standards

#### Component Props

```typescript
interface ComponentProps {
  title: string;
  description?: string;
  variant?: "default" | "secondary" | "destructive";
  isLoading?: boolean;
}

// In component
let {
  title,
  description,
  variant = "default",
  isLoading = false,
}: ComponentProps = $props();
```

#### Type Definitions

- Create interfaces for all component props
- Use union types for variant options
- Prefer optional properties with defaults
- Export types from `$lib/types/` when shared

### 7. Content & Documentation Guidelines

#### Project Messaging

- Emphasize "executable binary with zero dependencies"
- Highlight preservation of full SvelteKit features
- Target use cases: open-source tools, commercial software, privacy-focused apps
- Contrast with traditional approaches (Docker, SPA builds)

#### Code Examples

- Always show before/after comparisons
- Include complete, runnable examples
- Demonstrate real-world use cases
- Provide TypeScript annotations

#### Performance Considerations

- Optimize for static generation
- Minimize bundle size
- Use code splitting for large features
- Implement proper loading states

### 8. File Organization

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # shadcn-svelte components
│   │   ├── Navigation.svelte
│   │   └── Footer.svelte
│   ├── utils.ts
│   ├── types/
│   └── hooks/
├── routes/
│   ├── +layout.svelte
│   ├── +layout.ts
│   └── +page.svelte
└── app.css               # Global styles with design tokens
```

### 9. Quality Standards

#### Accessibility

- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance

#### Performance

- Lazy load non-critical components
- Optimize images and assets
- Minimize JavaScript bundle size
- Use efficient data structures

#### Maintainability

- Consistent component patterns
- Clear naming conventions
- Comprehensive TypeScript types
- Documented component interfaces

## Example Implementation

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Download, Github } from '@lucide/svelte';

  interface FeatureCardProps {
    title: string;
    description: string;
    icon?: typeof Download;
    variant?: 'default' | 'highlighted';
  }

  let { title, description, icon: Icon, variant = 'default' }: FeatureCardProps = $props();

  let isHovered = $state(false);
</script>

<Card.Root
  class={variant === 'highlighted' ? 'border-primary bg-primary/5' : 'bg-card'}
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
>
  <Card.Header>
    <Card.Title class="flex items-center gap-2 text-foreground">
      {#if Icon}
        <Icon size={20} aria-hidden="true" class="text-primary" />
      {/if}
      {title}
    </Card.Title>
  </Card.Header>
  <Card.Content>
    <p class="text-muted-foreground">{description}</p>
  </Card.Content>
</Card.Root>
```

- do not use emogies in the code base

Follow these guidelines consistently to maintain a cohesive, performant, and accessible documentation site that properly showcases the SvelteKit Exec Adapter's capabilities.
