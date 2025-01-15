import { NextResponse } from 'next/server';
import { findUser, upsertUser, updateUserProfile, deleteUser } from '@/lib/services/users';

// GET /api/users?address=0x...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  const user = findUser(address);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

// POST /api/users
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { evmAddress, starknetAddress, name, twitter } = body;

    if (!evmAddress && !starknetAddress) {
      return NextResponse.json(
        { error: 'Either evmAddress or starknetAddress is required' },
        { status: 400 }
      );
    }

    const user = upsertUser({ evmAddress, starknetAddress, name, twitter });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users?address=0x...
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, twitter } = body;

    const user = updateUserProfile(address, { name, twitter });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/users?address=0x...
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  const success = deleteUser(address);
  if (!success) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
} 