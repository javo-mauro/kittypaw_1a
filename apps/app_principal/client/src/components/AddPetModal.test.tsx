import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AddPetModal from './AddPetModal';

describe('AddPetModal', () => {
  it('should call onPetAdd with form data when submitted', async () => {
    const user = userEvent.setup();
    const handlePetAdd = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddPetModal 
        isOpen={true} 
        onClose={handleClose} 
        onPetAdd={handlePetAdd} 
      />
    );

    // Find form elements
    const nameInput = screen.getByLabelText('Nombre');
    const speciesSelectTrigger = screen.getByRole('combobox');
    const saveButton = screen.getByRole('button', { name: /guardar mascota/i });

    // Simulate user input
    await user.type(nameInput, 'Fígaro');
    await user.click(speciesSelectTrigger);
    const gatoOption = await screen.findByText('Gato');
    await user.click(gatoOption);
    
    // Simulate form submission
    await user.click(saveButton);

    // Assertions
    expect(handlePetAdd).toHaveBeenCalledTimes(1);
    expect(handlePetAdd).toHaveBeenCalledWith({
      name: 'Fígaro',
      species: 'Gato',
      breed: '',
      birthDate: '',
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
