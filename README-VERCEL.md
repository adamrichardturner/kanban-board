# Vercel Deployment Configuration

## Environment Variables

Set these in your Vercel project settings (https://vercel.com/dashboard -> your-project -> Settings -> Environment Variables):

### Production Environment Variables

```
DATABASE_URL=postgresql://kanban_user:your_password@kanban-db.adamrichardturner.dev:5433/kanban_board
DATABASE_SSL=require
NEXT_PUBLIC_BASE_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

### Development Environment Variables (for local development)

```
DATABASE_URL=postgresql://kanban_user:your_password@kanban-db.adamrichardturner.dev:5433/kanban_board
DATABASE_SSL=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## Steps to Configure Vercel

1. **Push your code to GitHub/GitLab**

   ```bash
   git add .
   git commit -m "Add remote database configuration"
   git push origin main
   ```

2. **Import project to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your repository

3. **Set Environment Variables**
   - In your Vercel project dashboard
   - Go to Settings → Environment Variables
   - Add the variables listed above
   - Make sure to use the production values for Production environment
   - Use preview/development values for Preview/Development environments

4. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - First deployment might take a few minutes

## Database Connection Security

The frontend connects to your Ubuntu server database using:

- **SSL**: Required for secure connections
- **Port 5432**: Standard PostgreSQL port
- **Domain**: kanban-db.adamrichardturner.dev (resolved via Cloudflare)

## Local Development

To develop locally while using the remote database:

1. **Create local environment file**

   ```bash
   cp env.example .env.local
   ```

2. **Edit .env.local with your values**

   ```
   DATABASE_URL=postgresql://kanban_user:your_password@kanban-db.adamrichardturner.dev:5433/kanban_board
   DATABASE_SSL=require
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## Testing the Connection

After deployment, test that Vercel can connect to your database:

1. **Check Vercel Function Logs**
   - Go to Vercel Dashboard → Functions
   - Check for any database connection errors

2. **Test API Endpoints**

   ```bash
   # Test from your local machine
   curl https://your-vercel-app.vercel.app/api/boards
   ```

3. **Monitor Database Connections**
   ```bash
   # On your Ubuntu server
   docker-compose -f docker-compose.prod.yml logs -f postgres
   ```

## Troubleshooting

### Connection Timeout

- Check firewall rules on Ubuntu server
- Verify PostgreSQL is listening on all interfaces
- Ensure Cloudflare DNS is resolving correctly

### SSL Certificate Issues

```bash
# Test SSL connection from Vercel region
openssl s_client -connect kanban-db.adamrichardturner.dev:5432 -starttls postgres
```

### Database Permission Errors

- Verify user has correct permissions
- Check PostgreSQL logs for authentication failures

### Environment Variable Issues

- Double-check variable names in Vercel (case-sensitive)
- Verify variables are set for correct environment (Production/Preview/Development)
