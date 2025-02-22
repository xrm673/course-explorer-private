import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Aside from '../components/Aside'

export default function Traditions(){
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
                    <h1>Traditions</h1>
                    <Navigation />
                </div>
            </header>
            <div className="main">
                <div className="main-content">
                {/* Source: Instructor Provided */}
                    <h2>Tradition</h2>
                    <p>
                        The Apple Harvest Festival, held annually in downtown Ithaca, is a
                        beloved community event celebrating the bounty of the fall season.
                        Featuring local farmers, artisans, and vendors, the festival offers a
                        vibrant array of delicious apple-themed treats, fresh produce, unique
                        crafts, and live entertainment.
                    </p>
                    <p>
                        Visitors can enjoy farmstand fresh apples, seasonal baked goods, diverse
                        food trucks, and a craft fair showcasing regional artisans. Live music
                        and entertainment add to the festive atmosphere, while downtown shops
                        offer great apple-inspired products. This family-friendly event draws
                        visitors from near and far to savor seasonal flavors and experience the
                        charm of Ithaca in autumn.
                    </p>
                    <p>
                        This annual festival marks the beginning of the fall harvest season, and
                        features local apples and the Finger Lakes food, craft, and
                        entertainment community! The weekend&apos;s happenings gives Ithaca
                        residents, students, and visitors an opportunity to interact with small
                        businesses and creators in the area. Welcome fall with us by visiting
                        one of Ithaca&apos;s most famous events!
                    </p>
                    <picture className="fit-page">
                        {/*Instructor Provided*/}
                        <img src="images/apples-bins.jpg" alt="Apples Bins" />
                    </picture>
                    <h2>History</h2>
                    <p>
                        Since 1982, the Ithaca Apple Harvest Festival hosts apples, baked goods,
                        family entertainment, games, prizes, live entertainment and more. Over
                        100 talented artists, crafters, bakers, and makers come together for the
                        Apple Harvest Craft Fair! Find creative, unique works from clothing to
                        woodworking, ceramics to paintings, fudge to essential oils and beyond
                        throughout the festival. The festival is held in the Ithaca Commons, a
                        few streets that are full of restaurants and shops.
                    </p>
                    <picture className="fit-page">
                        {/*Instructor Provided*/}
                        <img src="images/commons-far.jpg" alt="Ithaca Commons" />
                    </picture>
                </div>
                <Aside />
            </div>
            <Footer />
        </>
    )
}
