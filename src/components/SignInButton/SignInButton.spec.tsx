import { fireEvent, render, screen } from '@testing-library/react';
import { SignInButton } from '.';
import { useSession, signIn, signOut } from 'next-auth/client';

jest.mock('next-auth/client');

describe('Test SignInButton component', () => {
  it('Should render when user is not athenticated', () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SignInButton />);

    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument();
  });

  it('Should render when user is athenticated', () => {
    const useSessionMocked = jest.mocked(useSession);
    const session = { user: { name: 'John doe', email: 'john@test.com', expires: 'fake-exp' } };
    useSessionMocked.mockReturnValueOnce([session, false]);

    render(<SignInButton />)

    expect(screen.getByText('John doe')).toBeInTheDocument();
  });

  it('Should signIn if user clicks on singIn button', () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);
    const signInMocked = jest.mocked(signIn);

    render(<SignInButton/>);

    const button = screen.getByText('Sign in with GitHub');
    fireEvent.click(button);

    expect(signInMocked).toHaveBeenCalled();
  });

  it('Should signOut if user clicks on singOut button', () => {
    const useSessionMocked = jest.mocked(useSession);
    const session = { user: { name: 'John doe', email: 'john@test.com', expires: 'fake-exp' } };
    useSessionMocked.mockReturnValueOnce([session, false]);
    
    const signOutMocked = jest.mocked(signIn);

    render(<SignInButton/>);

    const button = screen.getByText('John doe');
    fireEvent.click(button);

    expect(signOutMocked).toHaveBeenCalled();
  });
});