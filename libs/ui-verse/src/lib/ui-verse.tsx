import styles from './ui-verse.module.scss';

/* eslint-disable-next-line */
export interface UiVerseProps {}

export function UiVerse(props: UiVerseProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to UiVerse!</h1>
    </div>
  );
}

export default UiVerse;
