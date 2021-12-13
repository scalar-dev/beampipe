import { Provider } from "urql";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import { client } from "./graphql";
import { ResetPassword } from "./pages/ResetPassword";
import DomainPage from "./pages/Domain";

export const App = () => (
  <Provider value={client}>
    <Router>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/" element={<Dashboard />} />
        <Route path="/domain/:domain" element={<DomainPage />} />

        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  </Provider>
);
