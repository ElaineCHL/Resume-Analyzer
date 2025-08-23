import React from 'react'
import { Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import JobPage from "./pages/JobPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/job" element={<JobPage />} />
        <Route path="/job/:jobId" element={<JobDetailsPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
