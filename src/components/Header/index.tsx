import { SignInButton } from '../SignInButton'
import { ActiveLink } from '../ActiveLink'

import styles from './styles.module.scss'

export function Header(){
  return(
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <div >
          <img src="/assets/logo.svg" alt="ignews"/>
          <nav>
            <ActiveLink href="/" activeClassName={styles.active}>
              <span>Home</span>
            </ActiveLink>
            <ActiveLink href="/posts" activeClassName={styles.active}>
              <span>Posts</span>
            </ActiveLink>
          </nav>
        </div>

        <SignInButton />
      </div>
    </header>
  )
}