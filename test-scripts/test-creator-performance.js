#!/usr/bin/env node

/**
 * Test script for creator performance API endpoint
 */

import fetch from 'node-fetch';

const CREATOR_ID = '0x046494be4b665b6182152e656d5eae6ec9dc8e8d8870851f11422fff1457736a';
const API_URL = 'http://localhost:8080/api/creators';
const API_KEY = '';

async function testCreatorPerformanceApi() {
  console.log('Testing creator performance API endpoint...');
  console.log(`Getting performance for creator: ${CREATOR_ID}`);
  
  try {
    const response = await fetch(`${API_URL}/${CREATOR_ID}/performance`, {
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('\nAPI Response:');
    console.log('=============');
    console.log(JSON.stringify(data, null, 2));
    
    // Verify essential fields exist
    const requiredFields = [
      'creatorId', 'totalAgents', 'runningAgents', 'totalBalanceInUSD', 
      'totalPnlCycle', 'totalPnl24h', 'bestPerformingAgentPnlCycle', 'agentDetails'
    ];
    
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      console.error('\nWarning: Some required fields are missing in the API response:');
      console.error(missingFields.join(', '));
    } else {
      console.log('\nSuccess: All required fields are present in the API response.');
    }
    
    // Check if data can be used with our components
    const canMapToComponents = 
      Array.isArray(data.agentDetails) && 
      typeof data.totalAgents === 'number' &&
      typeof data.runningAgents === 'number' &&
      typeof data.totalPnlCycle === 'number';
    
    if (canMapToComponents) {
      console.log('Success: Data can be mapped to our components.');
    } else {
      console.error('Warning: Data structure may not be compatible with our components.');
    }
    
    return data;
  } catch (error) {
    console.error('Error testing API:', error.message);
    return null;
  }
}

// Run the test
testCreatorPerformanceApi().then(result => {
  console.log('\nTest completed.');
  process.exit(result ? 0 : 1);
}); 