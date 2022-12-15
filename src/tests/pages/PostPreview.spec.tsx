import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { getPrismicClient } from '../../services/prismic';
import { useSession } from 'next-auth/client';
import Post, { getStaticProps, getStaticPaths } from '../../pages/posts/preview/[slug]';
import { useRouter } from 'next/router';
import { getStripeJS } from '../../services/stripe-js';
import { api } from '../../services/api';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');
jest.mock('next/router', () => {
  return{
    useRouter: jest.fn().mockReturnValue({
      push: jest.fn(),
    }),
  }
});
jest.mock('../../services/stripe-js');
jest.mock('../../services/api');

const post = {
  slug: 'fake-post',
  title: 'fake-post-title',
  content: '<p>fake-post-excerpt</p>',
  updatedAt: '01 de abril de 2022',
};

describe('Test Post preview page', () => {
  it('Should render Post preview  page', () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(
      <Post post={post}/>
    );

    expect(screen.getByText('fake-post-title')).toBeInTheDocument();
    expect(screen.getByText('fake-post-excerpt')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  });

  it('Should redirect to Post page if user has an active subscription', async() => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce([{ activeSubscription: 'fake-sub' }, false]);

    const pushMocked = jest.fn();

    const useRouterMocked = jest.mocked(useRouter);
    useRouterMocked.mockReturnValueOnce({
      push: pushMocked
    } as any);

    render(<Post post={post} />)

    expect(pushMocked).toHaveBeenCalled();
  });

  it('Should return post preview info from getStaticProps', async() => {
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

    const returnValue = await getStaticProps({ params: { slug: 'fake-post-slug' }} as any);

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
    const prismicClientMocked = jest.mocked(getPrismicClient);
    prismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce(null),
    } as any);

    const returnValue = await getStaticProps({ params: { slug: 'fake-post-slug' }} as any);

    expect(returnValue).toEqual(
      expect.objectContaining({
        props:{
          post:{}
        }
      })
    );
  });

  it('Should return empy array from getStaticPaths', async() => {
    const returnValue = await getStaticPaths(null);

    expect(returnValue).toEqual(
      expect.objectContaining({
        paths: []
      }
    ));
  });

  it('Should subscribe user', () => {
    const useSessionMocked = jest.mocked(useSession);
    const session = { 
      user: { name: 'John doe', email: 'john@test.com', expires: 'fake-exp' },
      activeSubscription: null, 
    };
    useSessionMocked.mockReturnValueOnce([session, false]);

    const apiMocked = jest.mocked(api.post);
    apiMocked.mockResolvedValueOnce({
      data:{
        sessionId: 'fake-session-id'
      }
    });

    const redirectToCheckout = jest.fn();

    const getStripeJSMocked = jest.mocked(getStripeJS);
    getStripeJSMocked.mockResolvedValueOnce({
      redirectToCheckout
    } as any);

    render(<Post post={post} />);

    const button = screen.getByText('Wanna continue reading?');
    fireEvent.click(button);

    waitFor(()=>{
      expect(redirectToCheckout).toHaveBeenCalled();
    });
  });

  it('Should catch error during user subscription', () => {
    const useSessionMocked = jest.mocked(useSession);
    const session = { 
      user: { name: 'John doe', email: 'john@test.com', expires: 'fake-exp' },
      activeSubscription: null, 
    };
    useSessionMocked.mockReturnValueOnce([session, false]);

    const apiMocked = jest.mocked(api.post);
    apiMocked.mockResolvedValueOnce({
      data:{
        sessionId: 'fake-session-id'
      }
    });

    const redirectToCheckout = jest.fn().mockRejectedValueOnce(new Error());

    const getStripeJSMocked = jest.mocked(getStripeJS);
    getStripeJSMocked.mockResolvedValueOnce({
      redirectToCheckout
    } as any);

    render(<Post post={post} />);

    const button = screen.getByText('Wanna continue reading?');
    fireEvent.click(button);

    const alertMock = jest.spyOn(window,'alert').mockImplementation();

    waitFor(()=>{
      expect(alertMock).toHaveBeenCalled();
    });
  });
});