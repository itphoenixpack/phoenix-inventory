import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    return (
        <div className="layout-root" style={{ minHeight: "100vh" }}>
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main style={{
                    flex: 1,
                    padding: "2rem",
                    backgroundColor: "var(--bg-main)",
                    minHeight: "calc(100vh - 73px)"
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
