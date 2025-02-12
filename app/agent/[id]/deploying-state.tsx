'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { agentService } from '@/lib/services/api/agents';
import { motion } from 'framer-motion';

interface DeployingStateProps {
  agent: {
    name: string;
    id: string;
    avatar?: string;
    contractAddress?: string;
  };
}

const DEPLOYMENT_STEPS = [
  { id: 0, label: 'Initialize deployment', emoji: '⚡️', description: 'Starting deployment process...' },
  { id: 1, label: 'Verify payment TX', emoji: '💸', description: 'Checking your payment...' },
  { id: 2, label: 'Create agent wallet', emoji: '🏦', description: 'Setting up agent wallet...' },
  { id: 3, label: 'Fund agent wallet', emoji: '💰', description: 'Loading up some ETH...' },
  { id: 4, label: 'Deploy agent token', emoji: '🪙', description: 'Creating your token...' },
  { id: 5, label: 'Deploy agent service', emoji: '🚀', description: 'Final deployment steps...' },
];

export function DeployingState({ agent }: DeployingStateProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(20);
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((20 - countdown) / 20) * 100;

  // Function to check contract status
  const checkContractStatus = async () => {
    try {
      console.log(`[${new Date().toLocaleTimeString()}] Checking contract status for agent #${agent.id}...`);
      
      // Fetch latest agent data
      const result = await agentService.getById(agent.id);
      
      if (result.success && result.data) {
        const hasContract = Boolean(result.data.contractAddress && result.data.contractAddress !== '0x0');
        
        console.log('Contract status check result:', {
          contractAddress: result.data.contractAddress || 'Not deployed',
          timeSinceStart: Math.floor((20 - countdown) / 20) * 20 + ' seconds',
          currentStep,
          hasContract
        });

        // If contract is deployed, force a hard navigation to the agent page
        if (hasContract) {
          console.log('🎉 Contract deployed! Redirecting to agent page...');
          // Clear intervals before navigation
          clearAllIntervals();
          // Force a hard navigation
          window.location.href = `/agent/${agent.id}`;
          return;
        }
      } else {
        console.log('Failed to fetch agent status:', result.error);
      }
      
      // Reset countdown
      setCountdown(20);
      // Move to next step (loop back to 1 if at end)
      setCurrentStep(prev => prev >= 5 ? 1 : prev + 1);
    } catch (error) {
      console.error('Error checking contract status:', error);
    }
  };

  // Helper to clear all intervals
  const clearAllIntervals = () => {
    const interval_id = window.setInterval(function(){}, Number.MAX_SAFE_INTEGER);
    for (let i = 1; i < interval_id; i++) {
      window.clearInterval(i);
    }
  };

  useEffect(() => {
    // Immediate first check
    checkContractStatus();

    // Check every 20 seconds
    const refreshInterval = setInterval(checkContractStatus, 20000);

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev === 0 ? 20 : prev - 1);
    }, 1000);

    // Initial log
    console.log(`[${new Date().toLocaleTimeString()}] Started monitoring deployment:`, {
      agentId: agent.id,
      agentName: agent.name,
      initialContractAddress: agent.contractAddress || 'Not deployed',
      checkInterval: '20 seconds'
    });

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
      console.log(`[${new Date().toLocaleTimeString()}] Stopped monitoring deployment for agent #${agent.id}`);
    };
  }, [router, agent.id, agent.name]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container max-w-lg mx-auto px-4 text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-white/5">
            {agent.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.avatar} alt={agent.name} className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10" />
            )}
          </div>
          <h1 className="text-2xl font-bold">{agent.name}</h1>
          <div className="text-sm text-muted-foreground font-mono">#{agent.id}</div>
        </div>
        
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <h2 className="text-xl font-semibold">Smart Contract Deployment in Progress</h2>
          <p className="text-muted-foreground">
            The agent&apos;s smart contract is currently being deployed on the Starknet network.
            This process typically takes 1-2 minutes to complete.
          </p>
          <div className="space-y-4">
            {/* Steps list */}
            <div className="flex flex-col gap-2 text-sm">
              {DEPLOYMENT_STEPS.map((step) => (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0.5, x: -10 }}
                  animate={{ 
                    opacity: step.id <= currentStep ? 1 : 0.5,
                    x: 0,
                    scale: step.id === currentStep ? 1.05 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    step.id === currentStep 
                      ? 'text-yellow-500 font-medium'
                      : step.id < currentStep
                        ? 'text-yellow-500/50 line-through'
                        : 'text-muted-foreground'
                  }`}
                >
                  <motion.div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg border ${
                      step.id === currentStep 
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : step.id < currentStep
                          ? 'border-yellow-500/50 bg-yellow-500/10'
                          : 'border-white/20 bg-white/5'
                    }`}
                    animate={step.id === currentStep ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {step.emoji}
                  </motion.div>
                  <div className="flex-1 text-left">
                    <div>{step.label}</div>
                    {step.id === currentStep && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-yellow-500/70"
                      >
                        {step.description}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-4 bg-yellow-950/20 rounded-lg overflow-hidden border border-yellow-500/20">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500"
                style={{ width: `${progress}%` }}
                animate={{
                  boxShadow: ['0 0 20px rgba(234, 179, 8, 0.3)', '0 0 30px rgba(234, 179, 8, 0.5)', '0 0 20px rgba(234, 179, 8, 0.3)']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.2)_100%)]" />
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <motion.p 
                className="font-medium text-yellow-500/90"
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {DEPLOYMENT_STEPS[currentStep].emoji} {DEPLOYMENT_STEPS[currentStep].description}
              </motion.p>
              <p className="text-xs opacity-75">
                Next check in {countdown}s
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 