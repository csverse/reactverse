// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import { UiVerse, H1 } from 'ui-verse';

export function App() {
  return (
    <div>
      <UiVerse />
      <H1 className="newclass">hey there what's up</H1>
    </div>
  );
}

export default App;
