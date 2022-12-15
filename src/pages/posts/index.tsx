import { GetStaticProps } from 'next'
import { getPrismicClient } from '../../services/prismic'
import Link from 'next/link'

import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'

import styles from './styles.module.scss'
import { formatDate } from '../../helpers/formatDate'

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}

interface PostsProps{
  posts: Post[];
}

interface PrismicPostsContent{
  type: string;
  text: string;
  spans: [];
}


export default function Posts({ posts }: PostsProps){
  return(
    <main className={styles.container}>
      <div className={styles.postsList}>
        {posts.map(post=>{
          return(
            <Link key={post.slug} href={`/posts/preview/${post.slug}`}>
              <span>
                <time>{post.date}</time>
                <h1>{post.title}</h1>
                <p>{post.excerpt}</p>
              </span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const prismicResponse = await prismic.query(
    [ Prismic.Predicates.at('document.type', 'post') ],
    { fetch: ['post.title', 'post.content'], pageSize: 100 }
  )

  const posts = prismicResponse.results.map(post=>{
    return{
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find((item: PrismicPostsContent) => item.type === 'paragraph')?.text ?? '',
      date: formatDate(post.last_publication_date)
    }
  })

  return {
    props:{
      posts
    },
    revalidate: 60 * 60 // 1 hour
  }
}