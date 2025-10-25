import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import InstagramProvider from 'next-auth/providers/instagram'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const useDb = !!process.env.DATABASE_URL
const emailFrom = process.env.EMAIL_FROM || 'HotelSaver.ng <no-reply@hotelsaver.ng>'

const handler = NextAuth({
  // Attach Prisma adapter only when a database is configured
  ...(useDb ? { adapter: PrismaAdapter(prisma) } : {}),
  providers: [
    // Only enable Google when real credentials are provided (not demo placeholders)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
      !String(process.env.GOOGLE_CLIENT_ID).startsWith('demo-') &&
      !String(process.env.GOOGLE_CLIENT_SECRET).startsWith('demo-')
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET
      ? [
          InstagramProvider({
            clientId: process.env.INSTAGRAM_CLIENT_ID,
            clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
          }),
        ]
      : []),
    // Email magic links require a database (VerificationToken storage)
    ...(useDb
      ? [
          EmailProvider({
            from: emailFrom,
            // 24 hours by default
            maxAge: 24 * 60 * 60,
            async sendVerificationRequest({ identifier, url }) {
              const apiKey = process.env.RESEND_API_KEY
              const resend = apiKey ? new Resend(apiKey) : null
              const subject = 'Sign in to HotelSaver.ng'
              const html = `
                <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.55; color:#111;">
                  <h2 style="margin:0 0 12px;">Sign in to HotelSaver.ng</h2>
                  <p style="margin:0 0 12px;">Click the button below to sign in.</p>
                  <p style="margin:16px 0;"><a href="${url}" style="display:inline-block; background:#009739; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Sign in</a></p>
                  <p style="margin:12px 0; font-size:12px; color:#555;">If the button doesn't work, copy and paste this link: <br/><span style="word-break:break-all;">${url}</span></p>
                </div>`
              if (!resend) {
                console.log('[nextauth:email:dry-run]', { to: identifier, url })
                return
              }
              try {
                await resend.emails.send({ from: emailFrom, to: identifier, subject, html })
              } catch (err) {
                console.error('[nextauth:email:send:error]', err)
                throw err
              }
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ user, token }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }