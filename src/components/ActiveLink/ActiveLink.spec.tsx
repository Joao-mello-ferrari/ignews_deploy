import { render } from '@testing-library/react';
import { ActiveLink } from '.';

jest.mock('next/router', () => {
  return {
    useRouter(){
      return{
        asPath: '/',
      }
    }
  }
});

describe('Test ActiveLink component', () => {
  it('Should render link', () =>{
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <span>Home</span>
      </ActiveLink>
    )
    expect(getByText('Home')).toBeInTheDocument();
  });

  it('Should render active link with active class', () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <span>Home</span>
      </ActiveLink>
    )
    expect(getByText('Home')).toHaveClass('active');
  });
});