
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";

const router = Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required.",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is missing from Backend/.env");

      return res.status(500).json({
        message: "Google authentication is not configured.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({
        message: "Google email is not verified.",
      });
    }

    return res.json({
      user: {
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        picture: payload.picture || "",
      },
    });
  } catch (error) {
    console.error("Google token verification failed:", error.message);

    return res.status(401).json({
      message: "Google sign-in verification failed. Please try again.",
    });
  }
});

export default router;
