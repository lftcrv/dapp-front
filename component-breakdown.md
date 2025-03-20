# Component Breakdown for "How It Works" Page

## 1. Hero Section (`HeroSection.tsx`)

**Description:** Black and cream split background with "Build. Grind. Compete." tagline and mobile app preview.

**Key Elements:**
- Split background (black left side, cream right side)
- Chalk-like heading typography "Build. Grind. Compete."
- Phone mockup showing the app interface
- Heading with 3 distinct lines that appear in sequence

**Props Interface:**
```tsx
interface HeroSectionProps {
  animationDelay?: number;
}
```

## 2. Feature Showcase (`FeatureShowcase.tsx`)

**Description:** Visual flow diagram showing the platform's key features with custom illustrations of purple characters.

**Key Elements:**
- Center visual showing "Create your own trading agent(s)"
- Connected points showing agent capabilities
- Colorful character illustrations for each point
- Arrows connecting the different elements
- Final composite illustration at the bottom

**Props Interface:**
```tsx
interface FeatureItem {
  id: string;
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  position: 'left' | 'right' | 'top' | 'bottom';
}

interface FeatureShowcaseProps {
  features: FeatureItem[];
}
```

## 3. Agent Building Process (`BuildAgentsSection.tsx`)

**Description:** Four-step process showing how to create and profit from agents.

**Key Elements:**
- Section heading "Build agents that trade for you 💸"
- 4 process cards with gradient icons
- Connecting dots/lines between steps
- Tagline "Set it. Forget it. Stack it. 🔥"

**Props Interface:**
```tsx
interface ProcessStep {
  id: number;
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  gradientColors: {
    from: string;
    to: string;
  };
}

interface BuildAgentsSectionProps {
  steps: ProcessStep[];
}
```

## 4. Competition Section (`CompetitionSection.tsx`)

**Description:** Leaderboard examples showing how agents compete.

**Key Elements:**
- Section heading "Outsmart the competition 🏆"
- Tagline about creative and top-performing agents
- Visual examples of different leaderboards
- Character illustrations next to leaderboards
- Footer text with playful emoji

**Props Interface:**
```tsx
interface LeaderboardExample {
  id: string;
  imageSrc: string;
  imageAlt: string;
  title?: string;
}

interface CompetitionSectionProps {
  leaderboards: LeaderboardExample[];
  tagline: string;
}
```

## 5. Technical Details (`TechnicalDetailsSection.tsx`)

**Description:** Expandable sections explaining the underlying technology.

**Key Elements:**
- Section heading "Under the Hood"
- 5 technical categories with icons:
  - Blockchain Integration
  - Cryptoeconomics
  - Advanced Trading Intelligence
  - Fee Structure
  - Security
- Bullet points with technical details for each category

**Props Interface:**
```tsx
interface TechDetail {
  id: string;
  title: string;
  icon: React.ReactNode;
  points: string[];
}

interface TechnicalDetailsSectionProps {
  details: TechDetail[];
}
```

## Shared Components

### 1. Gradient Icon (`GradientIcon.tsx`)

```tsx
interface GradientIconProps {
  icon: React.ReactNode | string;
  gradientFrom: string;
  gradientTo: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

### 2. Animated Heading (`AnimatedHeading.tsx`)

```tsx
interface AnimatedHeadingProps {
  text: string | string[];
  as?: 'h1' | 'h2' | 'h3';
  animation?: 'fade' | 'typewriter' | 'slide' | 'bounce';
  className?: string;
  delay?: number;
}
```

### 3. Process Card (`ProcessCard.tsx`)

```tsx
interface ProcessCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  className?: string;
  index: number;
  isLast: boolean;
}
```

### 4. Character Illustration (`CharacterIllustration.tsx`)

```tsx
interface CharacterIllustrationProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'bounce' | 'wiggle' | 'pulse' | 'float';
  className?: string;
}
```

## Animation Variants

### Fade In (for sections)
```tsx
export const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};
```

### Stagger Children (for lists of items)
```tsx
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};
```

### Pulse (for icons)
```tsx
export const pulseVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};
``` 