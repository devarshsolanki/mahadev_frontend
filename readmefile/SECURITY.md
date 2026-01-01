# Security Policy

## Reporting Vulnerabilities

**Do not open public issues for security vulnerabilities.**

Please report security vulnerabilities by email to: security@ganeshmart.com

Include:
- Type of vulnerability
- Location in source code
- Potential impact
- Proof of concept (if possible)

We will acknowledge your report within 48 hours and provide a timeline for fixes.

## Security Best Practices

### For Users
- Keep your browser and dependencies updated
- Use strong, unique passwords
- Enable two-factor authentication when available
- Don't share authentication tokens

### For Developers
- Never commit `.env` files or secrets
- Use environment variables for sensitive data
- Keep dependencies updated: `npm audit`
- Report security issues responsibly
- Follow OWASP guidelines

## Known Security Measures

- HTTPS enforced in production
- Security headers configured (CSP, X-Frame-Options, etc.)
- Input validation on all forms
- CSRF protection on state-changing operations
- Rate limiting on API endpoints
- Regular dependency audits

## Dependency Security

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Questions?

Email: security@ganeshmart.com
