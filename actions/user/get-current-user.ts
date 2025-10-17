'use server';

import { cookies } from 'next/headers';
import { retrieveUserBySessionToken } from './retrieve';
import { UserInterface } from '@/modules/user/user';

export async function getCurrentUser(): Promise<UserInterface | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) {
    return null;
  }

  const user = await retrieveUserBySessionToken(sessionToken);
  return user;
}
