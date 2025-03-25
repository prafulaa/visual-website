# Security Policy and Best Practices

This document outlines the security measures implemented in the Cosmic Journey project and provides guidelines for maintaining a secure application.

## 🔐 API Keys and Credentials

- **Never hardcode API keys or secrets** directly in your code
- **Never share API keys or secrets** in GitHub repositories, chat messages, or public forums
- **Use environment variables** for all sensitive credentials
- All API keys should be stored in `.env.local` which is gitignored
- For production, use the hosting platform's secure environment variable storage (Vercel, Netlify, etc.)

## 🛡️ API Security Implementations

The following security measures have been implemented for API endpoints:

1. **Rate Limiting**: All API endpoints are protected by rate limiting to prevent abuse
2. **Input Validation**: All user inputs are sanitized and validated
3. **Output Sanitization**: All API responses are sanitized to prevent XSS
4. **Allowed Domains**: URL validation ensures only trusted domains are accessed
5. **Response Caching**: Responses are cached to reduce API calls and improve performance
6. **Error Handling**: Generic error messages prevent information disclosure
7. **Secure Headers**: API responses include security headers to mitigate common attacks

## 🔒 Security Headers

The application sets the following security headers:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking attacks
- `X-XSS-Protection: 1; mode=block` - Enables browser XSS protection
- `Strict-Transport-Security` - Enforces HTTPS
- `Content-Security-Policy` - Restricts resource loading to trusted sources
- `Permissions-Policy` - Restricts feature access

## 🔍 Secure Coding Practices

When contributing to this project, follow these secure coding practices:

1. **Validate All Inputs**: Never trust user inputs, always validate and sanitize
2. **Use Parameterized Queries**: Never use string concatenation for API calls or database queries
3. **Apply Principle of Least Privilege**: Use the minimum privileges necessary for functionality
4. **Secure Dependencies**: Keep all dependencies updated to mitigate vulnerabilities
5. **Error Handling**: Use generic error messages for users, log detailed errors internally
6. **Authentication**: Protect sensitive routes with proper authentication
7. **HTTPS Only**: Always use HTTPS in production

## 🚨 Security Tools and Scripts

The project includes several security-focused tools:

- `npm run security-check`: Runs npm audit and checks for outdated packages
- `eslint-plugin-security`: Static analysis for security vulnerabilities
- `helmet`: Middleware for setting secure HTTP headers
- `xss-clean`: Middleware to sanitize user input

## 📝 Security Endpoints and Middleware

### Middleware (`middleware.ts`)

- Implements rate limiting for API routes
- Detects and blocks suspicious requests
- Adds security headers to all API responses

### Secure API Utilities (`utils/secureApiUtils.ts`)

- Securely handles API authentication 
- Implements request timeouts
- Provides input validation and sanitization
- Creates secure hashes for caching
- Handles errors securely

## 🔄 Regular Security Tasks

- Run `npm run security-check` regularly to identify vulnerabilities
- Keep dependencies updated with `npm update`
- Review security headers quarterly to ensure they match best practices
- Monitor API usage for unusual patterns

## 🚫 Known Issues and Exceptions

- The astronomical calculations are performed server-side to protect API keys
- Third-party APIs (NASA, Astronomy API) might have their own security limitations

## 🆘 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** disclose it publicly in issues, discussions, or pull requests
2. Email the project maintainer privately with details
3. Allow time for the issue to be addressed before public disclosure

## 🌟 API-Specific Security Notes

### Astronomy API

- Basic authentication is implemented with secure credential storage
- Requests are made server-side to prevent credential exposure
- Responses are validated to prevent injection attacks

### NASA API  

- API key is stored as an environment variable
- All URLs are validated against allowed domains
- Responses are sanitized before being sent to clients

## 📚 Additional Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Next.js Security Documentation](https://nextjs.org/docs/app/building-your-application/security)
- [Web Security MDN](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security-best-practices/)

---

Last updated: June 2024 