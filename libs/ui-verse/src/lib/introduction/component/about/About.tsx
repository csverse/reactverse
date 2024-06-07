import styles from './about.module.scss';

const About = () => {
  return (
    <div className={styles['about']}>
      <h1>Experience</h1>
      <div className={styles['about-content']}>
        <div className={styles['about-div-empty']}></div>
        <div className={styles['about-div-content']}>
          <ul>
            <li>
              Successfully implemented micro-frontend architecture with Web-Components and Shadow DOM, migrating React builds from CRA to Vite.Js within NX workspace, resulting in a 3x enhancement in developer experience and widespread adoption across the company for front-end projects</li>
            <li>
              Led end-to-end development of Image Source Management, a 6-month project in just 4 months, collaborating with product teams to refine requirements. Conducted code reviews to ensure quality and streamlined processes. Implemented SCRUM methodology, integrating Micro-Frontend (MFE) into a legacy Java app, and improved UX with Drag and Drop API
            </li>
            <li>
              End-to-end development of the Rose Clipper Chrome extension, leveraging Manifest v3 for optimal performance and security. Successfully deployed the extension on Chrome Web Store and assumed sole responsibility for ongoing maintenance and improvements
            </li>
            <li>
              Implemented support for PKCE OAuth2 authentication, seamlessly integrating with the platform’s Common-Login (SSO) application to ensure secure and efficient user authentication
            </li>
            <li>
              Developed reusable UI components, including Upload, Buttons, and Modals, within a central UI library Br-Components. Widely adopted by developers across teams for frontend development across company
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default About
