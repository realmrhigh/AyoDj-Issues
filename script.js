// Security and Validation
const RATE_LIMIT_KEY = 'ayodj_last_submission';
const RATE_LIMIT_MS = 60000; // 1 minute between submissions

// Character counters
function setupCharacterCounters() {
    const titleInput = document.getElementById('title');
    const descInput = document.getElementById('description');
    const titleCounter = document.getElementById('titleCounter');
    const descCounter = document.getElementById('descCounter');

    titleInput.addEventListener('input', function() {
        const length = this.value.length;
        const max = this.maxLength;
        titleCounter.textContent = `${length}/${max} characters`;
        
        titleCounter.classList.remove('warning', 'danger');
        if (length > max * 0.9) {
            titleCounter.classList.add('danger');
        } else if (length > max * 0.75) {
            titleCounter.classList.add('warning');
        }
    });

    descInput.addEventListener('input', function() {
        const length = this.value.length;
        const max = this.maxLength;
        descCounter.textContent = `${length}/${max} characters`;
        
        descCounter.classList.remove('warning', 'danger');
        if (length > max * 0.9) {
            descCounter.classList.add('danger');
        } else if (length > max * 0.75) {
            descCounter.classList.add('warning');
        }
    });
}

// Input sanitization
function sanitizeInput(input) {
    // Remove potential XSS vectors
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim();
}

// Email validation
function isValidEmail(email) {
    if (!email) return true; // Email is optional
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Rate limiting check
function canSubmit() {
    const lastSubmission = localStorage.getItem(RATE_LIMIT_KEY);
    if (!lastSubmission) return true;
    
    const timeSince = Date.now() - parseInt(lastSubmission, 10);
    return timeSince > RATE_LIMIT_MS;
}

// Update rate limit
function updateRateLimit() {
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
}

// Show message
function showMessage(type, element) {
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Form submission handler
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    
    // Hide previous messages
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
    
    // Honeypot check (spam prevention)
    const honeypot = document.getElementById('website');
    if (honeypot.value) {
        console.log('Spam detected');
        return false;
    }
    
    // Rate limiting check
    if (!canSubmit()) {
        errorMsg.textContent = '⏱️ Please wait a minute before submitting another issue.';
        showMessage('error', errorMsg);
        return false;
    }
    
    // Get form data
    const formData = {
        platform: sanitizeInput(form.platform.value),
        issueType: sanitizeInput(form.issueType.value),
        appVersion: sanitizeInput(form.appVersion.value),
        deviceInfo: sanitizeInput(form.deviceInfo.value),
        title: sanitizeInput(form.title.value),
        description: sanitizeInput(form.description.value),
        email: form.email.value.trim(),
        timestamp: new Date().toISOString()
    };
    
    // Validate required fields
    if (!formData.platform || !formData.issueType || !formData.title || !formData.description) {
        errorMsg.textContent = '✗ Please fill in all required fields.';
        showMessage('error', errorMsg);
        return false;
    }
    
    // Validate email if provided
    if (formData.email && !isValidEmail(formData.email)) {
        errorMsg.textContent = '✗ Please enter a valid email address.';
        showMessage('error', errorMsg);
        return false;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    try {
        // Format the issue for GitHub
        const issueTitle = `[${formData.platform}] ${formData.title}`;
        const issueBody = formatIssueBody(formData);
        
        // In a production environment, this would submit to a backend API
        // that creates a GitHub issue using the GitHub API with proper authentication
        
        // For now, we'll simulate the submission and provide instructions
        console.log('Issue data:', {
            title: issueTitle,
            body: issueBody
        });
        
        // Store locally for demonstration (in production, this would go to a backend)
        storeIssueLocally(formData);
        
        // Update rate limit
        updateRateLimit();
        
        // Show success message
        successMsg.textContent = '✓ Thank you! Your issue has been recorded. We\'ll review it soon.';
        showMessage('success', successMsg);
        
        // Reset form
        form.reset();
        document.getElementById('titleCounter').textContent = '0/200 characters';
        document.getElementById('descCounter').textContent = '0/2000 characters';
        
    } catch (error) {
        console.error('Submission error:', error);
        errorMsg.textContent = '✗ Oops! Something went wrong. Please try again or contact support directly.';
        showMessage('error', errorMsg);
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
    
    return false;
}

// Format issue body for GitHub
function formatIssueBody(data) {
    return `## Issue Details

**Platform:** ${data.platform}
**Issue Type:** ${data.issueType}
**App Version:** ${data.appVersion || 'Not provided'}
**Device:** ${data.deviceInfo || 'Not provided'}

## Description

${data.description}

${data.email ? `\n## Contact\n\nEmail: ${data.email}` : ''}

---
*Submitted via AyoDJ Issue Reporting Form on ${new Date(data.timestamp).toLocaleString()}*
`;
}

// Store issue locally (for demonstration)
function storeIssueLocally(data) {
    const issues = JSON.parse(localStorage.getItem('ayodj_issues') || '[]');
    issues.push(data);
    // Keep only last 10 issues
    if (issues.length > 10) {
        issues.shift();
    }
    localStorage.setItem('ayodj_issues', JSON.stringify(issues));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupCharacterCounters();
    
    const form = document.getElementById('issueForm');
    form.addEventListener('submit', handleSubmit);
    
    // Log stored issues in console for demonstration
    const storedIssues = localStorage.getItem('ayodj_issues');
    if (storedIssues) {
        console.log('Locally stored issues:', JSON.parse(storedIssues));
    }
});
