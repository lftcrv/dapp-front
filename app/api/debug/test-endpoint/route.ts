import { NextRequest, NextResponse } from 'next/server';

// API base URL for access codes
const API_URL = 'http://localhost:8080';
const API_KEY = 'carbonable-our-giga-secret-api-key';
const API_BASE_URL = '/api/access-code';

export async function GET(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json(
      { error: 'Missing endpoint parameter' },
      { status: 400 }
    );
  }
  
  try {
    let url = '';
    
    switch (endpoint) {
      case 'stats':
        url = `${API_URL}${API_BASE_URL}/access-codes/stats`;
        break;
      case 'list':
        url = `${API_URL}${API_BASE_URL}/access-codes/list`;
        break;
      case 'activities':
        url = `${API_URL}${API_BASE_URL}/access-codes/activities`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint parameter' },
          { status: 400 }
        );
    }
    
    console.log(`Testing endpoint: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    
    const status = response.status;
    let data;
    
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      data = { error: 'Failed to parse response as JSON' };
    }
    
    return NextResponse.json({
      endpoint,
      status,
      data,
      ok: response.ok
    });
  } catch (error) {
    console.error(`Error testing endpoint ${endpoint}:`, error);
    
    return NextResponse.json(
      { 
        endpoint,
        error: 'Failed to fetch endpoint',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 