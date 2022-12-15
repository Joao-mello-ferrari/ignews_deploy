import { signIn, signOut, useSession} from  'next-auth/client'

import styles from './styles.module.scss'

export function SignInButton(){
  const [session] = useSession()

  return(
    session ? (
      <button 
        className={styles.button}
        onClick={()=>{signOut()}}
      >
        <img src='/assets/github_green.svg' alt="user"/>
        <span>{session.user.name}</span>
        <img src="/assets/close.svg" alt="logout"/>
      </button>
    ) : (
      <button 
        className={styles.button}
        onClick={()=>{signIn('github')}}
      >
        <img src='/assets/github_orange.svg' alt="github"/>
        <span>Sign in with GitHub</span>
      </button>
    )
  )
    
  
}