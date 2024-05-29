import styles from './header.module.scss';
import profile_photo from '../../../../assets/images/profile_photo_no_bg.png';

export const Header = () => {
  return <div className={styles['header']}>
    <div className={styles['title-container']}>
      <h1>Neel Ratn</h1>
      <h2>Frontend Developer & Creativity Lover</h2>
    </div>
    <div className={styles['profile_photo_container']}>
      <img className={styles['profile_photo']} alt='profile_photo' src={profile_photo} />
    </div>
  </div>;
};

export default Header;
