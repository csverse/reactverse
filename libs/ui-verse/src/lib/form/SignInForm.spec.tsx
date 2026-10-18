import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../utils/test/renderWithTheme';
import { SignInForm, validateSignIn } from './SignInForm';

describe('validateSignIn', () => {
  it('requires both fields', () => {
    expect(validateSignIn({ email: '', password: '' })).toEqual({
      email: 'Enter your work email.',
      password: 'Enter your password.',
    });
  });

  it('rejects short passwords and malformed emails', () => {
    const errors = validateSignIn({ email: 'a@b', password: '1234567' });
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
  });

  it('accepts valid values', () => {
    expect(validateSignIn({ email: 'a@b.co', password: '12345678' })).toEqual({});
  });
});

describe('SignInForm', () => {
  it('does not submit invalid input', () => {
    const onSubmit = jest.fn();
    const { getByRole, getByText } = renderWithTheme(<SignInForm onSubmit={onSubmit} />);
    fireEvent.click(getByRole('button', { name: 'Sign in' }));
    expect(getByText('Enter your work email.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('moves focus to the first invalid field', () => {
    const { getByRole, getByLabelText } = renderWithTheme(<SignInForm onSubmit={jest.fn()} />);
    fireEvent.click(getByRole('button', { name: 'Sign in' }));
    expect(document.activeElement).toBe(getByLabelText('Work email'));
  });

  it('submits valid input', () => {
    const onSubmit = jest.fn();
    const { getByRole, getByLabelText } = renderWithTheme(<SignInForm onSubmit={onSubmit} />);
    fireEvent.change(getByLabelText('Work email'), { target: { value: 'a@b.co' } });
    fireEvent.change(getByLabelText('Password'), { target: { value: '12345678' } });
    fireEvent.click(getByRole('button', { name: 'Sign in' }));
    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.co', password: '12345678' });
  });

  it('announces server errors', () => {
    const { getByRole } = renderWithTheme(
      <SignInForm onSubmit={jest.fn()} serverError="Wrong credentials." />
    );
    expect(getByRole('alert').textContent).toBe('Wrong credentials.');
  });
});
