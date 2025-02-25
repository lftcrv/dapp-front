'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AgentType,
  TabType,
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
  showAdvancedConfig: boolean;
  setAgentType: (type: AgentType) => void;
  setCurrentTab: (tab: TabType) => void;
  setProfilePicture: (file: File | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  setShowAdvancedConfig: (show: boolean) => void;
  updateField: <K extends keyof FormDataType>(
    field: K,
    value: FormDataType[K],
  ) => void;
  setFormName: (name: string) => void;
  handleArrayInput: (
    field: keyof Pick<
      FormDataType,
      | 'bioParagraphs'
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
      | 'topics'
      | 'adjectives'
      | 'postExamples'
    >,
    index: number,
    value: string,
  ) => void;
  handleRemoveField: (
    field: keyof Pick<
      FormDataType,
      | 'bioParagraphs'
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
      | 'topics'
      | 'adjectives'
      | 'postExamples'
    >,
    index: number,
  ) => void;
  handleAddField: (
    field: keyof Pick<
      FormDataType,
      | 'bioParagraphs'
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
      | 'topics'
      | 'adjectives'
      | 'postExamples'
    >,
  ) => void;
  handleMessageExample: (
    index: number,
    type: 'user' | 'agent',
    value: string,
  ) => void;
  handleAddMessageExample: () => void;
  handleRemoveMessageExample: (index: number) => void;
  handleStyleInput: (type: StyleType, index: number, value: string) => void;
  handleAddStyleField: (type: StyleType) => void;
  handleRemoveStyleField: (type: StyleType, index: number) => void;
  handleNext: () => void;
  handlePrevious: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [agentType, setAgentType] = useState<AgentType>('leftcurve');
  const [currentTab, setCurrentTab] = useState<TabType>('profile');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

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

  const setFormName = (name: string) => {
    updateField('name', name);
  };

  const handleArrayInput = (
    field: keyof Pick<
      FormDataType,
      | 'bioParagraphs'
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
      | 'topics'
      | 'adjectives'
      | 'postExamples'
    >,
    index: number,
    value: string,
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      const newArray = [...currentArray];
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
      | 'bioParagraphs'
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
      | 'topics'
      | 'adjectives'
      | 'postExamples'
    >,
    index: number,
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index),
      };
    });
  };

  const handleAddField = (
    field: keyof Pick<
      FormDataType,
      | 'bioParagraphs'
      | 'lore'
      | 'objectives'
      | 'knowledge'
      | 'external_plugins'
      | 'internal_plugins'
      | 'topics'
      | 'adjectives'
      | 'postExamples'
    >,
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      return {
        ...prev,
        [field]: [...currentArray, ''],
      };
    });
  };

  const handleMessageExample = (
    index: number,
    type: 'user' | 'agent',
    value: string,
  ) => {
    setFormData((prev) => {
      const newExamples = [...prev.messageExamples];
      if (type === 'user') {
        newExamples[index] = [
          { ...newExamples[index][0], content: { text: value } },
          newExamples[index][1],
        ];
      } else {
        newExamples[index] = [
          newExamples[index][0],
          { ...newExamples[index][1], content: { text: value } },
        ];
      }
      return {
        ...prev,
        messageExamples: newExamples,
      };
    });
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
        showAdvancedConfig,
        setAgentType,
        setCurrentTab,
        setProfilePicture,
        setFormData,
        setShowAdvancedConfig,
        updateField,
        setFormName,
        handleArrayInput,
        handleRemoveField,
        handleAddField,
        handleMessageExample,
        handleAddMessageExample,
        handleRemoveMessageExample,
        handleStyleInput,
        handleAddStyleField,
        handleRemoveStyleField,
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
