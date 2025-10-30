import { NextRequest, NextResponse } from 'next/server'

// Demo admin users - in production, store in database with hashed passwords
const adminUsers = [
  {
    id: '1',
    email: 'admin@hotelsaver.ng',
    password: 'admin123', // In production, hash this password
    name: 'Admin User',
    role: 'super-admin'
  },
  {
    id: '2', 
    email: 'manager@hotelsaver.ng',
    password: 'manager123',
    name: 'Hotel Manager',
    role: 'manager'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = adminUsers.find(u => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64')

    // Set cookie for server-side validation
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}