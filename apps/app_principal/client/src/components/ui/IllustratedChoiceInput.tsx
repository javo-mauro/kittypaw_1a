import React from 'react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QuestionOption } from '@/lib/forms';

interface IllustratedChoiceInputProps {
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
}

const IllustratedChoiceInput: React.FC<IllustratedChoiceInputProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex justify-center gap-4">
      {options.map((option) => {
        const Icon = (Icons as any)[option.illustration || 'CircleHelp'];
        const isSelected = value === option.value;

        return (
          <Button
            key={option.value}
            variant={isSelected ? 'default' : 'outline'}
            className={cn(
              "flex flex-col items-center justify-center h-28 w-28 rounded-lg p-4 transition-all",
              {
                'border-2 border-primary shadow-lg': isSelected,
                'hover:bg-accent hover:text-accent-foreground': !isSelected,
              }
            )}
            onClick={() => onChange(option.value)}
          >
            <Icon className="h-10 w-10 mb-2" />
            <span className="text-sm font-medium">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default IllustratedChoiceInput;
