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

interface AdminOrderNotificationProps {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  subtotalWithoutDiscounts: number;
  subtotalWithDiscounts: number;
  productDiscountAmount: number;
  codeDiscountAmount: number;
  discountCodes?: Array<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
  }>;
  shippingCost: number;
  items: OrderItem[];
  deliveryMethod: 'boxnow' | 'home';
  shippingAddress?: {
    address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
  };
  boxnowLockerAddress?: string;
  baseUrl?: string;
}

export const AdminOrderNotificationEmail = ({
  orderCode = '123456789',
  customerName = 'Πελάτης',
  customerEmail = 'customer@example.com',
  customerPhone = '',
  total = 0,
  subtotalWithoutDiscounts = 0,
  subtotalWithDiscounts = 0,
  productDiscountAmount = 0,
  codeDiscountAmount = 0,
  discountCodes,
  shippingCost = 0,
  items = [],
  deliveryMethod = 'boxnow',
  shippingAddress,
  boxnowLockerAddress,
  baseUrl = 'https://tinkerbell-e-shop.vercel.app',
}: AdminOrderNotificationProps) => {
  const hasAnyDiscount = productDiscountAmount > 0 || codeDiscountAmount > 0;
  
  return (
  <Html>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
    </Head>
    <Preview>Νέα Παραγγελία #{orderCode} - Tinkerbell Admin</Preview>
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
          <Heading style={h1}>Tinkerbell Admin</Heading>
          <Text style={tagline}>Νέα Παραγγελία</Text>
        </Section>

        {/* Alert Section */}
        <Section style={alertSection}>
          <Text style={alertIcon}>🔔</Text>
          <Heading style={h2}>Νέα Παραγγελία!</Heading>
          <Text style={paragraph}>
            Έχετε λάβει μια <strong style={{color: '#ffb3d9'}}>νέα παραγγελία</strong> που χρειάζεται επεξεργασία.
          </Text>
        </Section>

        {/* Order Details */}
        <Section style={orderDetails}>
          <Text style={detailTitle}>Κωδικός Παραγγελίας</Text>
          <Text style={detailValue}>{orderCode}</Text>
          
          <Hr style={hr} />
          
          <Text style={detailTitle}>Σύνολο</Text>
          <Text style={totalValue}>€{total.toFixed(2)}</Text>
          
          <Hr style={hr} />
          
          <Text style={detailTitle}>Πελάτης</Text>
          <Text style={detailValue}>{customerName}</Text>
          
          <Hr style={hr} />
          
          <Text style={detailTitle}>Email</Text>
          <Text style={detailValue}>
            <Link href={`mailto:${customerEmail}`} style={link}>
              {customerEmail}
            </Link>
          </Text>
          
          <Hr style={hr} />
          
          <Text style={detailTitle}>Τηλέφωνο</Text>
          <Text style={detailValue}>
            <Link href={`tel:${customerPhone}`} style={link}>
              {customerPhone}
            </Link>
          </Text>
          
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
          
          {hasAnyDiscount && (
            <>
              <Row style={subtotalRow}>
                <td>
                  <Text style={subtotalLabel}>Υποσύνολο</Text>
                </td>
                <td>
                  <Text style={{...subtotalAmount, textDecoration: 'line-through', color: '#9ca3af'}}>
                    €{subtotalWithoutDiscounts.toFixed(2)}
                  </Text>
                </td>
              </Row>
              {productDiscountAmount > 0 && (
                <Row style={subtotalRow}>
                  <td>
                    <Text style={subtotalLabel}>Έκπτωση Προϊόντων</Text>
                  </td>
                  <td>
                    <Text style={{...subtotalAmount, color: '#22c55e'}}>
                      -€{productDiscountAmount.toFixed(2)}
                    </Text>
                  </td>
                </Row>
              )}
              {codeDiscountAmount > 0 && (
                <Row style={subtotalRow}>
                  <td>
                    <Text style={subtotalLabel}>
                      Έκπτωση Κωδικού{discountCodes && discountCodes.length > 0 
                        ? ` (${discountCodes.map(dc => dc.code).join(', ')})`
                        : ''}
                    </Text>
                  </td>
                  <td>
                    <Text style={{...subtotalAmount, color: '#22c55e'}}>
                      -€{codeDiscountAmount.toFixed(2)}
                    </Text>
                  </td>
                </Row>
              )}
            </>
          )}
          
          <Row style={subtotalRow}>
            <td>
              <Text style={subtotalLabel}>Υποσύνολο</Text>
            </td>
            <td>
              <Text style={subtotalAmount}>€{subtotalWithDiscounts.toFixed(2)}</Text>
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
                  `+€${shippingCost.toFixed(2)}`
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

        {/* Action Button */}
        <Section style={actionSection}>
          <div style={buttonContainer}>
            <Button href={`${baseUrl}/admin/orders`} style={button}>
              👁️ Προβολή Παραγγελίας
            </Button>
          </div>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Hr style={hr} />
          <Text style={footerText}>
            Αυτό είναι ένα αυτόματο email από το σύστημα διαχείρισης Tinkerbell.
          </Text>
          <Text style={copyright}>© 2025 Tinkerbell. Με επιφύλαξη παντός δικαιώματος.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
  );
};

export default AdminOrderNotificationEmail;

// Styles
const main = {
  backgroundColor: '#fafafa',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginBottom: '32px',
  maxWidth: '600px',
  width: '100%',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
};

