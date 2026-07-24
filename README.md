# GrocyGo Web Application

## Environment Variables Setup

This application uses environment variables to secure sensitive information like API keys. Follow these steps to set up your environment:

### Local Development

1. Create a `.env` file in the root directory of the project
2. Copy the contents from `.env.example` and fill in your actual values
3. Make sure `.env` is in your `.gitignore` file to prevent committing sensitive information

### Vercel Deployment

When deploying to Vercel, you need to add environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable from your `.env` file:
   - REACT_APP_FIREBASE_API_KEY
   - REACT_APP_FIREBASE_AUTH_DOMAIN
   - REACT_APP_FIREBASE_PROJECT_ID
   - REACT_APP_FIREBASE_STORAGE_BUCKET
   - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
   - REACT_APP_FIREBASE_APP_ID
   - REACT_APP_FIREBASE_MEASUREMENT_ID

## Security Best Practices

- Never commit API keys or sensitive information to your repository
- Use environment variables for all sensitive configuration
- Regularly rotate your API keys and update your environment variables
- Set up proper authentication and authorization in your Firebase project
- Consider using Firebase App Check to prevent unauthorized API usage

## Additional Security Measures

### Content Security Policy

Consider adding a Content Security Policy to restrict which resources can be loaded by your application. This can be done by adding a `meta` tag to your `index.html` file or by configuring your server to send the appropriate headers.

### API Key Restrictions

In the Firebase console, you can restrict your API keys to only work from specific domains. This prevents unauthorized use of your API keys even if they are exposed.

1. Go to the Firebase console
2. Navigate to Project Settings > API keys
3. Add domain restrictions for your Vercel deployment URL