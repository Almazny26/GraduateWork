import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('renders SkyFitnessPro title on home page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(
      screen.getByRole('img', { name: /skyfitnesspro/i })
    ).toBeInTheDocument()
  })
})
