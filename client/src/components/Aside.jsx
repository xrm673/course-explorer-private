export default function Aside(){
    return (
        <aside>
        {/*Source: Instructor Provided*/}
            <h2>Time</h2>
            <div className="time">
                <div className="day">
                    <h3>Friday</h3>
                    <h4>September 27</h4>
                    <p>12PM - 6PM</p>
                </div>

                <div className="day">
                    <h3>Saturday</h3>
                    <h4>Septermber 28</h4>
                    <p>10AM - 6PM</p>
                </div>

                <div className="day">
                    <h3>Sunday</h3>
                    <h4>Septermber 29</h4>
                    <p>10AM - 6PM</p>
                </div>
            </div>

            <div className="loc">
                <h2>Location</h2>
                <p>Ithaca Commons (Downtown Ithaca)</p>
                <p>Ithaca, NY, 14850</p>
            </div>
        </aside>
    )
}
