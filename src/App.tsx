import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./Pages/Home-page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All routes share the Layout (Navbar + main wrapper) */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* 404 - outside Layout if you want a full-screen error page */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
