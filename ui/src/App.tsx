import { Provider } from "urql";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import { client } from "./graphql";
import { ResetPassword } from "./pages/ResetPassword";
import DomainPage from "./pages/Domain";
import { AuthProvider } from "./utils/auth";
import SignUp from "./pages/SignUp";
import { SignOut } from "./pages/SignOut";

export const App = () => (
  <Provider value={client}>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/domain/:domain" element={<DomainPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/sign-out" element={<SignOut />} />
        </Routes>
      </Router>
    </AuthProvider>
  </Provider>
);
