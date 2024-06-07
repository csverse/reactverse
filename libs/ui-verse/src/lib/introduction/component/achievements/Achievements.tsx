import styles from './achievements.module.scss';

const Achievements = () => {
  return (
    <div className={styles['achievements']}>
      <h1>Achievements</h1>
      <div className={styles['content']}>
        <div className='d-flr j-between'>
          <img src="https://github-readme-stats.vercel.app/api?username=neelra8n&show_icons=true&locale=en" alt="git stars" />
          <img src="https://github-readme-stats.vercel.app/api/top-langs?username=neelra8n&show_icons=true&locale=en&layout=compact" alt="neelra8n" />
        </div>
        <div className='d-flr j-between'>
          <img alt='leetcode' src="https://leetcard.jacoblin.cool/neelratn" />
          <img alt='leetcode' src="https://leetcode-badge-showcase.vercel.app/api?username=neelratn&theme=dark&filter=comp" />
        </div>
      </div>
    </div >
  )
}

export default Achievements
