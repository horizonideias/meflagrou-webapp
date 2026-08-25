import React from 'react';
import { CartProvider } from './context/CartContext';
import { InstagramApp } from './components/InstagramApp';

export const App: React.FC = () => {
  return (
    <CartProvider>
      <InstagramApp />
    </CartProvider>
  );
};

export default App;
