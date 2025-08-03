/** @jsx h */
import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

// Helper to format seconds to HH:MM:SS
function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':');
}

function CountdownTimerWidget({ shop, productId, apiBase }) {
  const [timer, setTimer] = useState(null);
  const [remaining, setRemaining] = useState(null);

  // Fetch active timer for shop/product on mount
  useEffect(() => {
    async function fetchTimer() {
      try {
        let url = `${apiBase}/api/public/timers?shop=${encodeURIComponent(shop)}`;
        if (productId) url += `&productId=${encodeURIComponent(productId)}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Failed to fetch timers');
        const timers = await resp.json();
        setTimer(timers[0] || null);
      } catch (err) {
        console.error('Error fetching timer:', err);
        setTimer(null);
      }
    }
    fetchTimer();
  }, [shop, productId, apiBase]);

  // Update remaining time every second
  useEffect(() => {
    if (!timer) return;

    const endAt = new Date(timer.endAt);
    function update() {
      const now = new Date();
      const secondsLeft = Math.max(0, Math.floor((endAt - now) / 1000));
      setRemaining(secondsLeft);
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (!timer || remaining === null) return null;

  const color = timer.color || 'rgb(0, 200, 0)';
  const fontSizeMap = { Small: '1rem', Medium: '2rem', Large: '3rem' };
  const fontSize = fontSizeMap[timer.timerSize] || '2rem';
  const positionStyle = {
    Top: { marginBottom: '1.5rem' },
    Bottom: { marginTop: '1.5rem' },
    AboveButton: { marginBottom: '1rem' },
    BelowImage: { marginTop: '2rem' },
  }[timer.timerPosition] || {};

  const isUrgent = remaining <= 300; // Last 5 minutes
  const urgencyType = timer.urgency;

  const timerStyle = {
    fontSize,
    fontWeight: 'bold',
    padding: '0.5em 1em',
    borderRadius: '5px',
    background: isUrgent && urgencyType === 'Banner' ? 'orange' : 'rgba(255,255,255,0.9)',
    color,
    border: isUrgent ? '2px solid red' : `2px solid ${color}`,
    boxShadow:
      isUrgent && urgencyType === 'Color pulse' ? '0 0 10px 3px orange' : undefined,
    animation:
      isUrgent && urgencyType === 'Blink' ? 'timer-blink 1s steps(1) infinite' : undefined,
    textAlign: 'center',
    transition: 'all 0.5s',
  };

  // Add blink keyframe CSS once
  useEffect(() => {
    if (!document.getElementById('countdown-timer-widget-style')) {
      const style = document.createElement('style');
      style.id = 'countdown-timer-widget-style';
      style.textContent = `
        @keyframes timer-blink { 50% { opacity: 0; } }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={positionStyle}>
      <div style={timerStyle}>
        {timer.promotion && <div style={{ marginBottom: 8 }}>{timer.promotion}</div>}
        {remaining > 0 ? (
          <span>
            Offer ends in <strong>{formatTime(remaining)}</strong>{' '}
            {isUrgent && urgencyType === 'Banner' && <span style={{ marginLeft: 8 }}>⚡ Hurry!</span>}
          </span>
        ) : (
          <span>Offer expired</span>
        )}
      </div>
    </div>
  );
}

// Mount widget onto the DOM element inserted by the Liquid block
const container = document.getElementById('countdown-timer-root');
if (container) {
  const shop = window.Shopify && window.Shopify.shop ? window.Shopify.shop : 'fyzstoree.myshopify.com';
  const productId = window.Shopify && window.Shopify.product ? window.Shopify.product.id : undefined;
  const apiBase =
    window.SHOPIFY_API_BASE_URL ||
    'http://localhost:4000'; // Replace with your backend API URL or inject dynamically

  render(
    <CountdownTimerWidget shop={shop} productId={productId} apiBase={apiBase} />,
    container
  );
}
