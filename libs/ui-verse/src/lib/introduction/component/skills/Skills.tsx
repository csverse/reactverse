import React from 'react'
import styles from './skills.module.scss';

const Achievement = () => {
  return (
    <div className={styles['skills']}>
      <h1>Skills</h1>
      <div className={styles['content']}>
        <div className={styles['div-empty']}></div>
        <div className={styles['div-content']}>
          <ul>
            <li>Languages: Java, Javascript, Typescript</li>
            <li>Frontend: React.js, Redux.js ,HTML, CSS, Webpack</li>
            <li>Backend: Node.js</li>
            <li>Database:  MongoDB, Postgres, Firebase</li>
            <li>CI/CD: Github actions</li>
            <li>Source Control: Git, Bitbucket</li>
            <li>Unit Testing: Junit</li>
            <li>Containerisation: Docker</li>
            <li>Other: REST, Agile, Object-Oriented Javascript (OOPS), Data Structures</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Achievement
