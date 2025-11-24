# AyoDJ Issue Reporting Page

A public-facing, simplified, and secure web form for reporting issues with the AyoDJ professional DJ turntable and scratch emulator app.

## Features

### 🔒 Security
- **Input sanitization**: Removes potential XSS vectors from all user inputs
- **Honeypot field**: Hidden field to catch spam bots
- **Rate limiting**: Prevents spam by limiting submissions to one per minute
- **Email validation**: Ensures valid email format when provided
- **CORS-safe**: No external scripts or dependencies

### 📝 User-Friendly
- **Platform-specific fields**: Android, iOS, or both
- **Issue categorization**: Bug, Audio, Performance, Subscription, UI, Feature Request, Other
- **Optional fields**: Version, device info, and contact email
- **Character counters**: Visual feedback for text inputs
- **Responsive design**: Works on all devices
- **Clear validation**: Real-time feedback on form inputs

### 🎨 Design
- Modern, clean interface with AyoDJ branding
- Gradient theme matching professional DJ aesthetic
- Mobile-responsive layout
- Accessible form elements

## Deployment

### GitHub Pages (Recommended)

1. Enable GitHub Pages in repository settings
2. Select the main/master branch as the source
3. The form will be available at: `https://realmrhigh.github.io/AyoDj-Issues/`

### Manual Hosting

Simply upload `index.html`, `styles.css`, and `script.js` to any web server.

## Backend Integration

The current implementation stores issues locally in the browser's localStorage for demonstration. For production use, you'll need to integrate with a backend that creates GitHub issues.

See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) for detailed instructions on:
- Setting up a serverless function (Netlify, Vercel, AWS Lambda)
- Configuring GitHub API authentication
- Creating issues programmatically

## Files

- `index.html` - Main HTML form
- `styles.css` - Styling and responsive design
- `script.js` - Form validation, security, and submission handling
- `BACKEND_INTEGRATION.md` - Guide for backend setup
- `README.md` - This file

## Security Features

1. **XSS Prevention**: Sanitizes all user inputs to prevent script injection
2. **Spam Protection**: Honeypot field catches automated bots
3. **Rate Limiting**: Client-side rate limiting (1 submission per minute)
4. **Email Validation**: Validates email format when provided
5. **No External Dependencies**: All code is self-contained, no CDN dependencies

## Usage for Users

1. Visit the issue reporting page
2. Select your platform (Android/iOS)
3. Choose the issue type
4. Fill in the issue details
5. Optionally provide version, device info, and email
6. Submit the form

## Customization

### Colors
Edit the gradient colors in `styles.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Form Fields
Add or modify fields in `index.html` and update the submission handler in `script.js`.

### Rate Limit
Change the rate limit duration in `script.js`:
```javascript
const RATE_LIMIT_MS = 60000; // milliseconds
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

This issue reporting system is part of the AyoDJ Issues repository.
