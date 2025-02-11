import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DockerMessageCard: React.FC = () => {
  const [port, setPort] = useState('');
  const [runtimeAgentId, setRuntimeAgentId] = useState('');

  const sendMessage = async () => {
    try {
      if (!port || !runtimeAgentId) {
        console.error('Please fill all fields');
        return;
      }

      const url = `http://localhost:${port}/${runtimeAgentId}/message`;
      console.log('url:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'execute SIMULATE_STARKNET_TRADE',
          userId: 'user1234',
          userName: 'dzk',
          roomId: 'room456',
          name: 'Basic Interaction',
          agentId: runtimeAgentId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Actions Docker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="Enter port number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="runtimeAgentId">Runtime Agent ID</Label>
          <Input
            id="runtimeAgentId"
            type="text"
            value={runtimeAgentId}
            onChange={(e) => setRuntimeAgentId(e.target.value)}
            placeholder="Enter runtime agent ID"
          />
        </div>
        <Button
          onClick={sendMessage}
          className="w-full"
          disabled={!port || !runtimeAgentId}
        >
          Call SimulateTrade
        </Button>
      </CardContent>
    </Card>
  );
};

export default DockerMessageCard;
