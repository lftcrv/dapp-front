'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgentType, FormDataType, initialFormData } from './types';

interface FormContextType {
  formData: FormDataType;
  agentType: AgentType;
  profilePicture: File | null;
  isFormValid: boolean;
  setAgentType: (type: AgentType) => void;
  setProfilePicture: (file: File | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  updateField: <K extends keyof FormDataType>(
    field: K,
    value: FormDataType[K],
  ) => void;
  handleArrayInput: (
    field: keyof Pick<
      FormDataType,
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
    >,
    index: number,
    value: string,
  ) => void;
  handleRemoveField: (
    field: keyof Pick<
      FormDataType,
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
    >,
    index: number,
  ) => void;
  handleAddField: (
    field: keyof Pick<
      FormDataType,
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
    >,
  ) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [agentType, setAgentType] = useState<AgentType>('leftcurve');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const hasRequiredFields = Boolean(
      formData.name.trim() && formData.bio.trim(),
    );

    setIsFormValid(hasRequiredFields);
  }, [formData.name, formData.bio]);

  const updateField = <K extends keyof FormDataType>(
    field: K,
    value: FormDataType[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayInput = (
    field: keyof Pick<
      FormDataType,
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
    >,
    index: number,
    value: string,
  ) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const handleRemoveField = (
    field: keyof Pick<
      FormDataType,
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
    >,
    index: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleAddField = (
    field: keyof Pick<
      FormDataType,
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        agentType,
        profilePicture,
        isFormValid,
        setAgentType,
        setProfilePicture,
        setFormData,
        updateField,
        handleArrayInput,
        handleRemoveField,
        handleAddField,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
