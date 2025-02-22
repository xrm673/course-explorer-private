import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Aside from '../components/Aside'

export default function Activities() {
    return (
        <>
            <header>
                <a href="/index">
                <picture className="logo">
                    {/*Instructor Provided*/}
                    <img src="images/apple-harvest-logo.svg" alt="apple fest logo" />
                </picture>
                </a>
                <div className="header-text">
                    <h1>Activities</h1>
                    <Navigation/>
                </div>
            </header>
            <div className="main">
                <div className="main-content">
                {/* Source: Instructor Provided */}
                    <h2>Overview</h2>
                    <p>
                        There are plenty of activities, such as live music and entertainment
                        events, that are added to the festive atmosphere. Most entertainment
                        activities are Located at the Bernie Milton Pavilion.
                    </p>
                    <h2>Saturday</h2>
                    <ul>
                        <li>12 PM Ageless Jazz Band</li>
                        <li>1 PM Motherwort</li>
                        <li>2 PM Running To Places Theatre Company</li>
                        <li>3 PM Jill McCracken</li>
                        <li>4 PM Harry Nichols</li>
                        <li>5 PM Fall Creek Brass Band</li>
                    </ul>
                    <h2>Sunday</h2>
                    <ul>
                        <li>12 PM Caviar and Grits</li>
                        <li>1 PM Fusebox</li>
                        <li>2 PM The X’plozionz</li>
                        <li>3 PM The Pelotones</li>
                        <li>4 PM Cast Iron Cowboys</li>
                        <li>5 PM Felix Free and the Rxcketeers</li>
                    </ul>
                    <picture className="fit-page">
                        {/* Source: Instructor Provided */}
                        <img src="images/applefest-event.jpg" alt="applefest event" />
                    </picture>
                </div>
                <Aside />
            </div>
            <Footer />
        </>
    )
}
