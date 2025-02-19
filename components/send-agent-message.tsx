import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DockerMessageCard = () => {
  const [port, setPort] = useState('');
  const [runtimeAgentId, setRuntimeAgentId] = useState('');
  const [message, setMessage] = useState('execute SIMULATE_STARKNET_TRADE');
  const [apiKey, setApiKey] = useState('');

  const sendMessage = async () => {
    try {
      if (!port || !runtimeAgentId || !message || !apiKey) {
        console.error('Please fill all fields');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_RADICAL_URL;
      if (!baseUrl) {
        throw new Error('Missing API base URL configuration');
      }

      const apiUrl = `${baseUrl}:${port}`;

      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      };

      const requestBody = JSON.stringify({
        text: message,
        userId: 'user1234',
        userName: 'dzk',
        roomId: 'room456',
        name: 'Basic Interaction',
        agentId: runtimeAgentId,
      });
      console.log("sending to:", `${apiUrl}/${runtimeAgentId}/message`)
      const response = await fetch(`${apiUrl}/${runtimeAgentId}/message`, {
        method: 'POST',
        headers,
        body: requestBody,
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
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API Key"
          />
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Input
            id="message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
          />
        </div>
        <Button
          onClick={sendMessage}
          className="w-full"
          disabled={!port || !runtimeAgentId || !message || !apiKey}
        >
          Send Message
        </Button>
      </CardContent>
    </Card>
  );
};

export default DockerMessageCard;
