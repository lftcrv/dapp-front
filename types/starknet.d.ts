import type { StarknetWindowObject } from 'get-starknet-core';

declare global {
  interface Window {
    starknet?: StarknetWindowObject;
  }
} 