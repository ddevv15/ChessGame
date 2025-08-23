# Security Policy

## Supported Versions

The following table shows which versions of the Chess Game project are actively supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ :white_check_mark: |
| < 1.0   | ❌ :x:                |

*(Only the latest stable release is supported. Older versions will not receive security updates.)*

---

## Reporting a Vulnerability

We take the security of this project seriously. If you discover a vulnerability, please follow the steps below:

1. **Do not open a public GitHub issue.**  
   Security issues should be reported privately to prevent exploitation before a fix is released.

2. **How to report:**  
   - Email: [security@yourdomain.com] (replace with your contact email if you’d like)  
   - Or use GitHub’s [private security advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing) feature.

3. **What to include:**  
   - A clear description of the vulnerability  
   - Steps to reproduce the issue (if possible)  
   - Potential impact on the application (e.g., data leakage, AI misuse, game state manipulation)

4. **Response timeline:**  
   - Acknowledgment within **48 hours**  
   - Initial assessment within **5 business days**  
   - A fix or mitigation will be prioritized and communicated depending on severity

---

## Security Notes

- This project is a **React client-side application**; it does not store sensitive data.  
- Since it integrates with **AI APIs (e.g., Google Gemini)**, please handle API keys securely:  
  - Do not hardcode API keys into the repo.  
  - Use environment variables or secret managers.  
  - Restrict API keys to specific domains and rate limits.  
- Users deploying this app should secure their hosting environment and avoid exposing build artifacts with sensitive data.

---

## Responsible Disclosure

If you responsibly disclose a vulnerability, you will receive credit in the release notes once the fix is deployed.  
We appreciate contributions from the community to help keep this project safe and enjoyable for everyone.

---
