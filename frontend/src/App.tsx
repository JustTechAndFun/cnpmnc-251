import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './routes';
import { StyleProvider } from '@ant-design/cssinjs';
import './App.css';

function App() {
  return (
    <StyleProvider hashPriority="high">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </StyleProvider >
  );
}

export default App;
