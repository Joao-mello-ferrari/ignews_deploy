import { render, screen } from '@testing-library/react';
import { getPrismicClient } from '../../services/prismic';
import { getSession } from 'next-auth/client';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');

const post = {
  slug: 'fake-post',
  title: 'fake-post-title',
  content: '<p>fake-post-excerpt</p>',
  updatedAt: '01 de abril de 2022',
};

describe('Test Post page', () => {
  it('Should render Post page', () => {
    render(
      <Post post={post}/>
    );

    expect(screen.getByText('fake-post-title')).toBeInTheDocument();
    expect(screen.getByText('fake-post-excerpt')).toBeInTheDocument();
  });

  it('Should redirect to home if user doe not have active subscription', async() => {
    const getSessionMocked = jest.mocked(getSession);
    getSessionMocked.mockResolvedValueOnce(null);

    const returnValue = await getServerSideProps({} as any);

    expect(returnValue).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        })
      })
    )
  });

  it('Should return post info from getServerSideProps', async() => {
    const getSessionMocked = jest.mocked(getSession);
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    });

    const prismicClientMocked = jest.mocked(getPrismicClient);
    prismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{
            type: 'heading',
            text: 'fake-post-title'
          }],
          content: [{
            type: 'paragraph',
            text: 'fake-post-paragraph'
          }]
        },
        last_publication_date: '04-01-2022',
      })
    } as any);

    const returnValue = await getServerSideProps({ params: { slug: 'fake-post-slug' }} as any);

    expect(returnValue).toEqual(
      expect.objectContaining({
        props:{
          post:{
            slug: 'fake-post-slug',
            title: 'fake-post-title',
            content: '<p>fake-post-paragraph</p>',
            updatedAt: 'undefined de undefined de 01/04/2022',
          }
        }
      })
    )
  });

  it('Should return empty post from getServerSideProps if it was not found', async() => {
    const getSessionMocked = jest.mocked(getSession);
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    });

    const prismicClientMocked = jest.mocked(getPrismicClient);
    prismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce(null),
    } as any);

    const returnValue = await getServerSideProps({ params: { slug: 'fake-post-slug' }} as any);

    expect(returnValue).toEqual(
      expect.objectContaining({
        props:{
          post:{}
        }
      })
    )
  });
});