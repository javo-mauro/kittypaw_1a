import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { QuestionOption } from '@/lib/forms';

interface MultiChoiceInputProps {
  options: QuestionOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

const MultiChoiceInput: React.FC<MultiChoiceInputProps> = ({ options, value = [], onChange }) => {
  const handleCheckedChange = (checked: boolean, optionValue: string) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={`${option.value}`}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) => handleCheckedChange(!!checked, option.value)}
          />
          <Label htmlFor={`${option.value}`} className="font-normal">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
};

export default MultiChoiceInput;
