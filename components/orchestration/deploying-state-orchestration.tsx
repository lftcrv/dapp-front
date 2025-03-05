'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCreationStatus } from '@/actions/agents/create/getCreationStatus';
import { findAgentByTransaction } from '@/actions/agents/create/findAgentByTransaction';

interface DeployingStateWithOrchestrationProps {
  orchestrationId: string;
  transactionHash: string;
  creatorWallet: string;
  error: string | null;
  onError: (message: string) => void;
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
    stepId: null,
  },
  {
    id: 1,
    label: 'Create database record',
    emoji: '📝',
    description: 'Creating your agent record...',
    stepId: 'create-db-record',
  },
  {
    id: 2,
    label: 'Create agent wallet',
    emoji: '🏦',
    description: 'Setting up agent wallet...',
    stepId: 'create-wallet',
  },
  {
    id: 3,
    label: 'Fund agent wallet',
    emoji: '💰',
    description: 'Loading up some ETH...',
    stepId: 'fund-wallet',
  },
  {
    id: 4,
    label: 'Deploy agent wallet',
    emoji: '🚀',
    description: 'Deploying wallet contract...',
    stepId: 'deploy-wallet',
  },
  {
    id: 5,
    label: 'Deploy agent token',
    emoji: '🪙',
    description: 'Creating your token...',
    stepId: 'deploy-agent-token',
  },
  {
    id: 6,
    label: 'Create container',
    emoji: '📦',
    description: 'Preparing agent container...',
    stepId: 'create-container',
  },
  {
    id: 7,
    label: 'Start container',
    emoji: '🚀',
    description: 'Starting up your agent...',
    stepId: 'start-container',
  },
];

export function DeployingStateWithOrchestration({
  orchestrationId,
  transactionHash,
  creatorWallet,
  error: initialError,
  onError,
}: DeployingStateWithOrchestrationProps) {
  const router = useRouter();
  const [deploymentState, setDeploymentState] =
    useState<DeploymentState>('initializing');
  const [countdown, setCountdown] = useState(5);
  const [currentStep, setCurrentStep] = useState(0);
  const [orchestrationData, setOrchestrationData] = useState<{
    creatorWallet?: string;
    transactionHash?: string;
  }>({});
  const [agentInfo, setAgentInfo] = useState<{ id?: string; name?: string }>(
    {},
  );
  const [progress, setProgress] = useState(0);
  const isInitializedRef = useRef(false);

  // Initialization effect
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log(
      `[${new Date().toLocaleTimeString()}] Started monitoring orchestration:`,
      {
        orchestrationId,
        checkInterval: '5 seconds',
      },
    );
  }, [orchestrationId]);

  // Status checking effect
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

    const lookupAgentByTransaction = async () => {
      if (!transactionHash) {
        console.error('Missing transaction hash - cannot look up agent');
        router.push('/');
        return;
      }

      try {
        console.log('Looking up agent by transaction:', transactionHash);
        const result = await findAgentByTransaction(
          transactionHash,
          creatorWallet,
        );

        if (result.success && result.agentId) {
          console.log('🎉 Found agent by transaction lookup:', result.agentId);
          router.push(`/agent/${result.agentId}?t=${Date.now()}`);
          return true;
        } else {
          console.log('No agent found by transaction lookup');
          router.push('/');
          return false;
        }
      } catch (error) {
        console.error('Error during agent lookup:', error);
        router.push('/');
        return false;
      }
    };

    const checkOrchestrationStatus = async () => {
      if (!isMounted) return;

      try {
        setDeploymentState('checking');

        const result = await getCreationStatus(orchestrationId);

        if (!isMounted) return;

        if (result.success && result.data) {
          setProgress(result.data.progress || 0);

          const currentStepId = result.data.currentStepId;
          const stepIndex = DEPLOYMENT_STEPS.findIndex(
            (step) => step.stepId === currentStepId,
          );

          if (stepIndex >= 0) {
            setCurrentStep(stepIndex);
          }

          // Check if we have agent info in the result
          if (result.data.result?.id && !agentInfo.id) {
            setAgentInfo({
              id: result.data.result.id,
              name: result.data.result.name || 'Your Agent',
            });
          }

          // Check the orchestration status
          if (result.data.orchestrationStatus === 'COMPLETED') {
            setDeploymentState('deployed');
            clearIntervals();
            console.log('Orchestration completed, checking for agent ID...');
            await lookupAgentByTransaction();
          } else if (result.data.orchestrationStatus === 'FAILED') {
            onError(result.data.error || 'Deployment failed');
            setDeploymentState('error');
            clearIntervals();
          } else {
            setDeploymentState('waiting');
            setCountdown(5);
          }
        } else {
          throw new Error(
            result.error || 'Failed to check orchestration status',
          );
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error checking orchestration status:', error);
          onError(
            error instanceof Error ? error.message : 'Unknown error occurred',
          );
          setDeploymentState('error');
          clearIntervals();
        }
      }
    };

    checkInterval = setInterval(checkOrchestrationStatus, 5000);
    countdownInterval = setInterval(() => {
      if (isMounted) {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 5;
          }
          return prev - 1;
        });
      }
    }, 1000);

    checkOrchestrationStatus();

    return () => {
      console.log(
        `[${new Date().toLocaleTimeString()}] Stopped monitoring orchestration #${orchestrationId}`,
      );
      isMounted = false;
      clearIntervals();
    };
  }, [orchestrationId, onError, agentInfo.id, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container max-w-lg mx-auto px-4 text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          {agentInfo.id && (
            <>
              <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-white/5">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10" />
              </div>
              <h1 className="text-2xl font-bold">{agentInfo.name}</h1>
              <div className="text-sm text-muted-foreground font-mono">
                #{agentInfo.id}
              </div>
            </>
          )}
          {!agentInfo.id && (
            <div className="text-xl font-bold">Creating Your Agent</div>
          )}
        </div>

        <div className="space-y-4">
          {deploymentState === 'error' ? (
            <div className="space-y-4">
              <div className="text-red-500">❌ Deployment Error</div>
              <p className="text-muted-foreground">
                {initialError || 'Failed to deploy agent'}
              </p>
              <button
                onClick={() => router.push('/create-agent')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
              <div className="space-y-4">
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
                    {DEPLOYMENT_STEPS[currentStep]?.emoji || '⚡️'}{' '}
                    {DEPLOYMENT_STEPS[currentStep]?.description ||
                      'Processing...'}
                  </motion.p>
                  <p className="text-xs opacity-75">
                    {progress.toFixed(0)}% complete • Next check in {countdown}s
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
