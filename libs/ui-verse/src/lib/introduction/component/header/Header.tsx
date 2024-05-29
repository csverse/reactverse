import styles from './header.module.scss';
import profile_photo from '../../../../assets/images/profile_photo_no_bg.png';

export const Header = () => {
  return (
    <div className={styles['header']}>
      <div className={styles['title-container']}>
        <span data-title="heading">Hi <em>I'm </em>Neel Ratn</span>
        <span data-sub-title="sub-heading">I am a Software Engineer specializing in architecting, and developing end-to-end frontend solutions</span>
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