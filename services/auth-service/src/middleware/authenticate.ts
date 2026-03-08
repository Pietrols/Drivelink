import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, AccessTokenPayload } from "../lib/jwt";
import { redis, redisKeys } from "../lib/redis";
import { Role } from "@drivelink/types";

// Extend Express Request type to include our user payload
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = verifyAccessToken(token);

    // Check token hasn't been blacklisted (e.g. after logout)
    const blacklisted = await redis.get(redisKeys.tokenBlacklist(payload.jti));
    if (blacklisted) {
      res.status(401).json({ message: "Token has been revoked" });
      return;
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ── Role guard — use after authenticate ───────────────────────────────────────

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const hasRole = roles.some((r) => req.user!.roles.includes(r));
    if (!hasRole) {
      res.status(403).json({
        message: `This action requires one of: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
}