const header = {
  textAlign: 'center' as const,
  padding: '32px 24px',
  background: 'linear-gradient(135deg, #fff5fb 0%, #ffffff 100%)',
  borderBottom: '2px solid #ffe0f0',
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
};

const logo = {
  margin: '0 auto 16px',
  borderRadius: '12px',
};

const h1 = {
  color: '#ffb3d9',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  padding: '0',
  textAlign: 'center' as const,
  letterSpacing: '-0.5px',
};

const tagline = {
  color: '#6b6b6b',
  fontSize: '14px',
  margin: '0',
  textAlign: 'center' as const,
  fontWeight: '500',
};

const alertSection = {
  textAlign: 'center' as const,
  padding: '40px 24px',
  background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
  borderBottom: '1px solid #e5e5e5',
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
};

const alertIcon = {
  fontSize: '56px',
  color: '#f59e0b',
  margin: '0 0 16px 0',
  lineHeight: '1',
};

const h2 = {
  color: '#d97706',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 16px 0',
  letterSpacing: '-0.5px',
};

const h3 = {
  color: '#2d2d2d',
  fontSize: '20px',
  fontWeight: '700',
  margin: '24px 0 16px 0',
  letterSpacing: '-0.3px',
};

const paragraph = {
  color: '#2d2d2d',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 12px 0',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
};

const orderDetails = {
  padding: '24px',
  backgroundColor: '#f5f5f5',
  borderRadius: '12px',
  margin: '24px 24px',
  border: '2px solid #e5e5e5',
  maxWidth: 'calc(100% - 48px)',
  boxSizing: 'border-box' as const,
};

const detailTitle = {
  color: '#6b6b6b',
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  margin: '0 0 6px 0',
  letterSpacing: '0.8px',
};

const detailValue = {
  color: '#2d2d2d',
  fontSize: '15px',
  margin: '0 0 20px 0',
  fontWeight: '600',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
  maxWidth: '100%',
  lineHeight: '22px',
};

const totalValue = {
  color: '#ffb3d9',
  fontSize: '24px',
  margin: '0 0 20px 0',
  fontWeight: '700',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
  maxWidth: '100%',
  lineHeight: '22px',
};

const itemsSection = {
  padding: '24px',
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
};

const itemRow = {
  marginBottom: '12px',
  padding: '16px',
  backgroundColor: '#fafafa',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
};

const itemDetails = {
  verticalAlign: 'top' as const,
  paddingRight: '16px',
};

const itemName = {
  color: '#2d2d2d',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
  lineHeight: '22px',
};

const itemVariant = {
  color: '#6b6b6b',
  fontSize: '13px',
  margin: '0 0 6px 0',
  fontWeight: '500',
};

const itemQuantity = {
  color: '#6b6b6b',
  fontSize: '13px',
  margin: '0',
  fontWeight: '500',
};

const itemPrice = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
};

const priceText = {
  color: '#2d2d2d',
  fontSize: '17px',
  fontWeight: '700',
  margin: '0',
};

const subtotalRow = {
  marginBottom: '12px',
};

const subtotalLabel = {
  color: '#6b6b6b',
  fontSize: '15px',
  margin: '0',
  fontWeight: '500',
};

const subtotalAmount = {
  color: '#2d2d2d',
  fontSize: '15px',
  margin: '0',
  textAlign: 'right' as const,
  fontWeight: '600',
  wordBreak: 'break-word' as const,
};

const shippingRow = {
  marginBottom: '20px',
};

const shippingLabel = {
  color: '#6b6b6b',
  fontSize: '15px',
  margin: '0',
  fontWeight: '500',
};

const shippingAmount = {
  color: '#2d2d2d',
  fontSize: '15px',
  margin: '0',
  textAlign: 'right' as const,
  fontWeight: '600',
  wordBreak: 'break-word' as const,
};

const totalRow = {
  marginTop: '20px',
  padding: '16px',
  backgroundColor: '#fff5fb',
  borderRadius: '8px',
  border: '2px solid #ffb3d9',
};

const totalLabel = {
  color: '#2d2d2d',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
};

const totalAmount = {
  color: '#ffb3d9',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'right' as const,
  wordBreak: 'break-word' as const,
};

const hr = {
  borderColor: '#e5e5e5',
  borderWidth: '1px',
  margin: '20px 0',
};

const actionSection = {
  padding: '24px',
  textAlign: 'center' as const,
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '0',
};

const button = {
  backgroundColor: '#ffb3d9',
  borderRadius: '10px',
  color: '#2d2d2d',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  margin: '0 auto',
  maxWidth: '90%',
  boxSizing: 'border-box' as const,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const footer = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#fafafa',
  borderTop: '2px solid #e5e5e5',
  maxWidth: '100%',
  boxSizing: 'border-box' as const,
};

const footerText = {
  color: '#6b6b6b',
  fontSize: '14px',
  margin: '12px 0',
  lineHeight: '22px',
  fontWeight: '500',
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
};

const copyright = {
  color: '#999999',
  fontSize: '12px',
  margin: '20px 0 0 0',
  fontWeight: '500',
};

const link = {
  color: '#ffb3d9',
  textDecoration: 'none',
  fontWeight: '700',
  borderBottom: '2px solid #ffb3d9',
  paddingBottom: '1px',
};

