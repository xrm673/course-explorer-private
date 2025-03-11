export default function NavigationMenu({ onClose }) {
    return (
        <div style={{
            "position": "fixed",
            "right": 0,
            "top": "100px",
            "height": "calc(100vh - 100px)",
            "width": "300px",
            "backgroundColor": "white",
            "boxShadow": "-2px 0 5px rgba(0,0,0,0.1)",
            "zIndex": 90,
            "padding": "20px"
        }}>
            <div style={{
                "display": "flex",
                "justifyContent": "space-between",
                "alignItems": "center",
                "marginBottom": "20px"
            }}>
                <h2 style={{ "margin": 0 }}>Menu</h2>
                <button 
                    onClick={onClose}
                    style={{
                        "background": "none",
                        "border": "none",
                        "fontSize": "24px",
                        "cursor": "pointer"
                    }}
                >
                    ×
                </button>
            </div>
            <nav>
                <ul style={{
                    "listStyle": "none",
                    "padding": 0,
                    "margin": 0
                }}>
                    <li style={{ "padding": "15px 0", "borderBottom": "1px solid #eee" }}>
                        <a href="/" style={{ "textDecoration": "none", "color": "#333", "fontWeight": "500" }}>Home</a>
                    </li>
                    <li style={{ "padding": "15px 0", "borderBottom": "1px solid #eee" }}>
                        <a href="/majors" style={{ "textDecoration": "none", "color": "#333", "fontWeight": "500" }}>Majors</a>
                    </li>
                    <li style={{ "padding": "15px 0", "borderBottom": "1px solid #eee" }}>
                        <a href="/minors" style={{ "textDecoration": "none", "color": "#333", "fontWeight": "500" }}>Minors</a>
                    </li>
                    <li style={{ "padding": "15px 0", "borderBottom": "1px solid #eee" }}>
                        <a href="/subjects" style={{ "textDecoration": "none", "color": "#333", "fontWeight": "500" }}>Subjects</a>
                    </li>
                    <li style={{ "padding": "15px 0" }}>
                        <a href="/dashboard" style={{ "textDecoration": "none", "color": "#333", "fontWeight": "500" }}>My Dashboard</a>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
