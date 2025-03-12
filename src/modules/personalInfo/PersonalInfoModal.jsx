export default function PersonalInfoModal({ onClose }) {
    // Sample user data - in a real app, this would come from props or context
    const userData = {
        name: "John Doe",
        credits: 60,
        graduationYear: 2026,
        college: "College of Arts & Sciences",
        majors: [{ name: "Computer Science", progress: 45 }],
        minors: [{ name: "Information Science", progress: 30 }]
    };

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
            "padding": "20px",
            "overflow": "auto"
        }}>
            <div style={{
                "display": "flex",
                "justifyContent": "space-between",
                "alignItems": "center",
                "marginBottom": "20px"
            }}>
                <h2 style={{ "margin": 0 }}>Profile</h2>
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
            
            <div style={{ "marginBottom": "20px" }}>
                <div style={{ "display": "flex", "alignItems": "center", "marginBottom": "10px" }}>
                    <div style={{ 
                        "width": "60px", 
                        "height": "60px", 
                        "borderRadius": "50%", 
                        "backgroundColor": "#eee",
                        "display": "flex",
                        "alignItems": "center",
                        "justifyContent": "center",
                        "marginRight": "15px"
                    }}>
                        {userData.name.charAt(0)}
                    </div>
                    <div>
                        <div style={{ "fontWeight": "bold" }}>{userData.name}</div>
                        <div>{userData.credits} credits</div>
                        <div>Class of {userData.graduationYear}</div>
                    </div>
                </div>
                
                <button style={{
                    "width": "100%",
                    "padding": "8px",
                    "backgroundColor": "#f0f0f0",
                    "border": "1px solid #ddd",
                    "borderRadius": "4px",
                    "cursor": "pointer",
                    "marginTop": "10px"
                }}>
                    Edit Profile
                </button>
                
                <div style={{ "marginTop": "15px" }}>
                    <a href="/dashboard" style={{
                        "display": "block",
                        "width": "100%",
                        "padding": "8px",
                        "backgroundColor": "#007bff",
                        "color": "white",
                        "textAlign": "center",
                        "borderRadius": "4px",
                        "textDecoration": "none"
                    }}>
                        My Dashboard
                    </a>
                </div>
            </div>
            
            <div style={{ "marginBottom": "20px" }}>
                <h3>College</h3>
                <a href={`/college`} style={{ "textDecoration": "none", "color": "#007bff" }}>
                    {userData.college}
                </a>
            </div>
            
            <div style={{ "marginBottom": "20px" }}>
                <h3>Majors</h3>
                {userData.majors.map((major, index) => (
                    <div key={index} style={{ "marginBottom": "10px" }}>
                        <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                            <a href={`/major/${major.name.toLowerCase().replace(/\s+/g, '-')}`} style={{ "textDecoration": "none", "color": "#007bff" }}>
                                {major.name}
                            </a>
                            <span>{major.progress}%</span>
                        </div>
                        <div style={{ "width": "100%", "backgroundColor": "#eee", "height": "8px", "borderRadius": "4px", "marginTop": "5px" }}>
                            <div style={{ 
                                "width": `${major.progress}%`, 
                                "backgroundColor": "#007bff", 
                                "height": "100%", 
                                "borderRadius": "4px" 
                            }}></div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div>
                <h3>Minors</h3>
                {userData.minors.map((minor, index) => (
                    <div key={index} style={{ "marginBottom": "10px" }}>
                        <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                            <a href={`/minor/${minor.name.toLowerCase().replace(/\s+/g, '-')}`} style={{ "textDecoration": "none", "color": "#007bff" }}>
                                {minor.name}
                            </a>
                            <span>{minor.progress}%</span>
                        </div>
                        <div style={{ "width": "100%", "backgroundColor": "#eee", "height": "8px", "borderRadius": "4px", "marginTop": "5px" }}>
                            <div style={{ 
                                "width": `${minor.progress}%`, 
                                "backgroundColor": "#007bff", 
                                "height": "100%", 
                                "borderRadius": "4px" 
                            }}></div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div style={{ "marginTop": "20px" }}>
                <button style={{
                    "width": "100%",
                    "padding": "8px",
                    "backgroundColor": "#f8f9fa",
                    "border": "1px solid #ddd",
                    "borderRadius": "4px",
                    "cursor": "pointer"
                }}>
                    Log Out
                </button>
            </div>
        </div>
    );
}