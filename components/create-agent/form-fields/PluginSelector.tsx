'use client';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFormContext } from '../FormContext';
import { AVAILABLE_INTERNAL_PLUGINS } from '../types';

export const PluginSelector: React.FC = () => {
  const { formData, updateField } = useFormContext();

  const handlePluginToggle = (plugin: string) => {
    // If the plugin is 'avnu', don't do anything when clicked
    if (plugin === 'avnu') return;

    const isSelected = formData.internal_plugins.includes(plugin);
    if (isSelected) {
      // Remove plugin
      updateField(
        'internal_plugins',
        formData.internal_plugins.filter((p) => p !== plugin),
      );
    } else {
      // Add plugin
      updateField('internal_plugins', [...formData.internal_plugins, plugin]);
    }
  };

  const getPluginLabel = (plugin: string): string => {
    switch (plugin) {
      case 'rpc':
        return 'RPC (Blockchain Data Access)';
      case 'lftcrv':
        return 'Avnu (DEX Integration)';
      case 'paradex':
        return 'Paradex (Perpetual Trading)';
      default:
        return plugin;
    }
  };

  const getPluginDescription = (plugin: string): string => {
    switch (plugin) {
      case 'rpc':
        return 'Allows the agent to query on-chain data and blockchain state';
      case 'lftcrv':
        return 'Enables trading on Avnu DEX for onchain swap';
      case 'paradex':
        return 'Provides perpetual futures trading capabilities';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Internal Plugins</Label>
      <p className="text-sm text-muted-foreground">
        Select the plugins your agent will use for trading and on-chain
        interactions.
      </p>
      <div className="grid gap-4 pt-2">
        {AVAILABLE_INTERNAL_PLUGINS.map((plugin) => (
          <div
            key={plugin}
            className="flex items-start space-x-3 p-3 rounded-md border hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              id={`plugin-${plugin}`}
              checked={formData.internal_plugins.includes(plugin)}
              onCheckedChange={() => handlePluginToggle(plugin)}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label
                htmlFor={`plugin-${plugin}`}
                className="font-medium cursor-pointer"
              >
                {getPluginLabel(plugin)}
              </Label>
              <p className="text-sm text-muted-foreground">
                {getPluginDescription(plugin)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
