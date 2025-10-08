export type QuestionType = 'text' | 'date' | 'photo' | 'choice' | 'illustratedChoice';

export interface QuestionOption {
  value: string;
  label: string;
  illustration?: string;
}

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  options?: QuestionOption[];
  dependsOn?: {
    questionId: string;
    expectedValue: any;
  };
}

export interface FormSection {
  id: string;
  title: string;
  questions: Question[];
}

export const petOnboardingSections: FormSection[] = [
  {
    id: 'identification',
    title: 'Identificación de la Mascota',
    questions: [
      {
        id: 'petName',
        label: '¿Cómo se llama tu mascota?',
        type: 'text',
        placeholder: 'Ej: Mishi, Rocky, Luna'
      },
      {
        id: 'petSpecies',
        label: '¿Qué especie es?',
        type: 'illustratedChoice',
        options: [
          { value: 'cat', label: 'Gato', illustration: 'Cat' },
          { value: 'dog', label: 'Perro', illustration: 'Dog' },
        ]
      },
      {
        id: 'petBreed',
        label: '¿De qué raza es?',
        type: 'text',
        placeholder: 'Ej: Siamés, Golden Retriever, Mestizo'
      },
      {
        id: 'petBirthdate',
        label: 'Fecha de nacimiento',
        type: 'date',
      },
      {
        id: 'petPhoto',
        label: 'Foto de tu mascota',
        type: 'photo',
      },
    ]
  },
  {
    id: 'health',
    title: 'Salud de la Mascota',
    questions: [
      {
        id: 'isSterilized',
        label: '¿Está esterilizado/a?',
        type: 'choice',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' },
        ]
      },
      {
        id: 'vaccinationsUpToDate',
        label: '¿Tiene las vacunas al día?',
        type: 'choice',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' },
        ]
      },
      {
        id: 'allergies',
        label: '¿Tiene alguna alergia conocida?',
        type: 'text',
        placeholder: 'Ej: Alergia al polen, a ciertos alimentos, etc.'
      },
      {
        id: 'chronicDiseases',
        label: '¿Padece alguna enfermedad crónica?',
        type: 'text',
        placeholder: 'Ej: Insuficiencia renal, diabetes, etc.'
      },
    ]
  },
  {
    id: 'household',
    title: 'Entorno de la Mascota',
    questions: [
      {
        id: 'otherPets',
        label: '¿Convive con otras mascotas?',
        type: 'choice',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' },
        ]
      },
      {
        id: 'otherPetsDetails',
        label: 'Especifique qué otras mascotas',
        type: 'text',
        placeholder: 'Ej: Un perro y dos gatos',
        dependsOn: {
          questionId: 'otherPets',
          expectedValue: 'yes',
        }
      },
      {
        id: 'outdoorAccess',
        label: '¿Tiene acceso al exterior?',
        type: 'choice',
        options: [
          { value: 'none', label: 'Nunca' },
          { value: 'supervised', label: 'Solo con supervisión' },
          { value: 'free', label: 'Libremente' },
        ]
      },
    ]
  },
  // ... más secciones aquí
];
