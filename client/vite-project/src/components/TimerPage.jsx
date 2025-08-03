import React, { useState } from 'react';
import { Button, AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import TimerFormModal from './TimerComponent';

export default function TimerPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleTimerSubmit = (timerData) => {
    console.log('Timer created:', timerData);
    // TODO: Send timerData to your backend API
    setModalOpen(false);
  };

  return (
    <AppProvider i18n={enTranslations}>
      <Button onClick={() => setModalOpen(true)} primary>
        Create New Timer
      </Button>
      <TimerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleTimerSubmit}
      />
    </AppProvider>
  );
}
