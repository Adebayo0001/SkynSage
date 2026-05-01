# Deploying Lagos Midnight to Vercel

This guide explains how to deploy your application to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account.
2. The [Vercel CLI](https://vercel.com/download) installed (optional, but recommended).
3. Your code pushed to a GitHub, GitLab, or Bitbucket repository.

## Deployment Steps

### Option 1: Vercel Dashboard (Recommended)

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project**.
3. Import your repository.
4. Vercel should automatically detect **Vite** as the framework.
5. **Environment Variables**:
   - If your app uses any environment variables (like `GEMINI_API_KEY`), make sure to add them in the **Environment Variables** section during setup.
6. Click **Deploy**.

### Option 2: Vercel CLI

1. Open your terminal in the project root.
2. Run `vercel`.
3. Follow the prompts to log in and set up the project.
4. If asked about the build command and output directory, the defaults for Vite (`npm run build` and `dist`) should work.

## Configuration Details

We have added a `vercel.json` file to your project. This file handles:
- **SPA Routing**: Ensures that all routes redirect to `index.html`, allowing React Router or custom routing logic to function correctly after deployment.

## Environment Variables

Ensure the following environment variables are set in your Vercel project settings:
- `GEMINI_API_KEY`: (If you are using AI features) Your Google Gemini API key.
- `VITE_APP_URL`: Set this to your production Vercel URL (e.g., `https://your-app.vercel.app`).

## Troubleshooting

- **Missing Files**: Ensure `firebase-applet-config.json` is included in your repository, as it is required for Firebase initialization.
- **Port Settings**: Vercel handles ports automatically; you do not need to Worry about the `--port=3000` setting used in development.
