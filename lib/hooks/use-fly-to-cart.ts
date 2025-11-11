"use client"

export interface FlyToCartOptions {
  imageUrl: string;
  sourceElement: HTMLElement;
}

export function useFlyToCart() {
  const flyToCart = ({ imageUrl, sourceElement }: FlyToCartOptions) => {
    // Find all cart icons and get the visible one
    const cartIcons = document.querySelectorAll('[data-cart-icon]');
    let cartIcon: Element | null = null;
    
    // Find the visible cart icon (the one that's not display:none or has offsetParent)
    for (const icon of cartIcons) {
      const element = icon as HTMLElement;
      if (element.offsetParent !== null) {
        cartIcon = icon;
        break;
      }
    }
    
    if (!cartIcon) return;

    // Get positions
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = cartIcon.getBoundingClientRect();

    // Create flying element
    const flyingElement = document.createElement('div');
    flyingElement.style.position = 'fixed';
    flyingElement.style.left = `${sourceRect.left + sourceRect.width / 2 - 60}px`;
    flyingElement.style.top = `${sourceRect.top + sourceRect.height / 2 - 60}px`;
    flyingElement.style.width = '120px';
    flyingElement.style.height = '120px';
    flyingElement.style.zIndex = '99999';
    flyingElement.style.pointerEvents = 'none';
    flyingElement.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    flyingElement.style.borderRadius = '16px';
    flyingElement.style.overflow = 'hidden';
    flyingElement.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4)';
    flyingElement.style.border = '3px solid white';

    // Create image element
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.alt = 'Product flying to cart';
    
    flyingElement.appendChild(img);
    document.body.appendChild(flyingElement);

    // Trigger animation after a brief delay to ensure styles are applied
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Calculate target position (center of cart icon)
        const targetX = targetRect.left + targetRect.width / 2 - 20;
        const targetY = targetRect.top + targetRect.height / 2 - 20;

        // Apply transformations
        flyingElement.style.left = `${targetX}px`;
        flyingElement.style.top = `${targetY}px`;
        flyingElement.style.transform = 'scale(0.1) rotate(360deg)';
        flyingElement.style.opacity = '0';
      });
    });

    // Animate cart icon bounce
    const animateCartBounce = () => {
      cartIcon.classList.add('cart-bounce-animation');
      setTimeout(() => {
        cartIcon.classList.remove('cart-bounce-animation');
      }, 600);
    };

    // Remove flying element after animation
    setTimeout(() => {
      flyingElement.remove();
      animateCartBounce();
    }, 1000);
  };

  return { flyToCart };
}

