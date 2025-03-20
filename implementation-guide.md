# "How It Works" Page Implementation Guide

This guide outlines the steps to implement the "How It Works" page based on the Figma design.

## Page Structure

```tsx
// app/how-it-works/page.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-purple-50">
      {/* 1. Hero Section */}
      <HeroSection />
      
      {/* 2. Feature Showcase */}
      <FeatureShowcase />
      
      {/* 3. Agent Building Process */}
      <BuildAgentsSection />
      
      {/* 4. Competition Section */}
      <CompetitionSection />
      
      {/* 5. Technical Details */}
      <TechnicalDetailsSection />
    </main>
  );
}
```

## Implementation Steps

### 1. Create Required Components

Each section should be implemented as a separate component:

- `HeroSection`: "Build. Grind. Compete." headline with black background
- `FeatureShowcase`: Mobile app preview and purple character illustrations
- `BuildAgentsSection`: 4-step process with icon cards
- `CompetitionSection`: Leaderboard examples and characters
- `TechnicalDetailsSection`: Technical explanations with icons

### 2. Configure Animations

Use Framer Motion for animations:

```tsx
// Example for section animation
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    }
  }
};

// In your component:
<motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={sectionVariants}
  className="..."
>
  {/* Content */}
</motion.section>
```

### 3. Responsive Design Considerations

Use Tailwind's responsive classes to ensure the layout works on all devices:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Process steps */}
</div>
```

### 4. Image Optimization

Ensure all images are optimized and use Next.js Image component:

```tsx
<Image
  src="/path/to/character-image.png"
  alt="Character illustration"
  width={300}
  height={400}
  className="w-full h-auto md:w-3/4 lg:w-1/2 mx-auto"
/>
```

## CSS Example for Section Styling

```css
/* For gradient backgrounds */
.gradient-bg {
  background: linear-gradient(to right, #FF6B00, #9333EA);
}

/* For card styling */
.process-card {
  @apply bg-white rounded-xl p-6 shadow-lg;
  transition: transform 0.3s ease;
}

.process-card:hover {
  transform: translateY(-5px);
}
```

## Example for the "Build Agents" Section

```tsx
function BuildAgentsSection() {
  const steps = [
    {
      id: 1,
      title: "Define",
      description: "Set your strategy in seconds",
      icon: "/icons/define-icon.svg",
      color: "bg-gradient-to-br from-orange-500 to-red-600"
    },
    {
      id: 2,
      title: "Fund",
      description: "Fuel it with capital",
      icon: "/icons/fund-icon.svg",
      color: "bg-gradient-to-br from-yellow-500 to-orange-600"
    },
    {
      id: 3,
      title: "Deploy",
      description: "Sit back while it grinds",
      icon: "/icons/deploy-icon.svg",
      color: "bg-gradient-to-br from-blue-500 to-purple-600"
    },
    {
      id: 4,
      title: "Cash In",
      description: "You collect the Gains. On repeat.",
      icon: "/icons/cash-icon.svg",
      color: "bg-gradient-to-br from-purple-500 to-pink-600"
    }
  ];

  return (
    <section className="py-24 px-4 md:px-8 bg-neutral-50">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Build agents that trade for you 💸
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 left-full w-full h-0.5 bg-gray-300 z-0">
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                    <span className="text-xl font-bold">•</span>
                  </div>
                </div>
              )}
              
              {/* Card */}
              <div className="bg-white rounded-xl p-6 shadow-md relative z-10">
                <div className={`${step.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                  <Image
                    src={step.icon}
                    alt={step.title}
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 font-medium">
          Set it. Forget it. Stack it. 🔥
        </div>
      </div>
    </section>
  );
}
```

## Next Steps

1. Create the base page file at `app/how-it-works/page.tsx`
2. Implement each section component in `components/how-it-works/`
3. Add the route to your navigation menu
4. Test on different device sizes
5. Optimize animations for performance 