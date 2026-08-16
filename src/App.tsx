import { Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import ProjectsPage from "./pages/ProjectsPage";
import Gallery from "./pages/Gallery";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import DiscussionList from "./pages/DiscussionList";
import DiscussionRoom from "./pages/DiscussionRoom";
import ValuesPage from "./pages/ValuesPage";
import ContributionsPage from "./pages/ContributionsPage";
import Seo from "./components/Seo";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import GuestbookPage from "./pages/GuestbookPage";

function App() {
    return (
        <div className="page">
            <Nav />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/guestbook" element={<GuestbookPage />} />
                <Route path="/discussions" element={<DiscussionList />} />
                <Route path="/discussions/:slug" element={<DiscussionRoom />} />
                <Route path="/values" element={<ValuesPage />} />
                <Route path="/contributions" element={<ContributionsPage />} />
                <Route
                    path="/admin/login"
                    element={
                        <>
                            <Seo title="Admin login" robots="noindex, nofollow" />
                            <AdminLogin />
                        </>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <>
                            <Seo title="Admin panel" robots="noindex, nofollow" />
                            <AdminDashboard />
                        </>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
            <BackToTop />
        </div>
    );
}

export default App;
