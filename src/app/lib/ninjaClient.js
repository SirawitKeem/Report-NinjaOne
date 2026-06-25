// lib/ninjaClient.js
import { cookies, headers } from 'next/headers';
import { AsyncLocalStorage } from 'async_hooks';

const BASE_URL = "https://oc.ninjarmm.com";
const CACHE_TTL_MS = 30000; // 30 seconds cache for identical requests

// 1. Request-scoped context storage for background executions (schedulers / POST triggers)
export const orgStorage = new AsyncLocalStorage();

// Helper to determine active organization key (officemate / tracthai)
export async function getActiveOrg() {
  // Check Node async context store first
  const storedOrg = orgStorage.getStore();
  if (storedOrg === 'officemate' || storedOrg === 'tracthai') {
    return storedOrg;
  }

  // Check request headers injected by middleware
  try {
    const headerStore = await headers();
    const orgHeader = headerStore.get('x-active-org');
    if (orgHeader === 'officemate' || orgHeader === 'tracthai') {
      return orgHeader;
    }
  } catch (e) {
    // headers() throws if called outside of request context (e.g. during build)
  }

  // Check request cookies fallback
  try {
    const cookieStore = await cookies();
    const orgCookie = cookieStore.get('active_org')?.value;
    if (orgCookie === 'officemate' || orgCookie === 'tracthai') {
      return orgCookie;
    }
  } catch (e) {
    // cookies() throws if called outside of request context
  }

  return 'officemate';
}

// 2. Token and cache state isolated by organization to prevent crosstalk/data leak
const orgCacheStates = {
  officemate: {
    cachedToken: null,
    tokenExpiresAt: 0,
    tokenPromise: null,
    responseCache: new Map(),
    inflightPromises: new Map(),
  },
  tracthai: {
    cachedToken: null,
    tokenExpiresAt: 0,
    tokenPromise: null,
    responseCache: new Map(),
    inflightPromises: new Map(),
  }
};

function getCacheState(org) {
  if (!orgCacheStates[org]) {
    orgCacheStates[org] = {
      cachedToken: null,
      tokenExpiresAt: 0,
      tokenPromise: null,
      responseCache: new Map(),
      inflightPromises: new Map(),
    };
  }
  return orgCacheStates[org];
}

export async function getAccessToken() {
  const activeOrg = await getActiveOrg();
  const state = getCacheState(activeOrg);
  const now = Date.now();

  // If token is cached and not expired, reuse it
  if (state.cachedToken && now < state.tokenExpiresAt) {
    return state.cachedToken;
  }

  // If there is already a token fetch in progress, reuse the same promise
  if (state.tokenPromise) {
    return state.tokenPromise;
  }

  // Resolve client credentials dynamically based on organization context
  let clientId, clientSecret;
  if (activeOrg === 'tracthai') {
    clientId = process.env.NINJA_CLIENT_ID_TRACTHAI;
    clientSecret = process.env.NINJA_CLIENT_SECRET_TRACTHAI;
  } else {
    // Default to OfficeMate with fallback to root credentials
    clientId = process.env.NINJA_CLIENT_ID_OFFICEMATE || process.env.NINJA_CLIENT_ID;
    clientSecret = process.env.NINJA_CLIENT_SECRET_OFFICEMATE || process.env.NINJA_CLIENT_SECRET;
  }

  if (!clientId || !clientSecret || clientId.includes("YOUR_") || clientSecret.includes("YOUR_")) {
    throw new Error(`Missing NinjaRMM Client ID or Secret for organization "${activeOrg}" in .env file. Please check your environment variables.`);
  }

  state.tokenPromise = (async () => {
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
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
        console.error(`Ninja API Token Error Details (${activeOrg}):`, errorDetails);
        throw new Error(`Failed to get Ninja Token for ${activeOrg}: ${response.status} ${response.statusText} -> ${errorDetails}`);
      }

      const data = await response.json();
      state.cachedToken = data.access_token;
      
      // Expire 1 minute early to be safe (expires_in is usually 3600 seconds)
      const expiresInMs = (data.expires_in || 3600) * 1000;
      state.tokenExpiresAt = Date.now() + expiresInMs - 60000;

      return state.cachedToken;
    } finally {
      // Clear the inflight token promise so it can fetch again if token expires in future
      state.tokenPromise = null;
    }
  })();

  return state.tokenPromise;
}

export async function fetchFromNinja(endpoint, options = {}) {
  const activeOrg = await getActiveOrg();
  const state = getCacheState(activeOrg);

  // Only cache GET requests
  const isCacheable = !options.method || options.method === "GET";
  
  if (isCacheable) {
    // 1. Check if we have a fully resolved, valid cache entry
    const cached = state.responseCache.get(endpoint);
    const now = Date.now();
    if (cached && now < cached.expiresAt) {
      return cached.data;
    }

    // 2. Check if there is an inflight promise for this endpoint
    if (state.inflightPromises.has(endpoint)) {
      return state.inflightPromises.get(endpoint);
    }
  }

  // Helper to perform fetch
  const doFetch = async (useCachedToken = true) => {
    let token;
    if (useCachedToken) {
      token = await getAccessToken();
    } else {
      // Force token refresh
      state.cachedToken = null;
      state.tokenExpiresAt = 0;
      state.tokenPromise = null;
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
          console.warn(`[Ninja Client - ${activeOrg}] Auth failure on ${endpoint}. Clearing token and retrying...`);
          response = await doFetch(false);
          
          if (!response.ok) {
            errorText = await response.text();
            console.error(`Ninja API Fetch Error (after retry) on ${endpoint} (${activeOrg}):`, errorText);
            throw new Error(`Ninja API Error on ${endpoint} for ${activeOrg}: ${response.status} ${response.statusText} -> ${errorText}`);
          }
        } else {
          console.error(`Ninja API Fetch Error on ${endpoint} (${activeOrg}):`, errorText);
          throw new Error(`Ninja API Error on ${endpoint} for ${activeOrg}: ${response.status} ${response.statusText} -> ${errorText}`);
        }
      }
      
      const data = await response.json();

      if (isCacheable) {
        // Save the resolved data in the response cache
        state.responseCache.set(endpoint, {
          data,
          expiresAt: Date.now() + CACHE_TTL_MS
        });
      }

      return data;
    } finally {
      if (isCacheable) {
        // Clean up inflight promise map
        state.inflightPromises.delete(endpoint);
      }
    }
  })();

  if (isCacheable) {
    state.inflightPromises.set(endpoint, fetchPromise);
  }

  return fetchPromise;
}