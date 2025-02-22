import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Aside from '../components/Aside'

export default function Vendors(){
    return (
        <>
            <header>
                <a href="index">
                <picture className="logo">
                    {/*Instructor Provided*/}
                    <img src="images/apple-harvest-logo.svg" alt="apple fest logo" />
                </picture>
                </a>
                <div className="header-text">
                    <h1>Vendors</h1>
                    <Navigation />
                </div>
            </header>
            <div className="main">
                <div className="main-content">
                    <section>
                        {/* Source: Instructor Provided */}
                        <h2>Overview</h2>
                        <p>
                        With over 100 vendors present at the festival, there are many
                        opportunities to be introduced to the rich artisan and culinary
                        community in Ithaca. Our food vendors feature apple-centric and other
                        fall classics for you to taste, and the craft vendors offer homemade
                        goods like soaps, jewelry, sculptures, clothing, and more! This is the
                        perfect place to learn about and support Ithaca&apos;s small businesses
                        that encompass the heart of the town.
                        </p>
                        <figure className="fit-page">
                        {/* Source: Instructor Provided */}
                            <img src="images/apple-harvest-map.svg" alt="apple fest map" />
                        </figure>
                        <h2>Farm Fresh Apples &amp; Produce</h2>
                        <ul>
                            <li>Schweigarts Sugar Shack</li>
                            <li>Schoolyard Sugarbush</li>
                            <li>A J Teeterfarm</li>
                            <li>Littletree Orchards</li>
                            <li>Creamcycle</li>
                            <li>Maple River Syrup Company</li>
                            <li>MacDonald Farms</li>
                            <li>Cornell Society of Horticulture</li>
                            <li>Laughing Goat Fiber Farm</li>
                            <li>Robbie’s Produce</li>
                            <li>Picaflor Farm</li>
                            <li>Little Farm Bakery</li>
                            <li>Little Grey Bakery</li>
                            <li>Mojo Hot Sauce</li>
                        </ul>
                        <picture className="fit-page">
                        {/* Source: Instructor Provided */}
                            <img src="images/vendor-stall.jpg" alt="apple vendor" />
                        </picture>
                        <h2>Cider Houses &amp; Wineries</h2>
                        <ul>
                            <li>Blackduck Cidery</li>
                            <li>Redbyrd Orchard</li>
                            <li>South Hill Cider</li>
                            <li>New Leaf Cider Co.</li>
                            <li>Thousand Islands Winery</li>
                            <li>Finger Lakes Cider House</li>
                            <li>New York Cider Company</li>
                            <li>Eve&apos;s Cidery</li>
                            <li>Ashley Lynn Winery</li>
                            </ul>
                            <picture className="fit-page">
                            {/* Source: Instructor Provided */}
                            <img src="images/apple-cider.jpg" alt="apple cidar" />
                            </picture>
                            <h2>Food Vendors</h2>
                            <ul>
                            <li>Macarollin</li>
                            <li>Mr. Squeeze Lemonade</li>
                            <li>Kettle Corn Shoppe</li>
                            <li>SPM Empanadas</li>
                            <li>Fittnell Barbeque</li>
                            <li>Tibetan Momo Bar</li>
                            <li>Travelers Kitchen</li>
                            <li>Asempe Kitchen</li>
                            <li>Vail Bros inc</li>
                            <li>On The Street Pitas</li>
                            <li>Silo Food Truck</li>
                            <li>B&amp;B Kettle Korn</li>
                            <li>Robbie’s Produce</li>
                            <li>PDRS Catering</li>
                            <li>Trini Style</li>
                            <li>Coltivare</li>
                            <li>She Messy Tacos</li>
                            <li>Adam Grill</li>
                            <li>Thai Basil</li>
                            <li>Zocalo</li>
                        </ul>
                        <picture className="fit-page">
                        {/* Source: Instructor Provided */}
                            <img src="images/applepies.jpg" alt="apple pies" />
                        </picture>
                    </section>
                </div>
                <Aside />
            </div>
            <Footer />
        </>
    )
}
