# Backend CORS Configuration Fix Request

## Issue

The mobile app (Android/iOS) built with Capacitor is unable to make API requests to `https://api.lovewaylogistics.com` due to CORS (Cross-Origin Resource Sharing) restrictions.

## Error Messages

The app is receiving the following CORS errors:

```
Access to XMLHttpRequest at 'https://api.lovewaylogistics.com/v1/...'
from origin 'https://localhost' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Required CORS Configuration

### Origins to Allow

The backend needs to allow requests from these origins:

#### Mobile Apps (Development & Production):

1. **Android (Capacitor)**: `https://localhost`
   - Used for both development and production apps from Play Store
2. **iOS (Capacitor)**: `capacitor://localhost`
   - Used for both development and production apps from App Store

#### Web Applications:

3. **Web Development**: `http://localhost:5173` (or your Vite dev server port)
4. **Production Web**: `https://your-production-domain.com` (replace with your actual domain)

**Note**: Capacitor mobile apps use the same origin scheme (`https://localhost` for Android, `capacitor://localhost` for iOS) in both development and production. Apps installed from App Store or Play Store will use these same origins.

### Recommended CORS Headers

The backend should respond with the following headers for all API requests:

```
Access-Control-Allow-Origin: <MUST BE a SINGLE origin value>
Vary: Origin
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Accept-Language
Access-Control-Allow-Credentials: true (if using cookies/auth)
```

**Critical**: Do **NOT** return a comma-separated list in `Access-Control-Allow-Origin`.

- Browsers require **either** `*` **or** a **single** origin.
- Correct implementation is: **echo back** the incoming `Origin` header **if it is in your allowlist**.
- Also send `Vary: Origin` so caches don’t mix responses between origins.

**Important for Production Apps**:

- Apps installed from **App Store** (iOS) and **Play Store** (Android) use the same origins as development
- Android production apps: `https://localhost`
- iOS production apps: `capacitor://localhost`
- These origins work for both development and production mobile apps

### Example Implementation

#### For Express.js (Node.js):

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: [
      "https://localhost", // Android mobile apps (dev & production from Play Store)
      "capacitor://localhost", // iOS mobile apps (dev & production from App Store)
      "http://localhost:5173", // Web development
      "https://your-production-domain.com", // Production web domain
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Accept-Language",
    ],
    credentials: true,
  })
);
```

#### For Django (Python):

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://localhost",  # Android mobile apps (dev & production from Play Store)
    "capacitor://localhost",  # iOS mobile apps (dev & production from App Store)
    "http://localhost:5173",  # Web development
    "https://your-production-domain.com",  # Production web domain
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'accept-language',
]
```

#### For Laravel (PHP):

```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => [
    'https://localhost',
    'capacitor://localhost',
    'http://localhost:5173',
],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

#### For Nginx (Reverse Proxy):

```nginx
# IMPORTANT: Access-Control-Allow-Origin must be ONE value, not a list.
# Use a map to echo only allowed origins.
map $http_origin $cors_origin {
    default "";
    "https://localhost" $http_origin;
    "capacitor://localhost" $http_origin;
    "http://localhost:5173" $http_origin;
    "https://your-production-domain.com" $http_origin;
}

location /api {
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Vary' 'Origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, Accept-Language';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    add_header 'Access-Control-Allow-Origin' $cors_origin always;
    add_header 'Vary' 'Origin' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, Accept-Language';

    proxy_pass http://your-backend-server;
}
```

## Important Notes

1. **Preflight Requests**: The backend must handle `OPTIONS` requests properly (preflight requests) for all endpoints.

2. **Wildcard Consideration**: While `Access-Control-Allow-Origin: *` works, it doesn't allow credentials. For mobile apps with authentication, specific origins must be listed.

3. **Security**: Only allow the origins you actually need. Don't use `*` in production if you're using authentication.

4. **Production Mobile Apps**:

   - Apps from **App Store** and **Play Store** use the same origins as development
   - Android production: `https://localhost`
   - iOS production: `capacitor://localhost`
   - No separate configuration needed for production mobile apps

5. **Testing**: After implementing, test with:
   - Mobile app (Android/iOS) - both development and production builds
   - Web browser (development and production)
   - Postman/curl to verify headers

## Testing the Fix

After the backend is updated, you can test with:

```bash
# Test CORS headers
curl -H "Origin: https://localhost" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS \
     https://api.lovewaylogistics.com/v1/health \
     -v
```

Expected response should include:

```
< Access-Control-Allow-Origin: https://localhost
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Accept-Language
```

## Current API Endpoints Affected

All API endpoints are affected, including:

- `/v1/app-config`
- `/v1/health`
- `/v1/auth/login`
- `/v1/mobile/check-update`
- `/v1/cargo-categories`
- `/v1/website/statistics`
- And all other `/v1/*` endpoints

## Priority

**HIGH** - This is blocking all API communication from the mobile app.

## Contact

If you need any additional information or clarification, please contact the frontend team.

---

**Date**: December 18, 2024  
**Requested By**: Frontend/Mobile Development Team  
**Status**: Pending Backend Implementation
