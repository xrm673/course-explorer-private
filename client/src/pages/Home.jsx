import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Aside from '../components/Aside'

export default function Home() {
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
                <h1>Ithaca Apple Harvest Festival</h1>
                <Navigation/>
            </div>
        </header>

        <div className="main">
            <div className="main-content">
                <section>
                    {/*Source: Instructor Provided*/}
                    <h2>Welcome!</h2>
                    <p>
                        <strong>The 42nd Annual Apple Harvest Festival presented by the Downtown Ithaca Alliance this fall, September 27th - September 29th.</strong>
                    </p>
                    <p>
                        We are excited to welcome you back to one of Ithaca’s most celebrated events: the Apple Harvest Festival! Join us for three days of farm-fresh bites, local crafts, live music, and fall activities for all ages.
                    </p>
                    <p>
                        Apple Harvest Festival will host plenty of farmstand fresh apples and produce, delectable apple and seasonal baked goods, a variety of food trucks offering tasty bites, and a craft fair with artisans from around the region. There will also be live music and entertainment, plus a cider trail to enjoy refreshing cider in store and plenty of great apple and apples-inspired products for sale inside shops in and around Downtown.
                    </p>
                    <picture className="fit-page">
                        {/*Source: Instructor Provided*/}
                        <img src="images/apple-vendors.jpg" alt="apple fest scene" />
                    </picture>
                </section>

                <h2>Time</h2>
                <div className="time-table">
                    {/*Source: Instructor Provided*/}
                    <div className="column">
                        <h3>Friday</h3>
                        <h4>September 27</h4>
                        <p>12PM - 6PM</p>
                    </div>
                    <div className="column">
                        <h3>Saturday</h3>
                        <h4>Septermber 28</h4>
                        <p>10AM - 6PM</p>
                    </div>
                    <div className="column">
                        <h3>Sunday</h3>
                        <h4>Septermber 29</h4>
                        <p>10AM - 6PM</p>
                    </div>
                </div>
                <section>
                    {/*Source: Instructor Provided*/}
                    <h2>Location</h2>
                    <p>Located on the Ithaca Commons</p>
                    <figure className="fit-page">
                        {/*Source: https://www.apartments.com/city-centre-ithaca-ithaca-ny/sr36tk4/*/}
                        <img src="images/downtown_map.png" alt="apple fest map" />
                    </figure>

                    <h2>Parking</h2>
                    <p>
                        Garage parking is $1.00 per hour in the garages. On-street parking is $1.50 per hour during the week until 6pm.
                    </p>
                    <p>
                        For additional downtown parking, please click <a href="https://www.cityofithaca.org/243/">here</a>.
                    </p>
                </section>
            </div>
            <Aside />
        </div>
        <Footer />
    </>
  )
}
