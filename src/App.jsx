import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider } from './contexts/AuthContext';
import EcommercePlatform from './components/EcommercePlatform';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <EcommercePlatform />
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;

