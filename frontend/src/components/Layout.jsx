import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    const company = (localStorage.getItem("company") || "phoenix").toLowerCase();

    return (
        <div className={`layout-root theme-${company}`} style={{ minHeight: "100vh", position: "relative", backgroundColor: "var(--bg-main)" }}>
            <Navbar />
            <div className="flex" style={{ display: "flex", position: "relative", zIndex: 1 }}>
                <Sidebar />
                <main style={{
                    flex: 1,
                    padding: "2.5rem",
                    minHeight: "calc(100vh - 73px)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    {/* Technical Layer */}
                    <div className="dot-grid-bg" style={{ position: "absolute", inset: 0, opacity: company === 'inpack' ? 0.05 : 0.03, pointerEvents: "none" }}></div>
                    
                    <div style={{ position: "relative", zIndex: 2 }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
