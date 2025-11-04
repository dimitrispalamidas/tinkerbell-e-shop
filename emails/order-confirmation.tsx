import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  customerEmail: string;
  orderCode: string;
  total: number;
  items: OrderItem[];
  boxnowTrackingCode?: string;
  boxnowLockerAddress?: string;
}

export const OrderConfirmationEmail = ({
  customerName = 'Πελάτη',
  customerEmail = 'customer@example.com',
  orderCode = '123456789',
  total = 0,
  items = [],
  boxnowTrackingCode,
  boxnowLockerAddress,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Η παραγγελία σας #{orderCode} επιβεβαιώθηκε - Tinkerbell</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>
          <Img
            src="https://tinkerbell-e-shop.vercel.app/logo.webp"
            width="80"
            height="80"
            alt="Tinkerbell"
            style={logo}
          />
          <Heading style={h1}>Tinkerbell</Heading>
          <Text style={tagline}>Παιδικά & Εφηβικά Ρούχα</Text>
        </Section>

        {/* Success Message */}
        <Section style={successSection}>
          <Text style={successIcon}>✓</Text>
          <Heading style={h2}>Επιτυχής Παραγγελία!</Heading>
          <Text style={paragraph}>
            Ευχαριστούμε <strong>{customerName}</strong> για την παραγγελία σας!
          </Text>
        </Section>

        {/* Order Details */}
        <Section style={orderDetails}>
          <Text style={detailTitle}>Κωδικός Παραγγελίας</Text>
          <Text style={detailValue}>{orderCode}</Text>
          
          <Hr style={hr} />
          
          <Text style={detailTitle}>Email</Text>
          <Text style={detailValue}>{customerEmail}</Text>
        </Section>

        {/* Order Items */}
        <Section style={itemsSection}>
          <Heading as="h3" style={h3}>
            Προϊόντα Παραγγελίας
          </Heading>
          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <td style={itemDetails}>
                <Text style={itemName}>{item.product_name}</Text>
                {item.size && item.color && (
                  <Text style={itemVariant}>
                    Μέγεθος: {item.size} • Χρώμα: {item.color}
                  </Text>
                )}
                <Text style={itemQuantity}>Ποσότητα: {item.quantity}</Text>
              </td>
              <td style={itemPrice}>
                <Text style={priceText}>€{(item.price * item.quantity).toFixed(2)}</Text>
              </td>
            </Row>
          ))}
          
          <Hr style={hr} />
          
          <Row style={totalRow}>
            <td>
              <Text style={totalLabel}>Σύνολο</Text>
            </td>
            <td>
              <Text style={totalAmount}>€{total.toFixed(2)}</Text>
            </td>
          </Row>
        </Section>

        {/* BOXNOW Tracking */}
        {boxnowTrackingCode && (
          <Section style={trackingSection}>
            <Heading as="h3" style={h3}>
              📦 Παράδοση BOXNOW
            </Heading>
            <Text style={paragraph}>
              <strong>Κωδικός Παρακολούθησης:</strong> {boxnowTrackingCode}
            </Text>
            {boxnowLockerAddress && (
              <Text style={paragraph}>
                <strong>Locker:</strong> {boxnowLockerAddress}
              </Text>
            )}
            <Text style={smallText}>
              Θα λάβετε SMS όταν το δέμα σας φτάσει στο locker.
            </Text>
          </Section>
        )}

        {/* What's Next */}
        <Section style={nextStepsSection}>
          <Heading as="h3" style={h3}>
            Τι ακολουθεί;
          </Heading>
          <Text style={paragraph}>
            Επεξεργαζόμαστε την παραγγελία σας και θα σας στείλουμε ενημερώσεις μέσω email.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Hr style={hr} />
          <Text style={footerText}>
            Χρειάζεστε βοήθεια;{' '}
            <Link href="mailto:info@tinkerbell.gr" style={link}>
              info@tinkerbell.gr
            </Link>
          </Text>
          <Text style={footerText}>
            Τηλέφωνο: +30 123 456 7890
          </Text>
          <Text style={copyright}>© 2025 Tinkerbell. Με επιφύλαξη παντός δικαιώματος.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

// Styles
const main = {
  backgroundColor: '#f6f6f6',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  padding: '32px 0',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#ffb3d9',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '8px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const tagline = {
  color: '#666666',
  fontSize: '14px',
  margin: '0',
  textAlign: 'center' as const,
};

const successSection = {
  textAlign: 'center' as const,
  padding: '24px',
};

const successIcon = {
  fontSize: '48px',
  color: '#22c55e',
  margin: '0 0 16px 0',
};

const h2 = {
  color: '#22c55e',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const h3 = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
};

const paragraph = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const orderDetails = {
  padding: '24px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  margin: '24px 24px',
};

const detailTitle = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px 0',
  letterSpacing: '0.5px',
};

const detailValue = {
  color: '#333333',
  fontSize: '16px',
  margin: '0 0 16px 0',
  fontFamily: 'monospace',
};

const itemsSection = {
  padding: '0 24px',
};

const itemRow = {
  marginBottom: '16px',
};

const itemDetails = {
  verticalAlign: 'top' as const,
  paddingRight: '16px',
};

const itemName = {
  color: '#333333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
};

const itemVariant = {
  color: '#666666',
  fontSize: '14px',
  margin: '0 0 4px 0',
};

const itemQuantity = {
  color: '#666666',
  fontSize: '14px',
  margin: '0',
};

const itemPrice = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
};

const priceText = {
  color: '#333333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const totalRow = {
  marginTop: '16px',
};

const totalLabel = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const totalAmount = {
  color: '#ffb3d9',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'right' as const,
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '16px 0',
};

const trackingSection = {
  padding: '24px',
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  margin: '24px 24px',
};

const nextStepsSection = {
  padding: '24px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  margin: '24px 24px',
};

const smallText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0 0 0',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  margin: '8px 0',
};

const link = {
  color: '#ffb3d9',
  textDecoration: 'underline',
};

const copyright = {
  color: '#999999',
  fontSize: '12px',
  margin: '16px 0 0 0',
};

