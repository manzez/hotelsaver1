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

interface NewBookingNotificationEmailProps {
  hotelName: string;
  customerName: string;
  checkInDate: string;
  checkOutDate: string;
  bookingId: string;
  propertyId?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  pricePerNight?: number;
  nights?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
}

export const NewBookingNotificationEmail = ({
  hotelName,
  customerName,
  checkInDate,
  checkOutDate,
  bookingId,
  propertyId,
  rooms,
  adults,
  children,
  pricePerNight,
  nights,
  subtotal,
  tax,
  total,
}: NewBookingNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>New Booking Notification: {bookingId}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://hotelsaver.ng/logo.png"
          width="150"
          height="50"
          alt="HotelSaver.ng"
          style={logo}
        />
        <Heading style={heading}>New Booking Notification</Heading>
        <Section>
          <Text style={text}>Dear {hotelName},</Text>
          <Text style={text}>
            You have received a new booking through HotelSaver.ng.
          </Text>
          <Hr style={hr} />
          <Text style={text}>
            <strong>Booking Details:</strong>
          </Text>
          <Text style={text}>
            - Booking ID: {bookingId}
            <br />
            - Hotel: {hotelName}
            {propertyId ? (<><br />- Property ID: {propertyId}</>) : null}
            <br />
            - Customer: {customerName}
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
            Please ensure the room is prepared for the guest's arrival.
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

export default NewBookingNotificationEmail;

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
