// D:\Escritorio\Proyectos\KittyPaw\Kittypaw_1a\apps\app_principal\client\src\pages\PetOnboardingPage.tsx
import React from 'react';
import InteractiveWizardForm from '@/components/ui/InteractiveWizardForm';
import { petOnboardingSections } from '@/lib/forms';

const PetOnboardingPage: React.FC = () => {
  const handleSubmit = (formData: Record<string, any>) => {
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    alert('Mascota registrada (simulado). Revisa la consola para ver los datos.');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Registra a tu Mascota</h1>
      <InteractiveWizardForm
        sections={petOnboardingSections}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default PetOnboardingPage;
