// lib/ninjaClient.js
const CLIENT_ID = process.env.NINJA_CLIENT_ID;
const CLIENT_SECRET = process.env.NINJA_CLIENT_SECRET;
const BASE_URL = "https://oc.ninjarmm.com";

// Cache variables
let cachedToken = null;
let tokenExpiresAt = 0;
let tokenPromise = null; // Share inflight token request

const responseCache = new Map();
const inflightPromises = new Map(); // Share inflight endpoint requests
const CACHE_TTL_MS = 30000; // 30 seconds cache for identical requests

export async function getAccessToken() {
  const now = Date.now();
  // If token is cached and not expired, reuse it
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  // If there is already a token fetch in progress, reuse the same promise
  if (tokenPromise) {
    return tokenPromise;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing NinjaRMM Client ID or Secret in .env file. Please check your environment variables.");
  }

  tokenPromise = (async () => {
    try {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "monitoring",
      });

      const response = await fetch(`${BASE_URL}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Ninja API Token Error Details:", errorDetails);
        throw new Error(`Failed to get Ninja Token: ${response.status} ${response.statusText} -> ${errorDetails}`);
      }

      const data = await response.json();
      cachedToken = data.access_token;
      
      // Expire 1 minute early to be safe (expires_in is usually 3600 seconds)
      const expiresInMs = (data.expires_in || 3600) * 1000;
      tokenExpiresAt = Date.now() + expiresInMs - 60000;

      return cachedToken;
    } finally {
      // Clear the inflight token promise so it can fetch again if token expires in future
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}

export async function fetchFromNinja(endpoint, options = {}) {
  // Only cache GET requests
  const isCacheable = !options.method || options.method === "GET";
  
  if (isCacheable) {
    // 1. Check if we have a fully resolved, valid cache entry
    const cached = responseCache.get(endpoint);
    const now = Date.now();
    if (cached && now < cached.expiresAt) {
      return cached.data;
    }

    // 2. Check if there is an inflight promise for this endpoint
    if (inflightPromises.has(endpoint)) {
      return inflightPromises.get(endpoint);
    }
  }

  // Helper to perform fetch
  const doFetch = async (useCachedToken = true) => {
    let token;
    if (useCachedToken) {
      token = await getAccessToken();
    } else {
      // Force token refresh
      cachedToken = null;
      tokenExpiresAt = 0;
      tokenPromise = null;
      token = await getAccessToken();
    }

    return await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  };

  // Create the promise for this fetch
  const fetchPromise = (async () => {
    try {
      let response = await doFetch(true);

      if (!response.ok) {
        let errorText = await response.text();
        
        // If unauthorized or token error, clear cached token and retry once with a fresh token
        if (response.status === 401 || errorText.includes("not_authenticated") || errorText.includes("invalid_token")) {
          console.warn(`[Ninja Client] Auth failure on ${endpoint}. Clearing token and retrying...`);
          response = await doFetch(false);
          
          if (!response.ok) {
            errorText = await response.text();
            console.error(`Ninja API Fetch Error (after retry) on ${endpoint}:`, errorText);
            throw new Error(`Ninja API Error on ${endpoint}: ${response.status} ${response.statusText} -> ${errorText}`);
          }
        } else {
          console.error(`Ninja API Fetch Error on ${endpoint}:`, errorText);
          throw new Error(`Ninja API Error on ${endpoint}: ${response.status} ${response.statusText} -> ${errorText}`);
        }
      }
      
      const data = await response.json();

      if (isCacheable) {
        // Save the resolved data in the response cache
        responseCache.set(endpoint, {
          data,
          expiresAt: Date.now() + CACHE_TTL_MS
        });
      }

      return data;
    } finally {
      if (isCacheable) {
        // Clean up inflight promise map
        inflightPromises.delete(endpoint);
      }
    }
  })();

  if (isCacheable) {
    inflightPromises.set(endpoint, fetchPromise);
  }

  return fetchPromise;
}