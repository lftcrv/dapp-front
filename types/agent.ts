export interface CharacterConfig {
  name: string
  clients: any[]
  modelProvider: string
  settings: {
    secrets: Record<string, any>
    voice: {
      model: string
    }
  }
  plugins: any[]
  bio: string[]
  lore: string[]
  knowledge: string[]
  messageExamples: Array<[
    { user: string; content: { text: string } },
    { user: string; content: { text: string } }
  ]>
  postExamples: string[]
  topics: string[]
  style: {
    all: string[]
    chat: string[]
    post: string[]
  }
  adjectives: string[]
} 