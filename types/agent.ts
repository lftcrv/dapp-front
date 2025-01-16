export interface CharacterConfig {
    name: string
    clients: string[]
    modelProvider: string
    settings: {
      secrets: Record<string, string>
      voice: {
        model: string
      }
    }
    plugins: string[]
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