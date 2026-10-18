import { Checkbox, Switch } from '@mantine/core';

export interface SettingToggleProps {
  kind?: 'checkbox' | 'switch';
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  error?: string;
  onChange?: (checked: boolean) => void;
}

export function SettingToggle({
  kind = 'checkbox',
  onChange,
  ...rest
}: SettingToggleProps) {
  const common = {
    ...rest,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange?.(e.currentTarget.checked),
  };
  return kind === 'switch' ? <Switch {...common} /> : <Checkbox {...common} />;
}

export default SettingToggle;
