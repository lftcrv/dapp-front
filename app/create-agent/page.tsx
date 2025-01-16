'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useWallets } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Brain, Twitter, Flame, Rocket } from 'lucide-react'

export default function CreateAgentPage() {
  const router = useRouter()
  const { wallets } = useWallets()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agentType, setAgentType] = useState<'leftcurve' | 'rightcurve'>('leftcurve')
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    lore: '',
    strategy: '',
    knowledge: '',
    twitter: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!wallets.length) {
      toast.error('🦊 Wallet Required', {
        description: 'Anon, you need to connect your wallet first!'
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Implement actual creation logic
      toast('🚀 Coming Soon', {
        description: 'Agent deployment will be available soon! Stay tuned anon...'
      })
      
      // Mock success for now
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Error creating agent:', error)
      toast.error('💀 Deploy Failed', {
        description: 'Something went wrong! Try again anon...'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div
          className="space-y-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-sketch text-4xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
              Deploy Your Agent
            </h1>
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">choose wisely anon, there&apos;s no going back 🔥</p>
              <div className="flex items-center gap-4">
                <Button
                  variant={agentType === 'leftcurve' ? 'default' : 'outline'}
                  onClick={() => setAgentType('leftcurve')}
                  className={agentType === 'leftcurve' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                >
                  <span className="mr-2">🦧</span> LeftCurve
                </Button>
                <Button
                  variant={agentType === 'rightcurve' ? 'default' : 'outline'}
                  onClick={() => setAgentType('rightcurve')}
                  className={agentType === 'rightcurve' ? 'bg-purple-500 hover:bg-purple-600' : ''}
                >
                  <span className="mr-2">🐙</span> RightCurve
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  {agentType === 'leftcurve' 
                    ? 'Creative chaos, meme magic, and pure degen energy'
                    : 'Technical mastery, market wisdom, and calculated alpha'}
                </p>
                <p className="text-[13px] text-muted-foreground italic">
                  {agentType === 'leftcurve'
                    ? 'For those who believe fundamentals are just vibes'
                    : 'For those who see patterns in the matrix'}
                </p>
              </div>
              <p className="text-[12px] text-yellow-500/70">Midcurvers ngmi 😭</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="personality" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="personality">
                  <Brain className="mr-2 h-4 w-4" />
                  Personality
                </TabsTrigger>
                <TabsTrigger value="strategy">
                  <Rocket className="mr-2 h-4 w-4" />
                  Strategy
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personality" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    placeholder={agentType === 'leftcurve' ? 'e.g., APE-3000' : 'e.g., OctoAlpha'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    placeholder="https://example.com/avatar.png"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lore">Lore / Personality</Label>
                  <textarea
                    id="lore"
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={agentType === 'leftcurve' 
                      ? 'A galaxy-brain ape who discovered trading while eating crayons...'
                      : 'A sophisticated octopus who mastered technical analysis...'}
                    value={formData.lore}
                    onChange={(e) => setFormData({ ...formData, lore: e.target.value })}
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="strategy">Trading Strategy</Label>
                  <textarea
                    id="strategy"
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={agentType === 'leftcurve'
                      ? 'Buy high sell higher, inverse Cramer, follow the memes...'
                      : 'Advanced ML models, multi-timeframe analysis, order flow...'}
                    value={formData.strategy}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="knowledge">Knowledge Base</Label>
                  <textarea
                    id="knowledge"
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={agentType === 'leftcurve'
                      ? 'Memes, Reddit sentiment, Discord alpha...'
                      : 'Market data, trading journals, research papers...'}
                    value={formData.knowledge}
                    onChange={(e) => setFormData({ ...formData, knowledge: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter Handle</Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="twitter"
                      placeholder="@username"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              type="submit"
              size="lg"
              className={`w-full font-bold hover:opacity-90 ${
                agentType === 'leftcurve'
                  ? 'bg-gradient-to-r from-yellow-500 to-pink-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
              disabled={isSubmitting || !wallets.length}
            >
              <Flame className="mr-2 h-5 w-5" />
              {isSubmitting ? (
                <>DEPLOYING...</>
              ) : !wallets.length ? (
                <>CONNECT WALLET</>
              ) : (
                <>DEPLOY {agentType === 'leftcurve' ? '🦧' : '🐙'} AGENT</>
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            * Deployment requires $LEFT tokens for gas fees 🚀
          </p>
        </motion.div>
      </div>
    </main>
  )
} 