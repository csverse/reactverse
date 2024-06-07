import styles from './header.module.scss';
import profile_photo from '../../../../assets/images/profile_photo_no_bg.png';
import { Button } from '../../../button/Button';
import resume from '../../../../assets/misc/Neel Ratn Resume.pdf';

export const Header = () => {
  return (
    <div className={styles['header']}>
      <div className={styles['title-container']}>
        <span data-title="heading">Hi, I'm <em>Neel Ratn</em></span>
        <span data-sub-title="sub-heading">I am a Software Engineer specializing in architecting, and developing end-to-end frontend solutions</span>
        <span data-link="link">
          <a title='neelratn.official@gmail.com' className={styles['social-links']} href='mailto:neelratn.official@gmail.com' target="_blank" rel="noreferrer">
            <img alt='gmail' src='https://img.icons8.com/?size=100&id=P7UIlhbpWzZm&format=png&color=000000' />
          </a>
          <a title='+91 9760754504' className={styles['social-links']} href={'https://wa.me/+919760754504'} target="_blank" rel="noreferrer">
            <img alt='whatsapp' src='https://img.icons8.com/?size=100&id=BkugfgmBwtEI&format=png&color=000000' />
          </a>
          <a title='github' className={styles['social-links']} href={'https://github.com/neelra8n'} target="_blank" rel="noreferrer"><img alt='github' src='https://img.icons8.com/?size=100&id=akG4VRhAoSii&format=png&color=000000' /></a>
          <a title='linkedin' className={styles['social-links']} href={'https://www.linkedin.com/in/neelratn/'} target="_blank" rel="noreferrer"><img alt='linkedin' src='https://img.icons8.com/?size=100&id=13930&format=png&color=000000' /></a>
          <a title='instagram' className={styles['social-links']} href={'https://www.instagram.com/neel_ratn/'} target="_blank" rel="noreferrer"><img alt='instagram' src='https://img.icons8.com/?size=100&id=42819&format=png&color=000000' /></a>
          <a title='resume' className={styles['social-links']} href={resume} target="_blank" rel="noreferrer">
            <img alt='resume' src='https://img.icons8.com/?size=100&id=FG6Ri8Qc8Cf6&format=png&color=000000' />
          </a>
          <a title='twitter' className={styles['social-links']} href={'https://x.com/RatnNeel31408'} target="_blank" rel="noreferrer">
            <img alt='twitter' src='https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=000000' />
          </a>
        </span>
        <Button variant='filled' className={styles["download-button"]}>Download Resume</Button>
      </div>
      <div className={styles['profile_photo_container']}>
        <div className={styles['img_container']}>
          <img className={styles['profile_photo']} alt='profile_photo' src={profile_photo} />
        </div>
      </div>
    </div>
  );
};

export default Header;
