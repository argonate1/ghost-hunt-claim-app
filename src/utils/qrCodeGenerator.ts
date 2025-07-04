import QRCode from 'qrcode';

interface QRCodeWithLogoOptions {
  width?: number;
  margin?: number;
  logoSize?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export const generateQRCodeWithLogo = async (
  text: string, 
  logoUrl: string = '/lovable-uploads/ab2fb192-ab84-4a60-a4b0-64a0ad014504.png',
  options: QRCodeWithLogoOptions = {}
): Promise<string> => {
  const {
    width = 512,
    margin = 2,
    logoSize = width * 0.2, // Logo will be 20% of QR code size
    color = { dark: '#000000', light: '#ffffff' }
  } = options;

  try {
    // Generate the base QR code
    const qrDataURL = await QRCode.toDataURL(text, {
      width,
      margin,
      color,
      errorCorrectionLevel: 'H' // High error correction for better reliability with logo overlay
    });

    // Create a canvas to combine QR code and logo
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = width;
    canvas.height = width;

    // Load and draw the QR code
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrDataURL;
    });

    ctx.drawImage(qrImage, 0, 0, width, width);

    // Create a clear area in the center by drawing a circle with the background color
    const centerX = width / 2;
    const centerY = width / 2;
    const clearRadius = logoSize / 2 + 10; // Slightly larger than logo for clean edges

    ctx.fillStyle = color.light || '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, clearRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Load and draw the logo in the center with transparent background preserved
    const logoImage = new Image();
    await new Promise((resolve, reject) => {
      logoImage.onload = resolve;
      logoImage.onerror = reject;
      logoImage.src = logoUrl;
    });

    const logoX = (width - logoSize) / 2;
    const logoY = (width - logoSize) / 2;

    // Draw the logo directly without any background modifications
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating QR code with logo:', error);
    // Fallback to regular QR code if logo embedding fails
    return QRCode.toDataURL(text, { width, margin, color });
  }
};