import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface HotelBookingConfirmationEmailProps {
  customerName: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  bookingId: string;
  city?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  pricePerNight?: number;
  nights?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
}

export const HotelBookingConfirmationEmail = ({
  customerName,
  hotelName,
  checkInDate,
  checkOutDate,
  bookingId,
  city,
  rooms,
  adults,
  children,
  pricePerNight,
  nights,
  subtotal,
  tax,
  total,
}: HotelBookingConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your booking at {hotelName} is confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://hotelsaver.ng/logo.png"
          width="150"
          height="50"
          alt="HotelSaver.ng"
          style={logo}
        />
        <Heading style={heading}>Your Booking is Confirmed!</Heading>
        <Section>
          <Text style={text}>Dear {customerName},</Text>
          <Text style={text}>
            Thank you for booking with HotelSaver.ng. Your reservation at{" "}
            <strong>{hotelName}</strong> is confirmed.
          </Text>
          <Hr style={hr} />
          <Text style={text}>
            <strong>Booking Details:</strong>
          </Text>
          <Text style={text}>
            - Booking ID: {bookingId}
            <br />
            - Hotel: {hotelName}{city ? `, ${city}` : ''}
            <br />
            - Check-in: {checkInDate}
            <br />
            - Check-out: {checkOutDate}
            {typeof rooms === 'number' && (
              <>
                <br />- Rooms: {rooms}
              </>
            )}
            {typeof adults === 'number' && (
              <>
                <br />- Adults: {adults}
              </>
            )}
            {typeof children === 'number' && (
              <>
                <br />- Children: {children}
              </>
            )}
          </Text>
          {(pricePerNight || subtotal || tax || total) && (
            <>
              <Hr style={hr} />
              <Text style={text}>
                <strong>Pricing:</strong>
              </Text>
              <Text style={text}>
                {typeof pricePerNight === 'number' && (
                  <>- Rate per night: ₦{Math.round(pricePerNight).toLocaleString()}<br /></>
                )}
                {typeof nights === 'number' && (
                  <>- Nights: {nights}<br /></>
                )}
                {typeof subtotal === 'number' && (
                  <>- Subtotal: ₦{Math.round(subtotal).toLocaleString()}<br /></>
                )}
                {typeof tax === 'number' && (
                  <>- VAT (7.5%): ₦{Math.round(tax).toLocaleString()}<br /></>
                )}
                {typeof total === 'number' && (
                  <>- Total: ₦{Math.round(total).toLocaleString()}<br /></>
                )}
              </Text>
            </>
          )}
          <Hr style={hr} />
          <Text style={text}>
            For changes or assistance, reply to this email or chat with us on WhatsApp: https://wa.me/2347077775545
          </Text>
          <Text style={text}>
            Best regards,
            <br />
            The HotelSaver.ng Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default HotelBookingConfirmationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const logo = {
  margin: "0 auto",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  marginTop: "48px",
  textAlign: "center" as const,
};

const text = {
  ...heading,
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};
