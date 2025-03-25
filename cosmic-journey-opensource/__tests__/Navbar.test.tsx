import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  it('renders the navigation links', () => {
    render(<Navbar currentSection="home" scrollPosition={0} />);
    
    // Check if the main navigation elements are in the document
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
  });

  it('applies the active class to the current section', () => {
    render(<Navbar currentSection="explore" scrollPosition={100} />);
    
    // Get all navigation links
    const links = screen.getAllByRole('link');
    
    // Find the explore link
    const exploreLink = links.find(link => link.textContent?.includes('Explore'));
    
    // Verify it has the active class or style
    expect(exploreLink).toHaveClass('active');
  });
}); 