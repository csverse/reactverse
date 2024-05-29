import resume from '../../../../assets/misc/Neel Ratn Resume.pdf';
import Button from '../../../button/Button';
import { IconDownload } from '@tabler/icons-react';
import styles from './download.module.scss';

export const Download = () => {
  return (
    <div className={styles['download']}>
      <span data-text='text'>Download My Resume 💁‍♂️</span>
      <span data-btn='button'>
          <a href={resume} target="_blank">
          <Button className={styles['download-btn']}>Download</Button>
        </a>
      </span>
    </div>
  );
};

export default Download;
