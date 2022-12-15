import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubscribeButton } from '.';
import { useSession, signIn } from 'next-auth/client';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJS } from '../../services/stripe-js'

jest.mock('next-auth/client');
jest.mock('next/router', () => {
  return{
    useRouter: jest.fn().mockReturnValue({
      push: jest.fn(),
    }),
  }
});
jest.mock('../../services/api');
jest.mock('../../services/stripe-js');

describe('Test SubscribeButton component', () => {
  it('Should render default button', () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SubscribeButton />);

    expect(screen.getByText('Subscribe now')).toBeInTheDocument();
  });

  it('Should redirect to signIn if not authenticated', () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    const signInMocked = jest.mocked(signIn);

    render(<SubscribeButton />);

    const button = screen.getByText('Subscribe now');
    fireEvent.click(button);

    expect(signInMocked).toHaveBeenCalled();
  });

  it('Should redirect to posts if authenticated', () => {
    const useSessionMocked = jest.mocked(useSession);
    const session = { 
      user: { name: 'John doe', email: 'john@test.com', expires: 'fake-exp' },
      activeSubscription: 'fake-sub' 
    };
    useSessionMocked.mockReturnValueOnce([session, false]);

    const pushMocked = jest.fn();
    const useRouterMocked = jest.mocked(useRouter);
    useRouterMocked.mockReturnValueOnce({ push: pushMocked } as any);

    render(<SubscribeButton />);

    const button = screen.getByText('Subscribe now');
    fireEvent.click(button);

    expect(pushMocked).toHaveBeenCalled();
  });

  it('Should subscribe if user is authenticated and does not have active plan', () => {
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

    render(<SubscribeButton />);

    const button = screen.getByText('Subscribe now');
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

    render(<SubscribeButton />);

    const button = screen.getByText('Subscribe now');
    fireEvent.click(button);

    const alertMock = jest.spyOn(window,'alert').mockImplementation(); 

    waitFor(()=>{
      expect(alertMock).toHaveBeenCalled();
    });
  });
});