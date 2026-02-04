import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders SkyFitnessPro title', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /skyfitnesspro/i })
    ).toBeInTheDocument()
  })
})
