// apps/app_principal/client/src/components/ui/InteractiveWizardForm.tsx
import React, { useState } from 'react';
import type { FormSection, Question } from '@/lib/forms';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import IllustratedChoiceInput from '@/components/ui/IllustratedChoiceInput';
import MultiChoiceInput from '@/components/ui/MultiChoiceInput';

interface InteractiveWizardFormProps {
  sections: FormSection[];
  onSubmit: (formData: Record<string, any>) => void;
}

const InteractiveWizardForm: React.FC<InteractiveWizardFormProps> = ({ sections, onSubmit }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (questionId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = formData[question.id];

    switch (question.type) {
      case 'text':
        return (
          <Input
            id={question.id}
            value={value || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        );
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(value, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => handleInputChange(question.id, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case 'photo':
        return (
          <Button variant="outline">
            Subir Foto (Simulado)
          </Button>
        );
      case 'choice':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(val) => handleInputChange(question.id, val)}
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                <Label htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'illustratedChoice':
        return (
          <IllustratedChoiceInput
            options={question.options || []}
            value={value || ''}
            onChange={(val) => handleInputChange(question.id, val)}
          />
        );
      case 'multiChoice':
        return (
          <MultiChoiceInput
            options={question.options || []}
            value={value || []}
            onChange={(val) => handleInputChange(question.id, val)}
          />
        );
      default:
        return <p className="text-red-500 text-xs italic">Input for type '{question.type}' not implemented yet.</p>;
    }
  };

  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">{currentSection.title}</h2>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className="bg-primary h-2.5 rounded-full"
          style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
        ></div>
      </div>

      <div className="space-y-6">
        {currentSection.questions.map((question) => {
          if (question.dependsOn) {
            const dependentValue = formData[question.dependsOn.questionId];
            if (dependentValue !== question.dependsOn.expectedValue) {
              return null;
            }
          }

          return (
            <div key={question.id}>
              <Label htmlFor={question.id} className="text-base font-medium">{question.label}</Label>
              <div className="mt-2">
                {renderQuestion(question)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0}
          variant="outline"
        >
          Anterior
        </Button>
        <Button onClick={handleNext}>
          {isLastSection ? 'Finalizar' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
};

export default InteractiveWizardForm;