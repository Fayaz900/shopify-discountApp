import React, { useState, useEffect } from 'react';
import {
  Page,
  Card,
  Button,
  Banner,
  DataTable,
  Text,
} from '@shopify/polaris';
import TimerFormModal from './TimerComponent';

export default function TimerManagerPage() {
  const [timers, setTimers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Fetch timers from backend API
  const fetchTimers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://shopify-discountapp-production.up.railway.app/api/timers', {
        headers: {
          // Replace with actual shop/session authentication header in production
          'x-shop': 'demo-shop.myshopify.com',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load timers');
      }
      const data = await response.json();
      setTimers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimers();
  }, []);

  // Handle deleting a timer by id
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timer?')) return;

    setDeleteLoadingId(id);
    setError('');
    try {
      const response = await fetch(`https://shopify-discountapp-production.up.railway.app/api/timers/${id}`, {
        method: 'DELETE',
        headers: {
          'x-shop': 'demo-shop.myshopify.com',
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Delete failed');
      }
      setTimers((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // After successfully creating a timer, refresh list and close modal
  const handleTimerCreated = (newTimer) => {
    fetchTimers();
    setModalOpen(false);
  };

  // Prepare rows for DataTable
  const rows = timers.map((timer) => [
    timer.timerName,
    new Date(timer.startAt).toLocaleString(),
    new Date(timer.endAt).toLocaleString(),
    timer.promotion,
    timer.timerSize,
    timer.timerPosition,
    timer.urgency,
    <Button
      destructive
      size="slim"
      loading={deleteLoadingId === timer._id}
      onClick={() => handleDelete(timer._id)}
    >
      Delete
    </Button>,
  ]);

  return (
    <Page
      title="Countdown Timers"
      primaryAction={{
        content: 'Create New Timer',
        onAction: () => setModalOpen(true),
      }}
    >
      {error && (
        <Banner status="critical" onDismiss={() => setError('')}>
          <p>{error}</p>
        </Banner>
      )}

      <Card sectioned>
        {loading ? (
          <Text>Loading timers...</Text>
        ) : timers.length === 0 ? (
          <Text>No timers created yet.</Text>
        ) : (
          <DataTable
            columnContentTypes={[
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
            ]}
            headings={[
              'Timer Name',
              'Start At',
              'End At',
              'Promotion',
              'Size',
              'Position',
              'Urgency',
              'Actions',
            ]}
            rows={rows}
          />
        )}
      </Card>

      <TimerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleTimerCreated}
      />
    </Page>
  );
}
