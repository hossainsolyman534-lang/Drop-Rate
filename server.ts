import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Meta OAuth: Get Auth URL
  app.get("/api/auth/meta/url", (req, res) => {
    const clientId = process.env.META_CLIENT_ID;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/api/auth/meta/callback`;
    
    if (!clientId) {
      return res.status(500).json({ error: "META_CLIENT_ID is not configured" });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "ads_read,ads_management",
      response_type: "code",
      display: "popup"
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // Meta API Proxy: Get Ad Accounts
  app.get("/api/meta/adaccounts", async (req, res) => {
    const { accessToken } = req.query;
    if (!accessToken) return res.status(401).send("No access token");

    try {
      const response = await axios.get("https://graph.facebook.com/v18.0/me/adaccounts", {
        params: {
          access_token: accessToken,
          fields: "name,account_id"
        }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json(error.response?.data || { error: "Failed to fetch ad accounts" });
    }
  });

  // Meta API Proxy: Get Campaigns
  app.get("/api/meta/campaigns", async (req, res) => {
    const { accessToken, adAccountId } = req.query;
    if (!accessToken || !adAccountId) return res.status(400).send("Missing parameters");

    try {
      const response = await axios.get(`https://graph.facebook.com/v18.0/act_${adAccountId}/campaigns`, {
        params: {
          access_token: accessToken,
          fields: "name,id,status",
          limit: 50
        }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json(error.response?.data || { error: "Failed to fetch campaigns" });
    }
  });

  // Meta API Proxy: Get Insights
  app.get("/api/meta/insights", async (req, res) => {
    const { accessToken, objectId, dateRange } = req.query;
    if (!accessToken || !objectId) return res.status(400).send("Missing parameters");

    // dateRange expected as { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
    let timeRange = "";
    if (dateRange) {
      try {
        const dr = JSON.parse(dateRange as string);
        timeRange = JSON.stringify({ since: dr.from, until: dr.to });
      } catch (e) {}
    }

    try {
      const response = await axios.get(`https://graph.facebook.com/v18.0/${objectId}/insights`, {
        params: {
          access_token: accessToken,
          level: "campaign",
          fields: "impressions,inline_link_clicks,actions",
          time_range: timeRange || undefined,
          date_preset: timeRange ? undefined : "last_30d"
        }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json(error.response?.data || { error: "Failed to fetch insights" });
    }
  });

  // Meta OAuth: Callback
  app.get("/api/auth/meta/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.META_CLIENT_ID;
    const clientSecret = process.env.META_CLIENT_SECRET;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/api/auth/meta/callback`;

    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      const response = await axios.get("https://graph.facebook.com/v18.0/oauth/access_token", {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      const { access_token } = response.data;

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'META_AUTH_SUCCESS', 
                  accessToken: '${access_token}' 
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Meta OAuth Error:", error.response?.data || error.message);
      res.status(500).send("Failed to exchange code for token");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
