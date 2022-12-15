import { render, screen } from '@testing-library/react';
import { getPrismicClient } from '../../services/prismic';
import Posts, { getStaticProps } from '../../pages/posts';

jest.mock('../../services/prismic');

const posts = [{
  slug: 'fake-post',
  title: 'fake-post-title',
  excerpt: 'fake-post-exerpt',
  date: '01 de abril de 2022',
}]

describe('Test Posts page', () => {
  it('Should render Home page', () => {
    render(
      <Posts posts={posts}/>
    );

    expect(screen.getByText('fake-post-title')).toBeInTheDocument();
  });

  it('Should return props from getStaticProps', async() => {
    const prismicClientMocked = jest.mocked(getPrismicClient);
    prismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results:[{
          uid: 'fake-uid',
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
        }]
      })
    } as any);

    const returnValue = await getStaticProps({});

    expect(returnValue).toEqual(
      expect.objectContaining({
        props:{
          posts:[{
            slug: 'fake-uid',
            title: 'fake-post-title',
            excerpt: 'fake-post-paragraph',
            date: 'undefined de undefined de 01/04/2022',
          }]
        }
      })
    )
  });
});