import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { Async } from '.';

describe('Async component', () => {
  it('Should render elements', async () => {
    render(<Async/>);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
    
    expect(await screen.findByText('Wait to enter screen')).toBeInTheDocument();
    // expect(await waitFor(() => {
    //   return expect(screen.getByText('Wait to enter screen')).toBeInTheDocument();
    // }));

    // await waitForElementToBeRemoved(() => screen.queryByText('Wait to exit screen'));
    // expect(await waitFor(() => {
    //   return expect(screen.queryByText('Wait to exit screen')).not.toBeInTheDocument();
    // }));

    
  });
});