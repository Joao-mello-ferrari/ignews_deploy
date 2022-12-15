import { AppProps } from 'next/app'
import { Header } from '../components/Header'

import { Provider as AuthProivider } from 'next-auth/client'

import '../styles/global.scss'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProivider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </AuthProivider>
  )
}

export default MyApp
