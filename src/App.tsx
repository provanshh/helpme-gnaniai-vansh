import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/app/router';
import i18n from '@/i18n';
import { useAppStore } from '@/store/appStore';

export default function App() {
  useEffect(() => {
    const lang = useAppStore.getState().language;
    void i18n.changeLanguage(lang);
  }, []);

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
