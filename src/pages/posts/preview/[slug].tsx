import { GetStaticPaths, GetStaticProps } from "next"
import { RichText } from "prismic-dom"
import { formatDate } from "../../../helpers/formatDate"
import { getPrismicClient } from "../../../services/prismic"

import styles from '../post.module.scss'
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { api } from "../../../services/api"
import { getStripeJS } from "../../../services/stripe-js"

interface PostPreviewProps{
  post:{
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}



export default function PostPreview({ post }: PostPreviewProps){
  const [session] = useSession()
  const router = useRouter()

  useEffect(()=>{
    if(session?.activeSubscription){
      router.push(`/posts/${post.slug}`)
    }
  },[session])

  async function handleSubscribe(){
    try{
      const response = await api.post('/subscribe')
      
      const { sessionId } = response.data
      const stripe = await getStripeJS()

      await stripe.redirectToCheckout({sessionId})
      
    }catch(err){
      alert(err.message)
    }
  }

  return( 
    <main className={styles.postContainer}>
      <div className={styles.postItems}>
        <h1>{post.title}</h1>
        <time>{post.updatedAt}</time>
        <article className={styles.postContent}>
          <div dangerouslySetInnerHTML={{__html: post.content}}/>
        </article>

        <button 
          type="button" 
          className={styles.continueReading}
          onClick={handleSubscribe}
        >
          Wanna continue reading?
          <span>Subscribe now 🤗</span>
        </button>
      </div>
    </main>
  )
}

export const getStaticPaths: GetStaticPaths = async() =>{
  return{
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  
  const prismic = getPrismicClient()
  const prismicResponse = await prismic.getByUID('post', String(slug), {})
  
  let post = {};
  if(prismicResponse){
    post = {
      slug: slug,
      title: RichText.asText(prismicResponse.data.title),
      content: RichText.asHtml((prismicResponse.data.content).splice(0, 3)),
      updatedAt: formatDate(prismicResponse.last_publication_date)
    }
  } else{
    post = {}
  }

  return{
    props:{
      post
    },
    revalidate: 60 * 30 // 30 minutes
  }
}