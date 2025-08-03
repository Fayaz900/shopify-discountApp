import React, { useState } from 'react';
import {
  Modal,
  FormLayout,
  TextField,
  ColorPicker,
  Select,
  Banner,
  BlockStack,
  InlineStack,
} from '@shopify/polaris';

// Convert Polaris ColorPicker HSB color to CSS rgb string
function hsbToRgbString({ hue, saturation, brightness }) {
  let c = brightness * saturation;
  let x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  let m = brightness - c;
  let r, g, b;

  if (hue < 60) {
    r = c; g = x; b = 0;
  } else if (hue < 120) {
    r = x; g = c; b = 0;
  } else if (hue < 180) {
    r = 0; g = c; b = x;
  } else if (hue < 240) {
    r = 0; g = x; b = c;
  } else if (hue < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `rgb(${r},${g},${b})`;
}

export default function TimerFormModal({ open, onClose, onSubmit }) {
  const [timerName, setTimerName] = useState('');
  const [promotion, setPromotion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState({ hue: 120, saturation: 1, brightness: 1 });
  const [timerSize, setTimerSize] = useState('Medium');
  const [timerPosition, setTimerPosition] = useState('Top');
  const [urgency, setUrgency] = useState('Color pulse');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const timerSizeOptions = [
    { label: 'Small', value: 'Small' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Large', value: 'Large' },
  ];
  const timerPositionOptions = [
    { label: 'Top', value: 'Top' },
    { label: 'Bottom', value: 'Bottom' },
    { label: 'Above button', value: 'AboveButton' },
    { label: 'Below image', value: 'BelowImage' },
  ];
  const urgencyOptions = [
    { label: 'Color pulse', value: 'Color pulse' },
    { label: 'Banner', value: 'Banner' },
    { label: 'Blink', value: 'Blink' },
  ];

  // Combine date ('YYYY-MM-DD') + time ('HH:mm') into ISO string
  function combineDateTime(dateString, timeString) {
    if (!dateString || !timeString) return null;
    const combined = new Date(`${dateString}T${timeString}`);
    return isNaN(combined.getTime()) ? null : combined.toISOString();
  }

  const handleSubmit = async () => {
    if (!timerName.trim()) {
      setError('Timer name is required.');
      return;
    }
    if (!startDate || !startTime || !endDate || !endTime) {
      setError('Please fill in all start and end date/time fields.');
      return;
    }

    const startAt = combineDateTime(startDate, startTime);
    const endAt = combineDateTime(endDate, endTime);

    if (!startAt || !endAt) {
      setError('Invalid date or time format.');
      return;
    }

    if (startAt >= endAt) {
      setError('End date/time must be after start date/time.');
      return;
    }

    setError('');
    setLoading(true);

    const timerData = {
      timerName: timerName.trim(),
      promotion,
      startAt,
      endAt,
      color: hsbToRgbString(color),
      timerSize,
      timerPosition,
      urgency,
    };

    try {
      const response = await fetch('http://localhost:4000/api/timers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shop': 'demo-shop.myshopify.com', // Replace with actual shop ID/session in production
        },
        body: JSON.stringify(timerData),
      });

      if (!response.ok) {
        const errorJson = await response.json();
        setError(errorJson.error || 'Failed to create timer');
        setLoading(false);
        return;
      }

      // On success, optionally reset fields or close modal
      setLoading(false);
      onSubmit && onSubmit(timerData);
      onClose();
      // Reset form if needed:
      setTimerName('');
      setPromotion('');
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setColor({ hue: 120, saturation: 1, brightness: 1 });
      setTimerSize('Medium');
      setTimerPosition('Top');
      setUrgency('Color pulse');
      setError('');
    } catch (err) {
      setError('Network error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setError('');
        onClose();
      }}
      title="Create New Timer"
      primaryAction={{
        content: loading ? 'Creating...' : 'Create timer',
        onAction: handleSubmit,
        disabled: loading,
      }}
      secondaryActions={[{ content: 'Cancel', onAction: onClose }]}
    >
      <Modal.Section>
        <FormLayout>
          {error && <Banner status="critical">{error}</Banner>}

          <TextField
            label="Timer Name"
            value={timerName}
            onChange={setTimerName}
            autoComplete="off"
            requiredIndicator
            disabled={loading}
          />

          <TextField
            label="Promotion Description"
            value={promotion}
            onChange={setPromotion}
            multiline
            disabled={loading}
          />

          <BlockStack gap="4" style={{ marginTop: '1rem' }}>
            <InlineStack gap="4" alignment="center">
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={setStartDate}
                autoComplete="off"
                required
                disabled={loading}
              />
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={setStartTime}
                autoComplete="off"
                required
                disabled={loading}
              />
            </InlineStack>

            <InlineStack gap="4" alignment="center">
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={setEndDate}
                autoComplete="off"
                required
                disabled={loading}
              />
              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={setEndTime}
                autoComplete="off"
                required
                disabled={loading}
              />
            </InlineStack>
          </BlockStack>

          <div style={{ marginTop: '1rem' }}>
            <p style={{ marginBottom: 4, fontWeight: '600' }}>Timer Color</p>
            <ColorPicker color={color} onChange={setColor} allowAlpha={false} disabled={loading} />
          </div>

          <InlineStack gap="4" alignment="center" style={{ marginTop: '1rem' }}>
            <Select
              label="Timer Size"
              options={timerSizeOptions}
              value={timerSize}
              onChange={setTimerSize}
              disabled={loading}
            />
            <Select
              label="Timer Position"
              options={timerPositionOptions}
              value={timerPosition}
              onChange={setTimerPosition}
              disabled={loading}
            />
          </InlineStack>

          <Select
            label="Urgency Notification"
            options={urgencyOptions}
            value={urgency}
            onChange={setUrgency}
            style={{ marginTop: '1rem' }}
            disabled={loading}
          />
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}
