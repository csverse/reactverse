import { FormEvent, useRef, useState } from 'react';
import { Alert, Button, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';

export interface SignInValues {
  email: string;
  password: string;
}

export interface SignInFormProps {
  onSubmit: (values: SignInValues) => void;
  loading?: boolean;
  /** Error from the server, e.g. wrong credentials. */
  serverError?: string;
}

type Errors = Partial<Record<keyof SignInValues, string>>;

export const validateSignIn = ({ email, password }: SignInValues): Errors => {
  const errors: Errors = {};
  if (!email.trim()) errors.email = 'Enter your work email.';
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'That email address looks incomplete.';
  if (!password) errors.password = 'Enter your password.';
  else if (password.length < 8) errors.password = 'Passwords have at least 8 characters.';
  return errors;
};

export function SignInForm({ onSubmit, loading = false, serverError }: SignInFormProps) {
  const [values, setValues] = useState<SignInValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handle = (e: FormEvent) => {
    e.preventDefault();
    const found = validateSignIn(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
    // Send keyboard and screen reader users to the first problem.
    else if (found.email) emailRef.current?.focus();
    else passwordRef.current?.focus();
  };

  return (
    <Paper withBorder p="lg" maw={380} component="form" noValidate onSubmit={handle}>
      <Stack>
        <Title order={3}>Sign in to review builds</Title>
        {serverError && (
          <Alert color="red" variant="light">
            {serverError}
          </Alert>
        )}
        <TextInput
          ref={emailRef}
          label="Work email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(e) => setValues({ ...values, email: e.currentTarget.value })}
        />
        <PasswordInput
          ref={passwordRef}
          label="Password"
          autoComplete="current-password"
          value={values.password}
          error={errors.password}
          onChange={(e) => setValues({ ...values, password: e.currentTarget.value })}
        />
        <Button type="submit" loading={loading} fullWidth>
          Sign in
        </Button>
      </Stack>
    </Paper>
  );
}

export default SignInForm;
