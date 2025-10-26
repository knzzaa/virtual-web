import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define the configuration schema
const configSchema = z.object({
  // Server configuration
  port: z.coerce.number().int().positive().default(3000),
  nodeEnv: z.enum(["development", "production", "test"]).default("development"),

  // Database configuration
  database: z.object({
    url: z.string(),
  }),

  // JWT configuration
  jwt: z.object({
    secret: z
      .string()
      .min(32, "JWT secret must be at least 32 characters for security"),
    expiresIn: z.string().default("7d"),
  }),

  // Frontend URL for CORS
  frontendUrl: z.url(),
});

// Parse and validate environment variables
const parseConfig = () => {
  const rawConfig = {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    database: {
      url: process.env.DB_URL,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    frontendUrl: process.env.FRONTEND_URL,
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid configuration:");
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Export validated configuration
export const config = parseConfig();

// Export the configuration type
export type Config = z.infer<typeof configSchema>;
