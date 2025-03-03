import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../ui/form';
import { CodeType, GenerationParams } from '../../types/accessCode';

// Form schema definition
const formSchema = z.object({
  type: z.enum(['ADMIN', 'REFERRAL', 'TEMPORARY']),
  maxUses: z.string().optional(),
  expiresAt: z.string().optional(),
  description: z.string().optional(),
  count: z.string().default('1'),
});

type FormValues = z.infer<typeof formSchema>;

interface CodeGeneratorProps {
  onGenerate: (params: GenerationParams) => Promise<void>;
  isLoading: boolean;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({
  onGenerate,
  isLoading,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'TEMPORARY',
      maxUses: '',
      expiresAt: '',
      description: '',
      count: '1',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    const params: GenerationParams = {
      type: values.type as CodeType,
      maxUses: values.maxUses ? parseInt(values.maxUses, 10) : undefined,
      expiresAt: values.expiresAt || undefined,
      description: values.description,
      count: values.count,
    };

    await onGenerate(params);
    form.reset();
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium text-gray-700 mb-1.5">
                    Code Type
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border border-gray-300 rounded-md h-10 px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                        <SelectValue placeholder="Select code type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md z-[9999]">
                      <SelectItem
                        value="ADMIN"
                        className="hover:bg-gray-100 text-gray-900"
                      >
                        Admin
                      </SelectItem>
                      <SelectItem
                        value="REFERRAL"
                        className="hover:bg-gray-100 text-gray-900"
                      >
                        Referral
                      </SelectItem>
                      <SelectItem
                        value="TEMPORARY"
                        className="hover:bg-gray-100 text-gray-900"
                      >
                        Temporary
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxUses"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium text-gray-700 mb-1.5">
                    Max Uses (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Unlimited if empty"
                      {...field}
                      disabled={isLoading}
                      className="w-full border border-gray-300 rounded-md h-10 px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium text-gray-700 mb-1.5">
                    Number of Codes
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      {...field}
                      disabled={isLoading}
                      className="w-full border border-gray-300 rounded-md h-10 px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 mt-1">
                    Generate multiple codes with the same settings (max: 100)
                  </FormDescription>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium text-gray-700 mb-1.5">
                    Expiration Date (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={isLoading}
                      className="w-full border border-gray-300 rounded-md h-10 px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium text-gray-700 mb-1.5">
                  Description (optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter a description for this code"
                    className="w-full border border-gray-300 rounded-md h-10 px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 mt-6 h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </div>
            ) : (
              'Generate Code'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CodeGenerator;
