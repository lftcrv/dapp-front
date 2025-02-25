'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AgentType,
  TabType,
  ArrayFormField,
  FormDataType,
  initialFormData,
  StyleType,
  TABS,
} from './types';

interface FormContextType {
  formData: FormDataType;
  agentType: AgentType;
  currentTab: TabType;
  profilePicture: File | null;
  isFormValid: boolean;
  setAgentType: (type: AgentType) => void;
  setCurrentTab: (tab: TabType) => void;
  setProfilePicture: (file: File | null) => void;
  handleArrayInput: (
    field: ArrayFormField,
    index: number,
    value: string,
  ) => void;
  handleRemoveField: (field: ArrayFormField, index: number) => void;
  handleAddField: (field: ArrayFormField) => void;
  handleStyleInput: (type: StyleType, index: number, value: string) => void;
  handleAddStyleField: (type: StyleType) => void;
  handleRemoveStyleField: (type: StyleType, index: number) => void;
  handleMessageExample: (
    index: number,
    type: 'user' | 'agent',
    value: string,
  ) => void;
  handleAddMessageExample: () => void;
  handleRemoveMessageExample: (index: number) => void;
  setFormName: (name: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [agentType, setAgentType] = useState<AgentType>('leftcurve');
  const [currentTab, setCurrentTab] = useState<TabType>('basic');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const hasRequiredFields = Boolean(
      formData.name &&
        formData.bio.some((b) => b.trim()) &&
        formData.messageExamples.some(
          (m) => m[0].content.text.trim() && m[1].content.text.trim(),
        ),
    );

    setIsFormValid(hasRequiredFields);
  }, [formData.name, formData.bio, formData.messageExamples]);

  const handleArrayInput = (
    field: ArrayFormField,
    index: number,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) =>
        i === index ? value : item,
      ),
    }));
  };

  const handleRemoveField = (field: ArrayFormField, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index),
    }));
  };

  const handleAddField = (field: ArrayFormField) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const handleStyleInput = (type: StyleType, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [type]: prev.style[type].map((item, i) => (i === index ? value : item)),
      },
    }));
  };

  const handleAddStyleField = (type: StyleType) => {
    setFormData((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [type]: [...prev.style[type], ''],
      },
    }));
  };

  const handleRemoveStyleField = (type: StyleType, index: number) => {
    setFormData((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [type]: prev.style[type].filter((_, i) => i !== index),
      },
    }));
  };

  const handleMessageExample = (
    index: number,
    type: 'user' | 'agent',
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      messageExamples: prev.messageExamples.map((example, i) => {
        if (i !== index) return example;
        const [user, agent] = example;
        if (type === 'user') {
          return [{ ...user, content: { text: value } }, agent];
        } else {
          return [user, { ...agent, content: { text: value } }];
        }
      }),
    }));
  };

  const handleAddMessageExample = () => {
    setFormData((prev) => ({
      ...prev,
      messageExamples: [
        ...prev.messageExamples,
        [
          { user: 'user1', content: { text: '' } },
          { user: formData.name, content: { text: '' } },
        ],
      ],
    }));
  };

  const handleRemoveMessageExample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      messageExamples: prev.messageExamples.filter((_, i) => i !== index),
    }));
  };

  const setFormName = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
  };

  const handleNext = () => {
    const currentIndex = TABS.indexOf(currentTab);
    if (currentIndex < TABS.length - 1) {
      setCurrentTab(TABS[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = TABS.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(TABS[currentIndex - 1]);
    }
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        agentType,
        currentTab,
        profilePicture,
        isFormValid,
        setAgentType,
        setCurrentTab,
        setProfilePicture,
        handleArrayInput,
        handleRemoveField,
        handleAddField,
        handleStyleInput,
        handleAddStyleField,
        handleRemoveStyleField,
        handleMessageExample,
        handleAddMessageExample,
        handleRemoveMessageExample,
        setFormName,
        handleNext,
        handlePrevious,
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
