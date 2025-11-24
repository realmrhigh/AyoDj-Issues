# Backend Integration Guide

This guide explains how to integrate the AyoDJ issue reporting form with a backend service that creates GitHub issues automatically.

## Overview

The current form uses client-side JavaScript for validation and stores data locally. For production, you need a backend service that:

1. Receives form submissions securely
2. Validates data server-side
3. Creates GitHub issues using the GitHub API
4. Handles errors and rate limiting

## Option 1: Netlify Functions (Recommended)

### Setup

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Create a `netlify/functions` directory in your repository

3. Create `netlify/functions/submit-issue.js`:

```javascript
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        
        // Server-side validation
        if (!data.platform || !data.issueType || !data.title || !data.description) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Create GitHub issue
        const issueTitle = `[${data.platform}] ${data.title}`;
        const issueBody = `## Issue Details

**Platform:** ${data.platform}
**Issue Type:** ${data.issueType}
**App Version:** ${data.appVersion || 'Not provided'}
**Device:** ${data.deviceInfo || 'Not provided'}

## Description

${data.description}

${data.email ? `\n## Contact\n\nEmail: ${data.email}` : ''}

---
*Submitted via AyoDJ Issue Reporting Form*`;

        const response = await fetch('https://api.github.com/repos/realmrhigh/AyoDj-Issues/issues', {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                title: issueTitle,
                body: issueBody,
                labels: ['user-reported', data.issueType.toLowerCase(), data.platform.toLowerCase()]
            })
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const issue = await response.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                issueUrl: issue.html_url 
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
```

4. Create `netlify.toml` in the repository root:

```toml
[build]
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

5. Set environment variable in Netlify dashboard:
   - `GITHUB_TOKEN`: Personal access token with `repo` scope

6. Update `script.js` to call the function:

```javascript
const response = await fetch('/.netlify/functions/submit-issue', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
});
```

## Option 2: Vercel Serverless Functions

### Setup

1. Create `api/submit-issue.js`:

```javascript
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = req.body;
    
    // Validation
    if (!data.platform || !data.issueType || !data.title || !data.description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const issueTitle = `[${data.platform}] ${data.title}`;
        const issueBody = `## Issue Details

**Platform:** ${data.platform}
**Issue Type:** ${data.issueType}
**App Version:** ${data.appVersion || 'Not provided'}
**Device:** ${data.deviceInfo || 'Not provided'}

## Description

${data.description}

${data.email ? `\n## Contact\n\nEmail: ${data.email}` : ''}

---
*Submitted via AyoDJ Issue Reporting Form*`;

        const response = await fetch('https://api.github.com/repos/realmrhigh/AyoDj-Issues/issues', {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                title: issueTitle,
                body: issueBody,
                labels: ['user-reported', data.issueType.toLowerCase(), data.platform.toLowerCase()]
            })
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const issue = await response.json();
        
        res.status(200).json({ 
            success: true, 
            issueUrl: issue.html_url 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
```

2. Set environment variable in Vercel dashboard:
   - `GITHUB_TOKEN`: Personal access token with `repo` scope

3. Update `script.js` to call the API:

```javascript
const response = await fetch('/api/submit-issue', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
});
```

## Option 3: GitHub Actions Workflow

You can also use GitHub Actions to process issues submitted via email or a form submission service.

## Security Considerations

1. **Never expose GitHub token**: Always use environment variables
2. **Rate limiting**: Implement server-side rate limiting
3. **Input validation**: Always validate on the server
4. **CORS**: Configure appropriate CORS headers
5. **Authentication**: Consider adding authentication for sensitive data

## GitHub Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo` (full control of private repositories)
4. Copy token and add to your hosting provider's environment variables

## Testing

Test your backend integration:

```bash
curl -X POST https://your-domain.com/api/submit-issue \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "Android",
    "issueType": "Bug",
    "title": "Test issue",
    "description": "This is a test"
  }'
```

## Labels

The backend automatically adds these labels:
- `user-reported`: All form submissions
- Issue type: `bug`, `audio`, `performance`, `subscription`, `ui`, `feature`, `other`
- Platform: `android`, `ios`, `both`

## Error Handling

The backend should handle:
- Invalid input data
- GitHub API rate limits
- Network errors
- Token expiration

## Monitoring

Set up monitoring for:
- Submission success rate
- GitHub API errors
- Form validation failures
- Rate limit hits
