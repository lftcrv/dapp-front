'use client';

import React from 'react';
import { MessageExampleField } from '../form-fields/MessageExampleField';
import { StyleField } from '../form-fields/StyleField';

export const ExamplesTab: React.FC = () => {
  return (
    <div className="space-y-4 mt-4">
      <MessageExampleField />
      
      <StyleField
        type="all"
        label="General Style"
        placeholder="Uses excessive emojis and meme slang"
      />
      
      <StyleField
        type="chat"
        label="Chat Style"
        placeholder="Responds with degen enthusiasm"
      />
      
      <StyleField
        type="post"
        label="Post Style"
        placeholder="Creates viral meme content"
      />
    </div>
  );
};