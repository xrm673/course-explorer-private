import MajorText from "./MajorText"

export default function MajorsInCollege({ college }) {
    const majors = college.majors
    return(
        <div style={{"marginBottom":"30px"}}>
            <h3>{ college.name }</h3>
            {
                majors.map((majorCode, i) => (
                    <MajorText key={i} majorCode={ majorCode } />
                ))
            }
        </div>
    )
}