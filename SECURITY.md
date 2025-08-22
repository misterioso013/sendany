# Security Policy

## Supported Versions

Currently, these versions of SendAny receive security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

SendAny's security is a priority. If you discover a security vulnerability, please follow these guidelines:

### 🔒 For Security Vulnerabilities

**DO NOT** create a public issue for security vulnerabilities.

Instead:

1. **Use GitHub Security Advisories**: Go to [Security Advisories](https://github.com/misterioso013/sendany/security/advisories/new) and create a private advisory
2. **Direct email**: Contact maintainers via email (if available)
3. **Provide details**: Include as much information as possible about the vulnerability

### 📋 Information to Include

When reporting a vulnerability, include:

- **Vulnerability type**: XSS, SQL Injection, CSRF, etc.
- **Detailed description**: How the vulnerability works
- **Steps to reproduce**: How to demonstrate the vulnerability
- **Potential impact**: What damage could be caused
- **Fix suggestions**: If you have ideas for fixing
- **Evidence**: Screenshots, logs, or proof-of-concept

### ⏱️ Response Process

1. **Acknowledgment**: We'll confirm receipt within 24-48 hours
2. **Initial assessment**: We'll evaluate severity within 2-5 days
3. **Development**: We'll work on the fix
4. **Coordinated disclosure**: We'll work with you on public disclosure timing
5. **Release**: We'll release the fix and appropriate credit

### 🎯 In-Scope Vulnerabilities

We're particularly interested in vulnerabilities related to:

#### High Priority
- **Authentication bypass**: Bypassing Stack Auth
- **SQL Injection**: In database queries
- **XSS**: Cross-site scripting in user inputs
- **File upload vulnerabilities**: Uploading malicious files
- **Access control**: Accessing other users' workspaces
- **Data exposure**: Sensitive data leakage

#### Medium Priority
- **CSRF**: Cross-site request forgery
- **Open redirect**: Malicious redirects
- **Information disclosure**: Minor information leakage
- **Rate limiting bypass**: Bypassing API limits
- **Session management**: Session-related issues

#### Infrastructure Vulnerabilities
- **Database exposure**: PostgreSQL/Neon misconfiguration
- **Google Drive API abuse**: Misuse of integration
- **Environment variable exposure**: Secret leakage
- **DoS attacks**: Denial of service attacks

### 🚫 Out of Scope

The following activities are NOT considered vulnerabilities:

- **Self-XSS**: Requiring victim interaction to execute own code
- **Social engineering**: Attacks depending on human manipulation
- **Physical attacks**: Physical device access
- **Brute force**: Brute force attacks on passwords
- **Missing security headers**: Missing security headers without exploitation demonstration
- **Clickjacking**: On pages without sensitive actions
- **Content spoofing**: Without practical impact demonstration

### 🏆 Recognition

For valid security contributions, we offer:

- **Public credit**: Your name in SECURITY.md and changelog
- **GitHub Security Advisory**: Official mention
- **Swag**: Stickers or t-shirts (We are analyzing options)
- **Priority**: Prioritized bug fixes

### 📞 Contact Information

- **GitHub Security Advisories**: [Link](https://github.com/misterioso013/sendany/security/advisories/new)
- **Email**: rosielvictor.dev@gmail.com
- **Response time**: 24-48 hours for initial acknowledgment

### 🔐 Security Best Practices

As a SendAny user, you can help maintain security:

#### For Developers
- **Dependencies**: Keep dependencies updated
- **Environment variables**: Never commit secrets
- **Input validation**: Always validate user inputs
- **Authentication**: Use Stack Auth correctly
- **HTTPS**: Always use HTTPS in production

#### For Users
- **Strong passwords**: Use strong passwords for workspaces
- **Sensitive data**: Don't share confidential information
- **Public links**: Be careful with public workspaces
- **Google Drive**: Review permissions regularly

### 📊 Security Measures Implemented

SendAny already implements several security measures:

- **Authentication**: Stack Auth with JWT
- **Password hashing**: bcrypt for workspace passwords
- **Input validation**: Zod schemas for validation
- **File type validation**: File type validation on upload
- **CORS**: Proper CORS configuration
- **SQL parameterization**: Parameterized queries to prevent SQL injection

### 🔄 Security Updates

- **Automatic updates**: Dependencies are updated regularly via Dependabot
- **Security patches**: Security patches are prioritized
- **Disclosure**: Vulnerabilities are disclosed after fixes

### 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Next.js Security](https://nextjs.org/blog/security-nextjs-server-components-actions)

---

**Last updated**: 2025-08-21

Thank you for helping keep SendAny secure! 🔒
