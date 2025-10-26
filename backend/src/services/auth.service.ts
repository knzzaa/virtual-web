import bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput, AuthResponse } from '../dtos/auth.dto';
import { ConflictException, UnauthorizedException } from '../utils/exceptions';

/**
 * Register a new user
 */
export async function register(input: RegisterInput): Promise<AuthResponse & { token: string }> {
  const { email, password, name } = input;

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    throw new ConflictException('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      name,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    });

  // Generate JWT token
  const token = await generateToken({
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
  });

  return {
    message: 'User registered successfully',
    user: newUser,
    token,
  };
}

/**
 * Login user
 */
export async function login(input: LoginInput): Promise<AuthResponse & { token: string }> {
  const { email, password } = input;

  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Generate JWT token
  const token = await generateToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  return {
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    token,
  };
}
