# Contributing to Cosmic Journey

Thank you for considering contributing to Cosmic Journey! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check if the issue already exists. When you create a bug report, include as many details as possible:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser and OS details

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed functionality
- Any potential implementation details
- Why this enhancement would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting if available
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Create a Pull Request

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cosmic-journey.git
   cd cosmic-journey
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Styleguide

- Use 2 spaces for indentation
- Use semicolons
- Prefer const over let (and avoid var)
- Use meaningful variable names
- Format code with Prettier

### React/JSX Styleguide

- Use functional components with hooks
- Use TypeScript for type safety
- Destructure props in component parameters
- Use memoization for expensive calculations
- Split large components into smaller ones

## Additional Notes

### Performance Considerations

- Use React.memo for pure functional components
- Memoize expensive calculations with useMemo
- Memoize callback functions with useCallback
- Optimize rendering by avoiding unnecessary state updates
- Use requestAnimationFrame for smooth animations

Thank you for contributing to Cosmic Journey! 