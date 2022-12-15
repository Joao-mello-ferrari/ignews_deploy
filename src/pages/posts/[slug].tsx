import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import { RichText } from "prismic-dom"
import { formatDate } from "../../helpers/formatDate"
import { getPrismicClient } from "../../services/prismic"

import styles from './post.module.scss'

interface PostProps{
  post:{
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function Post({ post }: PostProps){
  return( 
    <main className={styles.postContainer}>
      <div className={styles.postItems}>
        <h1>{post.title}</h1>
        <time>{post.updatedAt}</time>
        <article>
          <div dangerouslySetInnerHTML={{__html: post.content}}/>
        </article>
      </div>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async ({req, params}) => {
  // Fazer verificações do usuário
  const session = await getSession({ req })

  if(!session?.activeSubscription){
    return{
      redirect: {
        destination: '/',
        permanent: false,
      }  
    }
  }
  
  const { slug } = params
  
  const prismic = getPrismicClient(req)
  const prismicResponse = await prismic.getByUID('post', String(slug), {})
  
  let post = {};
  if(prismicResponse){
    post = {
      slug: slug,
      title: RichText.asText(prismicResponse.data.title),
      content: RichText.asHtml(prismicResponse.data.content),
      updatedAt: formatDate(prismicResponse.last_publication_date)
    }
  } else{
    post = {}
  }

  return{
    props:{
      post
    }
  }
}