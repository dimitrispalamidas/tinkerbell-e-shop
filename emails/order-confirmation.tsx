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
  Button,
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
  customerPhone: string;
  orderCode: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  items: OrderItem[];
  deliveryMethod: 'boxnow' | 'home';
  shippingAddress?: {
    address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
  };
  boxnowTrackingCode?: string;
  boxnowLockerAddress?: string;
  baseUrl?: string;
}

export const OrderConfirmationEmail = ({
  customerName = 'Πελάτη',
  customerEmail = 'customer@example.com',
  customerPhone = '',
  orderCode = '123456789',
  total = 0,
  subtotal = 0,
  shippingCost = 0,
  items = [],
  deliveryMethod = 'boxnow',
  shippingAddress,
  boxnowTrackingCode,
  boxnowLockerAddress,
  baseUrl = 'https://tinkerbell-e-shop.vercel.app',
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
    </Head>
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
          
          <Text style={detailTitle}>Όνομα</Text>
          <Text style={detailValue}>{customerName}</Text>
          
          <Hr style={hr} />
          
          <Text style={detailTitle}>Email</Text>
          <Text style={detailValue}>{customerEmail}</Text>
          
          <Hr style={hr} />
          
          <Text style={detailTitle}>Τηλέφωνο</Text>
          <Text style={detailValue}>{customerPhone}</Text>
          
          <Hr style={hr} />
          
          <Text style={detailTitle}>Μέθοδος Παράδοσης</Text>
          <Text style={detailValue}>
            {deliveryMethod === 'boxnow' ? '📦 BOXNOW Locker' : '🏠 Παράδοση στο σπίτι'}
          </Text>
          
          {deliveryMethod === 'home' && shippingAddress && (
            <>
              <Hr style={hr} />
              <Text style={detailTitle}>Διεύθυνση Αποστολής</Text>
              <Text style={detailValue}>
                {shippingAddress.address}
                <br />
                {shippingAddress.city}, {shippingAddress.postal_code}
                <br />
                {shippingAddress.region}, Ελλάδα
              </Text>
            </>
          )}
          
          {deliveryMethod === 'boxnow' && boxnowLockerAddress && (
            <>
              <Hr style={hr} />
              <Text style={detailTitle}>BOXNOW Locker</Text>
              <Text style={detailValue}>{boxnowLockerAddress}</Text>
            </>
          )}
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
          
          <Row style={subtotalRow}>
            <td>
              <Text style={subtotalLabel}>Υποσύνολο</Text>
            </td>
            <td>
              <Text style={subtotalAmount}>€{subtotal.toFixed(2)}</Text>
            </td>
          </Row>
          
          <Row style={shippingRow}>
            <td>
              <Text style={shippingLabel}>Κόστος Αποστολής</Text>
            </td>
            <td>
              <Text style={shippingAmount}>
                {shippingCost === 0 ? (
                  <span style={{ color: '#22c55e', fontWeight: '600' }}>ΔΩΡΕΑΝ</span>
                ) : (
                  `€${shippingCost.toFixed(2)}`
                )}
              </Text>
            </td>
          </Row>
          
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
            ✅ Επεξεργαζόμαστε την παραγγελία σας
          </Text>
          <Text style={paragraph}>
            📦 Θα προετοιμάσουμε τα προϊόντα σας
          </Text>
          <Text style={paragraph}>
            📧 Θα σας στείλουμε ενημερώσεις μέσω email
          </Text>
          
          <div style={buttonContainer}>
            <Button href={`${baseUrl}/shop`} style={button}>
              Συνέχεια Αγορών
            </Button>
          </div>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Hr style={hr} />
          <Heading as="h3" style={h3Footer}>
            Χρειάζεστε βοήθεια;
          </Heading>
          <Text style={footerText}>
            📧 Email:{' '}
            <Link href="mailto:tinkerbellkalamatas@gmail.com" style={link}>
              tinkerbellkalamatas@gmail.com
            </Link>
          </Text>
          <Text style={footerText}>
            📞 Τηλέφωνο:{' '}
            <Link href="tel:+302721406303" style={link}>
              2721 406303
            </Link>
          </Text>
          <Text style={footerText}>
            📍 Γεωργούλη 8, Καλαμάτα
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
  padding: '20px 10px 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  width: '100%',
};

const header = {
  textAlign: 'center' as const,
  padding: '24px 8px',
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#ffb3d9',
  fontSize: '28px',
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
  padding: '20px 8px',
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
};

const successIcon = {
  fontSize: '40px',
  color: '#22c55e',
  margin: '0 0 12px 0',
};

const h2 = {
  color: '#22c55e',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const h3 = {
  color: '#333333',
  fontSize: '17px',
  fontWeight: 'bold',
  margin: '20px 0 12px 0',
};

const paragraph = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 12px 0',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
};

const orderDetails = {
  padding: '16px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  margin: '20px 8px',
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
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
  fontSize: '14px',
  margin: '0 0 16px 0',
  fontFamily: 'monospace',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
  maxWidth: '100%',
};

const itemsSection = {
  padding: '0 8px',
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
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
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
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

const subtotalRow = {
  marginBottom: '8px',
};

const subtotalLabel = {
  color: '#666666',
  fontSize: '15px',
  margin: '0',
};

const subtotalAmount = {
  color: '#333333',
  fontSize: '15px',
  margin: '0',
  textAlign: 'right' as const,
  wordBreak: 'break-word' as const,
};

const shippingRow = {
  marginBottom: '16px',
};

const shippingLabel = {
  color: '#666666',
  fontSize: '15px',
  margin: '0',
};

const shippingAmount = {
  color: '#333333',
  fontSize: '15px',
  margin: '0',
  textAlign: 'right' as const,
  wordBreak: 'break-word' as const,
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
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'right' as const,
  wordBreak: 'break-word' as const,
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '16px 0',
};

const trackingSection = {
  padding: '16px',
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  margin: '20px 8px',
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
};

const nextStepsSection = {
  padding: '16px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  margin: '20px 8px',
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
};

const smallText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0 0 0',
};

const footer = {
  padding: '20px 8px',
  textAlign: 'center' as const,
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
};

const h3Footer = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '20px',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
};

const link = {
  color: '#ffb3d9',
  textDecoration: 'underline',
  fontWeight: '600',
};

const copyright = {
  color: '#999999',
  fontSize: '12px',
  margin: '16px 0 0 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0 0 0',
};

const button = {
  backgroundColor: '#ffb3d9',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 auto',
  maxWidth: '90%',
  boxSizing: 'border-box' as const,
};

