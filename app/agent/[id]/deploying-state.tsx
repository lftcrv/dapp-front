'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getCompleteAgentData } from '@/actions/agents/token/getTokenInfo';

interface DeployingStateProps {
  agent: {
    name: string;
    id: string;
    avatar?: string;
    contractAddress?: string;
  };
}

type DeploymentState =
  | 'initializing'
  | 'checking'
  | 'waiting'
  | 'deployed'
  | 'error';

const DEPLOYMENT_STEPS = [
  {
    id: 0,
    label: 'Initialize deployment',
    emoji: '⚡️',
    description: 'Starting deployment process...',
  },
  {
    id: 1,
    label: 'Verify payment TX',
    emoji: '💸',
    description: 'Checking your payment...',
  },
  {
    id: 2,
    label: 'Create agent wallet',
    emoji: '🏦',
    description: 'Setting up agent wallet...',
  },
  {
    id: 3,
    label: 'Fund agent wallet',
    emoji: '💰',
    description: 'Loading up some ETH...',
  },
  {
    id: 4,
    label: 'Deploy agent token',
    emoji: '🪙',
    description: 'Creating your token...',
  },
  {
    id: 5,
    label: 'Deploy agent service',
    emoji: '🚀',
    description: 'Final deployment steps...',
  },
];

export function DeployingState({ agent }: DeployingStateProps) {
  const [deploymentState, setDeploymentState] = useState<DeploymentState>('initializing');
  const [countdown, setCountdown] = useState(20);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef(false);

  const progress = ((20 - countdown) / 20) * 100;

  // Separate initialization effect
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log(`[${new Date().toLocaleTimeString()}] Started monitoring deployment:`, {
      agentId: agent.id,
      agentName: agent.name,
      initialContractAddress: agent.contractAddress || 'Not deployed',
      checkInterval: '20 seconds',
    });
  }, [agent.id, agent.name, agent.contractAddress]);

  useEffect(() => {
    let isMounted = true;
    let checkInterval: NodeJS.Timeout | null = null;
    let countdownInterval: NodeJS.Timeout | null = null;

    const clearIntervals = () => {
      if (checkInterval) clearInterval(checkInterval);
      if (countdownInterval) clearInterval(countdownInterval);
      checkInterval = null;
      countdownInterval = null;
    };

    const checkContractStatus = async () => {
      if (!isMounted) return;

      try {
        setDeploymentState('checking');
        console.log(`[${new Date().toLocaleTimeString()}] Checking status for agent #${agent.id}...`);
        
        const result = await getCompleteAgentData(agent.id);

        if (!isMounted) return;

        if (result.success && result.data) {
          const isDeployed = Boolean(
            result.data.contractAddress &&
            result.data.contractAddress !== '0x0' &&
            result.data.contractAddress.length > 42
          );

          console.log('Contract status check result:', {
            contractAddress: result.data.contractAddress || 'Not deployed',
            status: result.data.status,
            timeSinceStart: Math.floor((20 - countdown) / 20) * 20 + ' seconds',
            currentStep,
            isDeployed,
          });

          if (isDeployed) {
            setDeploymentState('deployed');
            clearIntervals();
            window.location.href = `/agent/${agent.id}?t=${Date.now()}`;
            return;
          }

          setDeploymentState('waiting');
          setCurrentStep(prev => (prev >= 5 ? 1 : prev + 1));
          setCountdown(20);
        } else {
          throw new Error(result.error || 'Failed to check contract status');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error checking contract status:', error);
          setError(error instanceof Error ? error.message : 'Unknown error occurred');
          setDeploymentState('error');
          clearIntervals();
        }
      }
    };

    // Set up intervals
    checkInterval = setInterval(checkContractStatus, 20000);
    countdownInterval = setInterval(() => {
      if (isMounted) {
        setCountdown(prev => {
          if (prev <= 1) {
            checkContractStatus();
            return 20;
          }
          return prev - 1;
        });
      }
    }, 1000);

    // Initial check
    checkContractStatus();

    return () => {
      console.log(`[${new Date().toLocaleTimeString()}] Stopped monitoring deployment for agent #${agent.id}`);
      isMounted = false;
      clearIntervals();
    };
  }, [agent.id]); // Only depend on agent.id

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container max-w-lg mx-auto px-4 text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-white/5">
            {agent.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agent.avatar}
                alt={agent.name}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10" />
            )}
          </div>
          <h1 className="text-2xl font-bold">{agent.name}</h1>
          <div className="text-sm text-muted-foreground font-mono">
            #{agent.id}
          </div>
        </div>

        <div className="space-y-4">
          {deploymentState === 'error' ? (
            <div className="space-y-4">
              <div className="text-red-500">❌ Deployment Error</div>
              <p className="text-muted-foreground">
                {error || 'Failed to deploy agent'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
              <h2 className="text-xl font-semibold">
                Smart Contract Deployment in Progress
              </h2>
              <p className="text-muted-foreground">
                The agent&apos;s smart contract is currently being deployed on
                the Starknet network. This process typically takes 1-2 minutes
                to complete.
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
                        scale: step.id === currentStep ? 1.05 : 1,
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
                        animate={
                          step.id === currentStep
                            ? {
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: 'reverse',
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
                      boxShadow: [
                        '0 0 20px rgba(234, 179, 8, 0.3)',
                        '0 0 30px rgba(234, 179, 8, 0.5)',
                        '0 0 20px rgba(234, 179, 8, 0.3)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
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
                    {DEPLOYMENT_STEPS[currentStep].emoji}{' '}
                    {DEPLOYMENT_STEPS[currentStep].description}
                  </motion.p>
                  <p className="text-xs opacity-75">
                    Next check in {countdown}s
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
