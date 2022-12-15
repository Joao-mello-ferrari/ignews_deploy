import { render, screen } from '@testing-library/react';
import { stripe } from '../../services/stripe';
import Home, { getStaticProps } from '../../pages';

jest.mock('next-auth/client', () => {
  return {
    useSession(){
      return [null, false];
    }
  }
})
jest.mock('next/router', () => {
  return {
    useRouter(){
      return {
        push: jest.fn(),
      }
    }
  }
});
jest.mock('../../services/stripe');

describe('Test Home page', () => {
  it('Should render Home page', () => {
    render(
      <Home product={{ amount: 10, priceId: 'fake-id' }}/>
    );

    expect(screen.getByText('for 10/month')).toBeInTheDocument();
  });

  it('Should return props from getStaticProps', async() => {
    const stripePricesRetrieveMocked = jest.mocked(stripe.prices.retrieve);
    stripePricesRetrieveMocked.mockResolvedValueOnce({
      id: 'fake-id',
      unit_amount: 10000,
    } as any);

    const returnValue = await getStaticProps({});

    expect(returnValue).toEqual(
      expect.objectContaining({
        props:{
          product:{
            priceId: 'fake-id',
            amount: '$100.00'
          }
        }
      })
    )
  });
});