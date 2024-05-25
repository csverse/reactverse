// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import { H1, Input } from 'ui-verse';

export function App() {
  return (
    <div>
      <H1>Hey there its using tailwind, mantine</H1>
      <Input style={{ width: '300px' }} variant="filled" />
    </div>
  );
}

export default App;
