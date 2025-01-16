import { NextResponse } from 'next/server'
import { CharacterConfig } from '@/types/agent'

function validateCharacterConfig(config: CharacterConfig): string | null {
  // Log the received config
  console.log('Validating agent configuration:', JSON.stringify(config, null, 2))

  if (!config.name || typeof config.name !== 'string') {
    return 'Invalid name'
  }
  
  if (!Array.isArray(config.bio) || config.bio.length === 0) {
    return 'Bio is required and must be an array'
  }
  
  if (!Array.isArray(config.messageExamples) || config.messageExamples.length === 0) {
    return 'Message examples are required'
  }

  for (const example of config.messageExamples) {
    if (!Array.isArray(example) || example.length !== 2) {
      return 'Invalid message example format'
    }
    if (!example[0].content?.text || !example[1].content?.text) {
      return 'Message examples must have content'
    }
  }
  
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received request body:', JSON.stringify(body, null, 2))

    const { name, characterConfig } = body

    // Validate required fields
    if (!name || !characterConfig) {
      console.error('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate character config structure
    const validationError = validateCharacterConfig(characterConfig)
    if (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // Here we would typically save to a database
    // For now, we'll just return the created agent
    return NextResponse.json({ 
      success: true,
      agent: {
        name,
        characterConfig
      }
    })

  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
} 